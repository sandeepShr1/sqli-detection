import React, { useState } from 'react'
import "./Sidebar.css";
import { Link } from "react-router-dom";
import { Collapse, List, ListItemButton, ListItemText } from "@mui/material";
import {
      ExpandMore, PostAdd, Add,
      ListAlt, ImportExport, Dashboard,
      People, RateReview, DescriptionOutlined
} from "@mui/icons-material";
import logo from "../../images/logo.png"

const Sidebar = () => {
      const [productsOpen, setProductsOpen] = useState(false);
      const [bannersOpen, setBannersOpen] = useState(false);

      return (
            <div className="sidebar">
                  <Link to="/">
                        <img src={logo} alt="Ecommerce" />
                  </Link>
                  <Link to="/admin/dashboard">
                        <p>
                              <Dashboard /> Dashboard
                        </p>
                  </Link>
                  <div className='p'>
                        <ListItemButton onClick={() => setProductsOpen(!productsOpen)}>
                              <ListItemText primary="Products" />
                              {productsOpen ? <ExpandMore /> : <ImportExport />}
                        </ListItemButton>
                        <Collapse in={productsOpen} timeout="auto" unmountOnExit>
                              <List component="div" disablePadding>
                                    <Link to="/admin/products">
                                          <ListItemButton sx={{ pl: 4 }}>
                                                <PostAdd fontSize="small" style={{ marginRight: 8 }} />
                                                <ListItemText primary="All" />
                                          </ListItemButton>
                                    </Link>
                                    <Link to="/admin/product">
                                          <ListItemButton sx={{ pl: 4 }}>
                                                <Add fontSize="small" style={{ marginRight: 8 }} />
                                                <ListItemText primary="Create" />
                                          </ListItemButton>
                                    </Link>
                              </List>
                        </Collapse>
                  </div>

                  <Link to="/admin/orders">
                        <p>
                              <ListAlt />
                              Orders
                        </p>
                  </Link>
                  <Link to="/admin/users">
                        <p>
                              <People /> Users
                        </p>
                  </Link>
                  <Link to="/admin/logs">
                        <p>
                              <DescriptionOutlined /> Logs
                        </p>
                  </Link>
                  <Link to="/admin/reviews">
                        <p>
                              <RateReview />
                              Reviews
                        </p>
                  </Link>
                  <div className='p'>
                        <ListItemButton onClick={() => setBannersOpen(!bannersOpen)}>
                              <ListItemText primary="Banners" />
                              {bannersOpen ? <ExpandMore /> : <ImportExport />}
                        </ListItemButton>
                        <Collapse in={bannersOpen} timeout="auto" unmountOnExit>
                              <List component="div" disablePadding>
                                    <Link to="/admin/banners">
                                          <ListItemButton sx={{ pl: 4 }}>
                                                <PostAdd fontSize="small" style={{ marginRight: 8 }} />
                                                <ListItemText primary="All" />
                                          </ListItemButton>
                                    </Link>
                                    <Link to="/admin/banner">
                                          <ListItemButton sx={{ pl: 4 }}>
                                                <Add fontSize="small" style={{ marginRight: 8 }} />
                                                <ListItemText primary="Create" />
                                          </ListItemButton>
                                    </Link>
                              </List>
                        </Collapse>
                  </div>
            </div>
      )
}

export default Sidebar