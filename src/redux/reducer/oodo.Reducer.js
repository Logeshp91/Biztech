import actionTypes from '../actionTypes';

const initialState = {
  loading: false,
  result: null,
  error: null,
};

const odooReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.ODOO_CALL_REQUEST:
      return { ...state, loading: true, error: null };

    case actionTypes.ODOO_CALL_SUCCESS:
      return { ...state, loading: false, result: action.payload };

    case actionTypes.ODOO_CALL_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default odooReducer;
