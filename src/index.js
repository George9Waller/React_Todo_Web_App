import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import {PersistGate} from "redux-persist/lib/integration/react";
import {Provider} from "react-redux";
import {ReactReduxFirebaseProvider} from "react-redux-firebase";
import {createFirestoreInstance} from "redux-firestore";
import createStore from './createStore'
import './index.css';
import Heading from './components/heading'
import App from './App';

// react-redux-firebase
const rrfConfig = {
  userProfile: "users",
    useFirestoreForProfile: true,
};

const initialState = {};
const {store, persistor} = createStore(initialState);

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
              <PersistGate persistor={persistor} loading={<Heading />}>
                  <BrowserRouter>
                      <App />
                  </BrowserRouter>
              </PersistGate>
          </ReactReduxFirebaseProvider>
      </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
