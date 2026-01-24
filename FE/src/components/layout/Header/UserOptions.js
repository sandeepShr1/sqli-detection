import React, { useState } from 'react';
import "./Navbar.css";
import { useNavigate } from "react-router-dom"
import { Menu, MenuItem, Avatar, IconButton } from "@mui/material";
import { Dashboard, Person, ExitToApp, ListAlt } from "@mui/icons-material";
import { useAlert } from "react-alert";
import { logout } from '../../../redux/actions/userActions';
import { Backdrop } from '@mui/material';
import { ShoppingCart } from "@mui/icons-material"
import { useDispatch, useSelector } from "react-redux"

const UserOptions = ({ user: users }) => {
      const { user } = useSelector((state) => state.user);
      const { cartItems } = useSelector(state => state.cart);
      const [anchorEl, setAnchorEl] = useState(null);
      const history = useNavigate();
      const alert = useAlert();
      const dispatch = useDispatch();
      const open = Boolean(anchorEl);

      const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
      };

      const handleClose = () => {
            setAnchorEl(null);
      };

      const options = [
            { icon: <Person />, name: "Profile", func: account },
            { icon: <ShoppingCart style={{ color: cartItems.length > 0 ? "tomato" : "unset" }} />, name: `Cart(${cartItems.length})`, func: cart },
            { icon: <ListAlt />, name: "Orders", func: orders },
            { icon: <ExitToApp />, name: "Logout", func: logoutUser },
      ]

      if (user && user.role === "0") {
            options.unshift({
                  icon: <Dashboard />,
                  name: "Dashboard",
                  func: dashboard
            })
      }

      function dashboard() {
            handleClose();
            history("/admin/dashboard")
      }
      function account() {
            handleClose();
            history("/account")
      }
      function cart() {
            handleClose();
            history("/cart")
      }
      function orders() {
            handleClose();
            history("/orders")
      }

      function logoutUser() {
            handleClose();
            dispatch(logout());
            alert.success("Logout Successfully");
            localStorage.removeItem("token")
            history('/')
      }


      return (
            <>
                  <IconButton
                        onClick={handleClick}
                        aria-controls={open ? 'user-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        style={{position:"absolute", right:0}}
                  >
                        <Avatar
                              src={user?.user?.avatar?.url || "/Profile.png"}
                              alt="Profile"
                              sx={{ width: 40, height: 40 }}
                        />
                  </IconButton>
                  <Menu
                        id="user-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                              'aria-labelledby': 'user-button',
                        }}
                  >
                        {options.map((item) => (
                              <MenuItem key={item.name} onClick={item.func}>
                                    {item.icon}
                                    <span style={{ marginLeft: 10 }}>{item.name}</span>
                              </MenuItem>
                        ))}
                  </Menu>
            </>
      )
}

export default UserOptions