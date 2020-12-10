import { combineReducers } from 'redux';
import imagesReducer from './imagesReducer';
import loadingReducer from './loadingReducer';
import errorReducer from './errorReducer';

const rootReducers = combineReducers({
    isLoading: loadingReducer,
    images: imagesReducer,
    error: errorReducer,
});

export default rootReducers;
