import { takeLatest } from "redux-saga/effects";
import actionType from "../actionTypes";
import postauthendicationSaga from "./postauthendication.Saga";
import postcreatevisitSaga from "./postcreatevisit.Saga";
import odooCallSaga from "./oodoCall.Saga";
import postAccessReadSaga from "./postAccessRead.Saga"; 
import postConvertSaga from "./postConvert.Saga";

export default function* (){
   
    yield takeLatest(actionType.POST_POSTAUTHENDICATION_REQUEST,postauthendicationSaga)
    yield takeLatest(actionType.POST_CREATEVISIT_REQUEST,postcreatevisitSaga)
    yield takeLatest(actionType.ODOO_CALL_REQUEST, odooCallSaga);
    yield takeLatest(actionType.POST_ACCESSREAD_REQUEST, postAccessReadSaga);
    yield takeLatest(actionType.POST_CONVERT_REQUEST, postConvertSaga);

}