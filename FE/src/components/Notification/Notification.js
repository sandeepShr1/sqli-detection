import "./Notification.css";
import { Link, useNavigate } from "react-router-dom"
import { addToCart, removeFromCart } from "../../redux/actions/cartActions"
import { useDispatch, useSelector } from "react-redux";
import Typography from '@mui/material/Typography';
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart"
import MetaData from '../layout/MetaData';
import { getMyNotifications } from "../../redux/actions/notificationActions";
import { useEffect } from "react";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TimeAgo from 'react-timeago';
import * as actionTypes from '../../redux/constants/notificationConstants';
import { jwtDecode } from "jwt-decode";
import NotificationsIcon from '@mui/icons-material/Notifications';



const Notification = () => {
      const { notifications } = useSelector(state => state.notifications)
      const { unreadNotifications, unreadCount } = useSelector(state => state.sseNotifications)
      const dispatch = useDispatch();
      const token = localStorage.getItem('token');
      const decoded = token && jwtDecode(token);
      const isAuthenticated = !!token;


      useEffect(() => {
            if (isAuthenticated) {
                  dispatch(getMyNotifications(decoded.user.id));
            }

            // Mark SSE notifications as read when component is viewed
            if (unreadCount > 0) {
                  dispatch({
                        type: actionTypes.SSE_NOTIFICATION_MARK_READ
                  });
            }

            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);




      const renderSSENotification = (sseData) => {
            return <div className="notify_details">
                  <p className="notification-title">{sseData.confidence >= 0.8 ? "High" : "Medium"}: {sseData.attackType} Detected!!!</p>
                  <p>Attack Type: {sseData.attackType}</p>
                  <div className="notify_sub_details">
                        <p className="">Severity: <span className={`custom__radio ${sseData?.Confidence >= 0.8 ? "high" : "medium"} `}>{sseData?.Confidence >= 0.8 ? "High" : "Medium"}</span> </p>
                        <p>Field: {sseData.field}</p>
                        <p>IP: {sseData.ip}</p>
                        <p>Payload: {sseData.payload}</p>
                  </div>
            </div>
      }

      const renderMessage = (message) => {
            try {
                  const parsedMessage = JSON.parse(message);
                  return <div className="notify_details">
                        <p className="notification-title">{parsedMessage?.Confidence >= 0.8 ? "High" : "Medium"}: {parsedMessage.attackType} Detected!!!</p>
                        <p>Attack Type: {parsedMessage.attackType}</p>
                        <div className="notify_sub_details">
                              <p className="">Severity: <span className={`custom__radio ${parsedMessage?.Confidence >= 0.8 ? "high" : "medium"} `}>{parsedMessage?.Confidence >= 0.8 ? "High" : "Medium"}</span> </p>
                              <p>Field: {parsedMessage.field}</p>
                              <p>IP: {parsedMessage.ip}</p>
                              <p>Payload: {parsedMessage?.payload}</p>
                        </div>
                  </div>
            } catch (error) {
                  return <div className="notify_details">
                        <p>{message}</p>
                  </div>
            }
      }

      // Combine SSE notifications with regular notifications
      const allNotifications = [
            ...unreadNotifications.map(n => ({ ...n, isSSE: true })),
            ...notifications.map(n => ({ ...n, isSSE: false }))
      ];

      console.log({ allNotifications })


      return (
            <>
                  <MetaData title="Notifications" />
                  {allNotifications.length === 0 ? (
                        <div className="emptyCart">
                              <NotificationsIcon />
                              <Typography >No Notifications</Typography>
                              {/* <Link to="/products">View Products</Link> */}
                        </div>
                  ) : (
                        <>
                              <div class="notifications-container wave-animation">
                                    {allNotifications.map((notify, index) => {
                                          const parsedMessage = !notify.isSSE && JSON.parse(notify?.message || {});
                                          return <div key={index} className={`notification ${parsedMessage?.Confidence >= 0.8 ? "critical" : "appointment"}  unread`} datatype="critical">
                                                <div className={`notification-icon ${parsedMessage?.Confidence >= 0.8 ? "critical" : "appointment"}`}>
                                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                      </svg>
                                                </div>
                                                <div className="notification-content">
                                                      <p className="notification-body">{notify.isSSE ? renderSSENotification(notify) : renderMessage(notify.message)}</p>
                                                      <div className="notification-time"> <TimeAgo date={notify.isSSE ? notify.timestamp : notify.createdAt} /></div>
                                                      <span className={`notifications-badge badge ${parsedMessage?.Confidence >= 0.8 ? "critical" : "appointment"}`}>{parsedMessage?.Confidence >= 0.8 ? "High" : "Medium"}</span>

                                                </div>
                                          </div >
                                    }
                                    )}
                              </div>


                        </>
                  )
                  }
            </>
      )
}

export default Notification