// sagas/odoo.Saga.js
import { call, put } from "redux-saga/effects";
import actionTypes from "../actionTypes";
import { ApiMethod, API } from "../../services/Apicall";


function* odooCallSaga(action) {
  try {
    const { model, method, args = [], kwargs = {}, requestKey } = action.payload;

    const response = yield call(
      ApiMethod.POST_JSONRPC,
      API.postcreatevisit,
      model,
      method,
      args,
      kwargs
    );

    // success path: store result under requestKey (or model if no requestKey)
    if (response?.status === 200) {
      const data = response?.data?.result ?? response?.data;
      yield put({
        type: actionTypes.ODOO_CALL_SUCCESS,
        payload: { model, data, requestKey },
      });
    } else {
      yield put({
        type: actionTypes.ODOO_CALL_FAILURE,
        payload: { error: "BAD REQUEST", model, requestKey },
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.ODOO_CALL_FAILURE,
      payload: { error: err.message || "INTERNAL SERVER ERROR" },
    });
  }
}

export default odooCallSaga;
