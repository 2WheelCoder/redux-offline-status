# Redux Offline Status
Middleware for managing the offline status of a redux application. Perfect for building offline-first applications.

## Features
* Status is based on http connections, not navigator.isOnline
* Can be customized to manage connection status to multiple servers
* Works great with redux sagas for handling network errors and queuing requests when offline

## Basic Setup
```js
import {combineReducers, applyMiddleware, createStore} from 'redux'
import {
  offlineStatus,
  offline,
} from 'redux-offline-status'

export const reducer = combineReducers({
  ...reducers
  offline,
})

const middleware = [
  // other middleware
  offlineStatus(),
]

const store = createStore(
  reducer,
  initialState,
  applyMiddleware(middleware)
)
```
From here, you'll be able to respond to ONLINE and OFFLINE actions in your reducers and application. For example:
```js
import {
  ONLINE,
  OFFLINE
} from 'redux-offline-status/actions'

const errorsReducer = (state = [], action) => {
  switch (action.type) {
    case OFFLINE:
      return [
        ...state,
        // add an error for OFFLINE
      ]

    case ONLINE:
      return [
        ...state,
        // remove OFFLINE error
      ]
  }
}
```

Or, you may simply check the offline status in your redux connected components:
```js
import { connect } from 'react-redux'
import { isOffline } from 'redux-offline-status/getters'

const mapStateToProps = (state) => ({
  isOffline: isOffline(state)
})

const VisibleMyComponent = connect(
  mapStateToProps
)(MyComponent)

export default VisibleMyComponent
```
Note: The getter included is only for the default reducer implementation used above. If you use a custom name for the offline reducer you will need to create your own getter.

Note, while the middleware will automatically detect when the application returns online, you must dispatch the `OFFLINE` action when there is a network error so the middleware can initiate the internal to check for a returned connection. For example:
```js
import { OFFLINE } from 'redux-offline-status/actions'
fetch('http://myapi.com/products')
  .then((response) => {
    // handle successful response
  })
  .catch((error) => {
    // TODO: What other error messages might be appropriate here? Server errors?
    // Chrome throws "Network Error", but not sure what other browsers do
    if (error.message === 'Network Error') {
      dispatch({ type: OFFLINE })
    }
  })
```

## Configuration
You can (optionally) pass a configuration object when initializing the middleware.
```js
const config = {
  connectionFn: myConnectionFn,
  intervalLength: 1000 * 15,
  ONLINE_ACTION_NAME: 'SERVER_1_ONLINE',
  OFFLINE_ACTION_NAME: 'SERVER_1_OFFLINE',
}

const middleware = [
  // other middleware
  offlineStatus(config),
]
```

### Configuration Properties
`connectionFn` (_Function_), default: isOnline/browser from (is-online)[https://github.com/sindresorhus/is-online]
A function to replace the default method for determining if the application is online or offline. You should only need to replace this if you need custom functionality for determining the network connection, such as when managing several instances of `redux-offline-status` for different server connections.

`intervalLength` (_Number_), default: 30000
An integer representing the number of milliseconds that the interval should be for checking the network connection. This represents how often connectionFn is triggered.

`ONLINE_ACTION_NAME`: (_String_), default: 'ONLINE'
The name of the action used to indicate the app is online. If you are managing multiple server connections with redux-offline-status you might use 'SERVER_1_ONLINE' and 'SERVER_2_ONLINE' for different configurations of redux-offline-status.

`OFFLINE_ACTION_NAME` (_String_), default: 'OFFLINE'
The name of the action used to indicate the app is offline. If you are managing multiple server connections with redux-offline-status you might use 'SERVER_1_OFFLINE' and 'SERVER_2_OFFLINE' for different configurations of redux-offline-status.

### Use with Sagas
redux-offline-status is not dependent on sagas, but I highly suggest you use them when developing an offline-first application (or any application that calls an API). Here's an example of how simple it is to make your API call wait for the application to come online using a saga:

Or, if you'd like a slightly more complicated version with error handling and retry functionality (using recursion):
```js
import { isOffline } from 'redux-offline-status/getters'
import {
  ONLINE,
  OFFLINE
} from 'redux-offline-status/actions'

export function* myApiCall() {
  const offline = yield select(isOffline)

  if (offline) {
    yield take(ONLINE) //
  }

  try {
    const res = yield call(apiCall)
    yield put({
      type: 'API_CALL_SUCCESS',
      res
    })

    return res
  } catch (error) {
    // TODO: What other error messages might be appropriate here? Server errors?
    // Chrome throws "Network Error", but not sure what other browsers do
    if (error.message === 'Network Error') {
      yield put({ type: OFFLINE }) // Whenever you detect
      return yield call(myApiCall)
    }

    yield put({
      type: `${actionType}_ERROR`,
      error
    })

    return new Error(error)
  }
}
```
