import * as actionTypes from "../constants/logsConstants"
import axios from "../../utils/axios";



// get all my logss
export const getMyLogs = () => async (dispatch) => {
      try {
            dispatch({
                  type: actionTypes.MY_LOGS_REQUEST
            })
            const { data } = await axios.get("/api/v1/admin/attacks");

            dispatch({
                  type: actionTypes.MY_LOGS_SUCCESS,
                  payload: data.logs
            })

      } catch (error) {
            dispatch({
                  type: actionTypes.MY_LOGS_FAIL,
                  payload: error.response.data.message,
            });
      }
}
// get a logss  details
export const getLogsDetails = () => async (dispatch) => {
      try {
            dispatch({
                  type: actionTypes.LOGS_DETAILS_REQUEST
            })
            // /admin/attacks/stats

            const { data } = await axios.get(`/api/v1/admin/attacks/stats`);
            console.log(data)
            dispatch({
                  type: actionTypes.LOGS_DETAILS_SUCCESS,
                  payload: data.stats
            })

      } catch (error) {
            dispatch({
                  type: actionTypes.LOGS_DETAILS_FAIL,
                  payload: error.response.data.message,
            });
      }
}



// Clearing Errors
export const clearError = () => async (dispatch) => {
      dispatch({ type: actionTypes.CLEAR_ERRORS });
};