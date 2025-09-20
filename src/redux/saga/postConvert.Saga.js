import { call, put } from "redux-saga/effects";
import { ApiMethod, endPoint } from "../../services/Apicall";
import actionTypes from "../actionTypes";

function* postConvertSaga(action) {
  console.log('ACTION', action);
  try {
    const { payload, requestKey } = action;
console.log("payload", payload);
    const response = yield call(
      ApiMethod.POST,
      endPoint.postconvert,
      payload
    );
    console.log("response",response)
    if (response?.status === 200 && response?.data?.result) {
      yield put({
        type: actionTypes.POST_CONVERT_SUCCESS,
        payload: response?.data?.result,
        requestKey,
      });
    } else {
      yield put({
        type: actionTypes.POST_CONVERT_FAILURE,
        payload: "BAD REQUEST",
        requestKey,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.POST_CONVERT_FAILURE_INVALID,
      payload: err.message || "INTERNAL SERVER ERROR",
    });
  }
}



export default postConvertSaga;
