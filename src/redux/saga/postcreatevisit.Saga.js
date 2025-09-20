import { call, put } from "redux-saga/effects";
import { ApiMethod, endPoint } from "../../services/Apicall";
import actionTypes from "../actionTypes";

function* postcreatevisitSaga(action) {
  try {
    const { payload, requestKey } = action;

    const response = yield call(
      ApiMethod.POST,
      endPoint.postcreatevisit,
      payload
    );
    console.log("response",response)
    if (response?.status === 200 && response?.data?.result) {
      yield put({
        type: actionTypes.POST_CREATEVISIT_SUCCESS,
        payload: response?.data?.result,
        requestKey,
      });
    } else {
      yield put({
        type: actionTypes.POST_CREATEVISIT_FAILURE,
        payload: "BAD REQUEST",
        requestKey,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.POST_CREATEVISIT_FAILURE_INVALID,
      payload: err.message || "INTERNAL SERVER ERROR",
    });
  }
}



export default postcreatevisitSaga;
