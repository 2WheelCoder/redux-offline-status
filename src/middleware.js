import isOnline from 'is-online/browser'

import {
  ONLINE,
  OFFLINE
} from './actions'

let intervalId = null

const defaultConfig = {
  intervalLength: 1000 * 30,
  connectionFn: isOnline,
  ONLINE_ACTION_NAME: ONLINE,
  OFFLINE_ACTION_NAME: OFFLINE,
}

export const offlineStatus = customConfig => ({ getState, dispatch }) => next => (action) => {
  const result = next(action)

  const config = {
    ...defaultConfig,
    ...customConfig,
  }

  const {
    intervalLength,
    connectionFn,
    ONLINE_ACTION_NAME,
    OFFLINE_ACTION_NAME,
  } = config

  if (action.type === OFFLINE_ACTION_NAME && !intervalId) {
    intervalId = setInterval(() => {
      connectionFn()
        .then(online => online && dispatch({ type: ONLINE_ACTION_NAME }))
    }, intervalLength)

    return result
  }

  if (action.type === ONLINE_ACTION_NAME && intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }

  return result
}
