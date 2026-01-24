import * as actionTypes from "../constants/notificationConstants";


export const myNotificationsReducer = (state = { notifications: [] }, action) => {
      switch (action.type) {
            case actionTypes.ALL_NOTIFICATIONS_REQUEST:
                  return {
                        ...state,
                        loading: true
                  }
            case actionTypes.ALL_NOTIFICATIONS_SUCCESS:
                  return {
                        loading: false,
                        notifications: action.payload
                  }

            case actionTypes.ALL_NOTIFICATIONS_FAIL:
                  return {
                        loading: false,
                        error: action.payload
                  }
            case actionTypes.CLEAR_ERRORS:
                  return {
                        ...state,
                        error: null,
                  };


            default:
                  return state;
      }
}

// SSE Notifications Reducer
export const sseNotificationsReducer = (state = {
      unreadNotifications: [],
      unreadCount: 0,
      isConnected: false
}, action) => {
      switch (action.type) {
            case actionTypes.SSE_NOTIFICATION_RECEIVED:
                  return {
                        ...state,
                        unreadNotifications: [action.payload, ...state.unreadNotifications],
                        unreadCount: state.unreadCount + 1
                  }

            case actionTypes.SSE_NOTIFICATION_MARK_READ:
                  return {
                        ...state,
                        unreadNotifications: [],
                        unreadCount: 0
                  }

            case actionTypes.SSE_NOTIFICATION_CLEAR_ALL:
                  return {
                        ...state,
                        unreadNotifications: [],
                        unreadCount: 0
                  }

            case actionTypes.SSE_CONNECTION_STATUS:
                  return {
                        ...state,
                        isConnected: action.payload
                  }

            default:
                  return state;
      }
}


// export const myNotificationsDetailsReducer = (state = { notificationsDetails: {} }, action) => {
//       switch (action.type) {
//             case actionTypes.LOGS_DETAILS_REQUEST:
//                   return {
//                         ...state,
//                         loading: true
//                   }

//             case actionTypes.LOGS_DETAILS_SUCCESS:
//                   return {
//                         loading: false,
//                         notificationsDetails: action.payload
//                   }

//             case actionTypes.LOGS_DETAILS_FAIL:
//                   return {
//                         loading: false,
//                         error: action.payload
//                   }
//             case actionTypes.CLEAR_ERRORS:
//                   return {
//                         ...state,
//                         error: null,
//                   };


//             default:
//                   return state;
//       }
// }

