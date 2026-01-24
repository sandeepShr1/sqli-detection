import * as actionTypes from "../constants/logsConstants";


export const myLogsReducer = (state = { logs: [] }, action) => {
      switch (action.type) {
            case actionTypes.MY_LOGS_REQUEST:
                  return {
                        ...state,
                        loading: true
                  }
            case actionTypes.MY_LOGS_SUCCESS:
                  return {
                        loading: false,
                        logs: action.payload
                  }

            case actionTypes.MY_LOGS_FAIL:
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


export const myLogsDetailsReducer = (state = { logsDetails: {} }, action) => {
      switch (action.type) {
            case actionTypes.LOGS_DETAILS_REQUEST:
                  return {
                        ...state,
                        loading: true
                  }

            case actionTypes.LOGS_DETAILS_SUCCESS:
                  return {
                        loading: false,
                        logsDetails: action.payload
                  }

            case actionTypes.LOGS_DETAILS_FAIL:
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

