import {applyMiddleware, combineReducers, createStore, Store } from "redux";

import {thunk} from 'redux-thunk'

import testing_call from "./reducers/testingCallReducer";

import logger from "redux-logger";



const reducers = combineReducers({
    testingCall: testing_call
});


let store = createStore(reducers, applyMiddleware(logger, thunk));

export default store;