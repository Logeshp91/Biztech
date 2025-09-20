
import actionTypes from "../actionTypes";

const initialState = {
  locations: [],
};

const locationReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.ADD_LOCATION:
      return {
        ...state,
        locations: [...state.locations, action.payload],
      };
    default:
      return state;
  }
};

export default locationReducer;
