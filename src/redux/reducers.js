import {combineReducers} from "redux";
import {firebaseReducer} from "react-redux-firebase";
import {firestoreReducer} from "redux-firestore";
import {persistReducer} from "redux-persist";
import storage from 'redux-persist/lib/storage';
import hardSet from 'redux-persist/lib/stateReconciler/hardSet';
import locationReducer from '../location';

export const rootReducer = combineReducers({
   firebase: firebaseReducer,
   firestore: firestoreReducer
});

export default function (makeRootReducer) {
   return combineReducers({
      firestore: firestoreReducer,
      firebase: persistReducer(
          {key:'firebaseState', storage: storage, stateReconciler: hardSet},
          firebaseReducer
      ),
      location: locationReducer
   })
}
