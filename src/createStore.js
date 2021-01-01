import { createStore } from 'redux'
import 'firebase/auth'
import 'firebase/database'
import { persistStore, persistReducer } from 'redux-persist'
import localStorage from 'redux-persist/lib/storage' // defaults to localStorage for web and AsyncStorage for react-native
import makeRootReducer from './redux/reducers'

const persistConfig = {
    key: 'root',
    storage: localStorage
};

export default (initialState = {}) => {
    const persistedReducer = persistReducer(persistConfig, makeRootReducer());

    const store = createStore(
        persistedReducer,
        initialState
    );

    const persistor = persistStore(store);

    return { store, persistor }
}