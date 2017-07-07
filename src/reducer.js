import {
  ONLINE,
  OFFLINE
} from './actions'

export const offlineReducerCreator = (
  ONLINE_ACTION_NAME = ONLINE,
  OFFLINE_ACTION_NAME = OFFLINE
) => (state = false, action) => {
  switch (action.type) {
    case ONLINE_ACTION_NAME:
      return false

    case OFFLINE_ACTION_NAME:
      return true

    default:
      return state
  }
}

export const offline = offlineReducerCreator()
