import actionTypes from "../actionTypes";

const initial = {
  loading:{},
  data: {}, 
  error: {},
};

const postAccessReadReducer = (state = initial, action) => {
  switch (action.type) {
    case actionTypes.POST_ACCESSREAD_REQUEST:
      return { 
        ...state, 
        loading: { ...state.loading, [action.requestKey]: true },
        error: { ...state.error, [action.requestKey]: null }
      };

    case actionTypes.POST_ACCESSREAD_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, [action.requestKey]: false },
        data: { ...state.data, [action.requestKey]: action.payload.result || action.payload },
        error: { ...state.error, [action.requestKey]: null },
      };

    case actionTypes.POST_ACCESSREAD_FAILURE:
    case actionTypes.POST_ACCESSREAD_FAILURE_INVALID:
      return {
        ...state,
        loading: { ...state.loading, [action.requestKey]: false },
        error: { ...state.error, [action.requestKey]: action.payload },
      };

    default:
      return state;
  }
};

export default postAccessReadReducer;
