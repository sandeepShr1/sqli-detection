import * as actionTypes from "../constants/notificationConstants"
import axios from "../../utils/axios";



// get all my notifications
export const getMyNotifications = (user_id) => async (dispatch) => {
      try {
            dispatch({
                  type: actionTypes.ALL_NOTIFICATIONS_REQUEST
            })
            const { data } = await axios.get(`/api/v1/notifications/user/${user_id}`);

            dispatch({
                  type: actionTypes.ALL_NOTIFICATIONS_SUCCESS,
                  payload: data.notifications
            })

      } catch (error) {
            dispatch({
                  type: actionTypes.CLEAR_ERRORS,
                  payload: error.response.data.message,
            });
      }
}

// export const getNotificationAlert = () => async (dispatch) => {
//       try {
//             dispatch({
//                   type: actionTypes.ALL_NOTIFICATIONS_ALERT_REQUEST
//             })
//             const { data } = await axios.get("/api/v1/notifications/admin/events");

//             dispatch({
//                   type: actionTypes.ALL_NOTIFICATIONS_ALERT_SUCCESS,
//                   payload: data.notifications
//             })

//       } catch (error) {
//             dispatch({
//                   type: actionTypes.CLEAR_ERRORS,
//                   payload: error.response.data.message,
//             });
//       }
// }
// get a notifications  details
// export const getNotificationsDetails = () => async (dispatch) => {
//       try {
//             dispatch({
//                   type: actionTypes.LOGS_DETAILS_REQUEST
//             })
//             // /admin/attacks/stats

//             const { data } = await axios.get(`/api/v1/admin/attacks/stats`);
//             console.log(data)
//             dispatch({
//                   type: actionTypes.LOGS_DETAILS_SUCCESS,
//                   payload: data.stats
//             })

//       } catch (error) {
//             dispatch({
//                   type: actionTypes.LOGS_DETAILS_FAIL,
//                   payload: error.response.data.message,
//             });
//       }
// }



// Clearing Errors
export const clearError = () => async (dispatch) => {
      dispatch({ type: actionTypes.CLEAR_ERRORS });
};