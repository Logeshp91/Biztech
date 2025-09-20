import { combineReducers } from "redux";
import postauthendicationReducer from "./postauthendication.Reducer";
import postcreatevisitReducer from "./postcreatevisit.Reducer";
import odooReducer from "./oodo.Reducer";
import postAccessReadReducer from "./postAccessRead.Reducer";
import postConvertReducer from "./postConvert.Reducer";
const reducer =combineReducers({


postauthendicationReducer,   
postcreatevisitReducer,
odooReducer,
postAccessReadReducer,
postConvertReducer

})

export default reducer;