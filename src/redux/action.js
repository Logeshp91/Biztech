import actionTypes from "./actionTypes";

export const postauthendication = (payload,results,) => ({
  type: actionTypes.POST_POSTAUTHENDICATION_REQUEST,
  payload,results
});
export const postcreatevisit = (payload, requestKey) => {
  return {
    type: actionTypes.POST_CREATEVISIT_REQUEST,
    payload,
    requestKey,
  };
};
export const postAccessRead = (payload, requestKey) => {
  console.log("Dispatching postcreatevisit action with payload:", payload, "requestKey:", requestKey);
  return {
    type: actionTypes.POST_ACCESSREAD_REQUEST,
    payload,
    requestKey,
  };
};

export const postConvert = (payload, requestKey) => {
  console.log("Dispatching postcreatevisit action with payload:", payload, "requestKey:", requestKey);
  return {
    type: actionTypes.POST_CONVERT_REQUEST,
    payload,
    requestKey,
  };
};

export const odooCallRequest = ({ model, method, args = [], kwargs = {}, requestKey }) => ({
  type: actionTypes.ODOO_CALL_REQUEST,
  payload: { model, method, args, kwargs, requestKey },
})

export const clearLoginFields = () => ({ type: actionTypes.CLEAR_LOGIN_FIELDS, });

