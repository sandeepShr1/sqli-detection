import React, { useEffect, useState } from 'react';
import "./Navbar.css"
import { NavLink, Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector } from 'react-redux';
import NotificationsIcon from '@mui/icons-material/Notifications';
import useSSENotifications from '../../../utils/useSSENotifications';
import { jwtDecode } from 'jwt-decode';



const Navbar = () => {
      const [keyword, setKeyword] = useState("");
      const [open, setOpen] = useState(false);
      const history = useNavigate();
      const { cartItems } = useSelector(state => state.cart);
      const { user } = useSelector(state => state.user);
      const { unreadCount, isConnected } = useSelector(state => state.sseNotifications);

      const token = localStorage.getItem('token');
      const decoded = token && jwtDecode(token);
      const isAuthenticated = !!token;
      console.log(decoded)

      // Check if user is admin (userType "2")
      const isAdmin = isAuthenticated && decoded?.user?.role === "0";

      // Initialize SSE connection for admin users
      const { markAsRead } = useSSENotifications(isAdmin);

      const clearInput = () => {
            setKeyword("")
            history("/products")
      }

      const searchSubmitHandler = (e) => {
            e.preventDefault();
            if (keyword.trim()) {
                  history(`/products/${keyword}`)
            }
            else {
                  history("/products")
            }
      }

      const handleClick = () => {
            setOpen(!open);
      };

      const closeMenu = () => {
            setOpen(false);
      };

      const handleNotificationClick = () => {
            // Mark notifications as read when user clicks on notification icon
            if (unreadCount > 0) {
                  markAsRead();
            }
            closeMenu();
      };

      return (
            <div className="header">
                  <div className="container">

                        <div className="navbar">
                              <p className="logo">
                                    <Link to="/">DIGITAL MART</Link>
                              </p>
                              <div onClick={handleClick} className="nav-icon">
                                    {open ? <CloseIcon /> : <MenuIcon />}
                              </div>
                              <div className={open ? 'nav-links active' : 'nav-links'}>
                                    <div className='nav'>
                                          <ul >
                                                <li> <NavLink className={({ isActive }) => (isActive ? 'active' : 'inactive')} onClick={closeMenu} to="/">Home</NavLink> </li>
                                                <li> <NavLink className={({ isActive }) => (isActive ? 'active' : 'inactive')} onClick={closeMenu} to="/products">Products</NavLink> </li>
                                                <li> <NavLink className={({ isActive }) => (isActive ? 'active' : 'inactive')} onClick={closeMenu} to="/about">About</NavLink> </li>

                                          </ul>
                                    </div>
                                    <div className="ic">

                                          <NavLink className={({ isActive }) => (isActive ? 'active' : 'inactive')} onClick={closeMenu} to="/login" ><PersonIcon /></NavLink>
                                          <NavLink
                                                className={({ isActive }) => (isActive ? 'active cart-icon' : 'inactive cart-icon')}
                                                onClick={handleNotificationClick}
                                                to="/notification"
                                          >
                                                <NotificationsIcon />
                                                {unreadCount > 0 && (
                                                      <span className='notification-badge'>
                                                            {unreadCount > 99 ? '99+' : unreadCount}
                                                      </span>
                                                )}
                                          </NavLink>
                                          <NavLink className={({ isActive }) => (isActive ? 'active cart-icon' : 'inactive cart-icon')} onClick={closeMenu} to="/cart" ><ShoppingCartIcon />
                                                <span className='cart-item-qty'>
                                                      {cartItems && cartItems.length}
                                                </span>
                                          </NavLink>

                                    </div>
                              </div>
                        </div>
                        <div className="search-container">
                              <div className="wrap">
                                    <form className='search' onSubmit={searchSubmitHandler} >
                                          <input type="text" className='searchTerm'
                                                name="keyword"
                                                value={keyword}
                                                placeholder='Search for a product'
                                                onChange={(e) => setKeyword(e.target.value)}
                                          />
                                          {keyword?.length > 0 && <button type="submit" onClick={clearInput} className="clearButton">
                                                <CloseIcon />
                                          </button>}
                                          <button type="submit" onClick={closeMenu} className="searchButton">
                                                <SearchIcon />
                                          </button>
                                    </form>
                              </div>
                        </div>
                  </div >
            </div >
      )
}

export default Navbar