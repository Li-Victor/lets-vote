import React from 'react';
import ReactDOM from 'react-dom';
import { Route, BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import App from './App';
import rootReducer from './rootReducer';
import { fetchUser } from './actions/user';
import api from './api';

const store = createStore(rootReducer, {}, composeWithDevTools(applyMiddleware(reduxThunk)));

if (window.location.hash === '#_=_') {
  if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href.split('#')[0]);
  } else {
    window.location.hash = '';
  }
}

api.user.login().then((res) => {
  store.dispatch(fetchUser(res));

  ReactDOM.render(
    <BrowserRouter>
      <Provider store={store}>
        <Route component={App} />
      </Provider>
    </BrowserRouter>,
    document.getElementById('root')
  );
});
