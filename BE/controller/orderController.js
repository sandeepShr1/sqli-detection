const db = require("../db/models");
const Order = db.orders;
const OrderItem = db.order_items;
const Product = db.products;
const User = db.user;
const AppError = require("../utils/appError");
const catchAsyncError = require("../utils/catchAsync");

// Create a new order
const createOrder = catchAsyncError(async (req, res, next) => {
      const {
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
      } = req.body;

      // Create the order
      const order = await Order.create({
            userId: req.user.id,
            shippingAddress: shippingInfo.address,
            shippingCity: shippingInfo.city,
            shippingState: shippingInfo.state,
            shippingPinCode: shippingInfo.pinCode,
            shippingPhoneNo: shippingInfo.phoneNo,
            paymentId: paymentInfo?.id,
            paymentStatus: paymentInfo?.status,
            paidAt: Date.now(),
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
      });

      // Create order items
      const orderItemsData = orderItems.map(item => ({
            orderId: order.id,
            productId: item.product,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
      }));

      await OrderItem.bulkCreate(orderItemsData);

      res.status(200).json({
            success: true,
            order
      });
});

// Get single order
const getSingleOrder = catchAsyncError(async (req, res, next) => {
      const order = await Order.findByPk(req.params.id, {
            include: [
                  {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                  },
                  {
                        model: OrderItem,
                        as: 'orderItems'
                  }
            ]
      });

      if (!order) {
            return next(new AppError("Order not found with this Id", 404));
      }

      res.status(200).json({
            success: true,
            order
      });
});

// Get logged in user's orders
const myOrders = catchAsyncError(async (req, res, next) => {
      const orders = await Order.findAll({
            where: { userId: req.user.id },
            include: [{
                  model: OrderItem,
                  as: 'orderItems'
            }],
            order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
            success: true,
            orders
      });
});

// Get all orders - Admin
const getAllOrders = catchAsyncError(async (req, res, next) => {
      const orders = await Order.findAll({
            include: [
                  {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                  },
                  {
                        model: OrderItem,
                        as: 'orderItems'
                  }
            ],
            order: [['createdAt', 'DESC']]
      });

      let totalAmount = 0;
      orders.forEach(order => {
            totalAmount += parseFloat(order.totalPrice);
      });

      res.status(200).json({
            success: true,
            totalAmount,
            orders
      });
});

// Update order status - Admin
// const updateOrder = catchAsyncError(async (req, res, next) => {
//       const order = await Order.findByPk(req.params.id, {
//             include: [{
//                   model: OrderItem,
//                   as: 'orderItems'
//             }]
//       });

//       if (!order) {
//             return next(new AppError("Order not found!", 404));
//       }

//       if (order.orderStatus === "Delivered") {
//             return next(new AppError("You have already delivered this order", 400));
//       }

//       // Update stock when order is shipped
//       if (req.body.orderStatus === "Shipped") {
//             for (const item of order.orderItems) {
//                   await updateStock(item.productId, item.quantity);
//             }
//       }

//       order.orderStatus = req.body.status;

//       if (req.body.orderStatus === "Delivered") {
//             order.deliveredAt = Date.now();
//       }

//       await order.save();

//       res.status(200).json({
//             success: true,
//             order
//       });
// });
const updateOrder = catchAsyncError(async (req, res, next) => {
      const order = await Order.findByPk(req.params.id, {
            include: [{ model: OrderItem, as: 'orderItems' }]
      });

      if (!order) {
            return next(new AppError("Order not found!", 404));
      }

      if (order.orderStatus === "Delivered") {
            return next(new AppError("You have already delivered this order", 400));
      }

      const { orderStatus } = req.body;

      // Update stock when order is shipped
      if (orderStatus === "Shipped") {
            for (const item of order.orderItems) {
                  await updateStock(item.productId, item.quantity);
            }
      }

      order.orderStatus = orderStatus;

      if (orderStatus === "Delivered") {
            order.deliveredAt = Date.now();
      }

      await order.save();

      res.status(200).json({
            success: true,
            order
      });
});

// Helper function to update product stock
async function updateStock(productId, quantity) {
      const product = await Product.findByPk(productId);
      if (product) {
            product.stock = parseInt(product.stock) - quantity;
            await product.save();
      }
}

// Delete order - Admin
const deleteOrder = catchAsyncError(async (req, res, next) => {
      const order = await Order.findByPk(req.params.id);

      if (!order) {
            return next(new AppError("Order not found!", 404));
      }

      await order.destroy();

      res.status(200).json({
            success: true,
            message: "Order deleted successfully"
      });
});

module.exports = {
      createOrder,
      getSingleOrder,
      myOrders,
      getAllOrders,
      updateOrder,
      deleteOrder
};
