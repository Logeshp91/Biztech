import { call, put } from 'redux-saga/effects';
import { endPoint, ApiMethod } from "../../services/Apicall"; 
import actionTypes from "../actionTypes";

function* postauthendicationSaga(action) {
  console.log("action",action);
  
  try {
    const response = yield call(ApiMethod.POST, endPoint.postauthendication, action.payload);
        console.log("respons1",response);
    const data = response?.data ?? response;

    if (data?.result) {
      yield put({
        type: actionTypes.POST_POSTAUTHENDICATION_SUCCESS,
        payload: data.result,
       uid: data.result?.uid || null 
      });
    } else if (data?.error) {
      yield put({
        type: actionTypes.POST_POSTAUTHENDICATION_FAILURE,
        payload: data.error.message,
      });
    } else {
      yield put({
        type: actionTypes.POST_POSTAUTHENDICATION_FAILURE,
        payload: 'Authentication failed',
      });
    }
  } catch (err) {

    if (err.response?.status === 401) {
      yield put({
        type: actionTypes.POST_POSTAUTHENDICATION_FAILURE_INVALID,
        payload: 'Invalid credentials',
      });
    } else {
      yield put({
        type: actionTypes.POST_POSTAUTHENDICATION_FAILURE,
        payload: err.message || 'Server error',
      });
    }
  }
}
export default postauthendicationSaga;
