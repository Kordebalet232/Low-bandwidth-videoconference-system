import {applyMiddleware, CombinedState, combineReducers, createStore, Store } from "redux";


import testing_call from "./reducers/testingCallReducer";

import logger from "redux-logger";

import Action from "../types/Action";
import TestingCallT from "../types/testingCallTypes";


const reducers = combineReducers({
    testingCall: testing_call
});


let store: Store<
    CombinedState<{
        testingCall: TestingCallT;
    }>,
    Action> = createStore(reducers, applyMiddleware());

export default store;