require("dotenv").config({ path: `${process.cwd()}/.env` })
const express = require("express");
const cors = require('cors');
const authRouter = require("./route/authRoute");
const productRouter = require("./route/productRoute");
const orderRouter = require("./route/orderRoute");
const bannerRouter = require("./route/bannerRoute");
const attackLogRouter = require("./route/attackLogRoute");
const notificationRouter = require("./route/notificationRoute");
const catchAsyncError = require("./utils/catchAsync");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");


const app = express();


app.use(express.json());

// Enhanced CORS configuration for SSE
app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:3001', "https://sqli-detection.vercel.app", "https://sqli-detection-c7q7n3u2v-sandeepshr1s-projects-e47c0dda.vercel.app"], // Add your frontend URLs
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Content-Type', 'Authorization']
}));


// all routes will be here
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/orders", orderRouter)
app.use("/api/v1/banners", bannerRouter)
app.use("/api/v1", attackLogRouter)
app.use("/api/v1/notifications", notificationRouter)

app.use('*all', catchAsyncError(async (req, res, next) => {
      throw new AppError(`Can't find ${req.originalUrl} on this server`, 404)
}))

app.use(globalErrorHandler)

const PORT = process.env.APP_PORT || 4000;
app.listen(PORT, () => {
      console.log(`Server up and running at: ${PORT}`)
})