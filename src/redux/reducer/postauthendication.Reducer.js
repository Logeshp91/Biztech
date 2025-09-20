import actionTypes from "../actionTypes";

const initial = {
    postauthendicationLoading: false,
    userToken: null,
    postauthendicationData: null,
    postauthendicationError: null,
    postauthendicationErrorInvalid: null,
    uid: null,
};

const postauthendicationReducer = (state = initial, action) => {
    switch (action.type) {
        case actionTypes.POST_POSTAUTHENDICATION_REQUEST:
            return {
                ...state,
                postauthendicationLoading: true,
                userToken: action.payload?.token || null,
            };

        case actionTypes.POST_POSTAUTHENDICATION_SUCCESS:
            return {
                ...state,
                postauthendicationLoading: false,
                postauthendicationData: action.payload,
                uid: action.payload?.uid || null,
                userToken: action.payload?.AccessToken || null,
                postauthendicationError: null,
                postauthendicationErrorInvalid: null,
            };

        case actionTypes.SET_AUTH_TOKEN:
            return {
                ...state,
                userToken: action.payload?.token || null,
                postauthendicationData: {
                    Data: action.payload?.userdata || null,
                },
            };

        case actionTypes.POST_POSTAUTHENDICATION_FAILURE:
            return {
                ...state,
                postauthendicationLoading: false,
                postauthendicationData: [],
                postauthendicationError: action.payload,
                userToken: null,
            };

        case actionTypes.POST_POSTAUTHENDICATION_FAILURE_INVALID:
            return {
                ...state,
                postauthendicationLoading: false,
                postauthendicationData: [],
                postauthendicationError: null,
                postauthendicationErrorInvalid: action.payload,
                userToken: null,
            };

case actionTypes.CLEAR_LOGIN_FIELDS:
  return {
    ...state,
    userToken: null,
    uid: null,
    postauthendicationError: null,
    postauthendicationErrorInvalid: null,
    postauthendicationLoading: false,
     postauthendicationData: null
      ? {
          ...state.postauthendicationData,
          password: '', // clear only password
        }
      : null,
  };
        default:
            return state;
    }
};

export default postauthendicationReducer;
