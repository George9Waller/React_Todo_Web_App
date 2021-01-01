import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from "react-router-dom";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import {createStore, applyMiddleware, compose} from "redux";
import thunk from "redux-thunk";
import {Provider} from "react-redux";
import {ReactReduxFirebaseProvider} from "react-redux-firebase";
import {createFirestoreInstance} from "redux-firestore";
import {rootReducer} from "./redux/reducers";
import './index.css';
import App from './App';

// react-redux-firebase
const rrfConfig = {
  userProfile: "users",
    useFirestoreForProfile: true,
};

const initialState = {};
let store = createStore(rootReducer, initialState, compose(applyMiddleware(thunk), window.devToolsExtension ? window.devToolsExtension() : f => f));
console.log(`Created store ${store}`);

const rrfProps = {
    firebase,
    config: rrfConfig,
    dispatch: store.dispatch,
    createFirestoreInstance,
};

ReactDOM.render(
  <React.StrictMode>
      <Provider store={store}>
          <ReactReduxFirebaseProvider {...rrfProps}>
              <BrowserRouter>
                  <App />
              </BrowserRouter>
          </ReactReduxFirebaseProvider>

      </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
