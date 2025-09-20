import actionTypes from "../actionTypes";

const initial = {
  loading:{},
  data: {}, 
  error: {},
};

const postConvertReducer = (state = initial, action) => {
  switch (action.type) {
    case actionTypes.POST_CONVERT_REQUEST:
      return { 
        ...state, 
        loading: { ...state.loading, [action.requestKey]: true },
        error: { ...state.error, [action.requestKey]: null }
      };

    case actionTypes.POST_CONVERT_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, [action.requestKey]: false },
        data: { ...state.data, [action.requestKey]: action.payload.result || action.payload },
        error: { ...state.error, [action.requestKey]: null },
      };

    case actionTypes.POST_CONVERT_FAILURE:
    case actionTypes.POST_CONVERT_FAILURE_INVALID:
      return {
        ...state,
        loading: { ...state.loading, [action.requestKey]: false },
        error: { ...state.error, [action.requestKey]: action.payload },
      };

    default:
      return state;
  }
};

export default postConvertReducer;
