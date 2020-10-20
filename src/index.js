//@ts-check

import { StrictAsyncStorage } from 'strict-async-storage'
import { action, makeObservable, observable } from 'mobx'

export * from 'strict-async-storage'

export function MobxStorageStore(defaults, driver) {
  return makeObservable(new StrictAsyncStorage(defaults, driver), {
    //@ts-expect-error
    _map: observable,
    _initialized: observable,
    _disposed: observable,
    setMap: action,
    batchMap: action,
    setInitialized: action,
    dispose: action,
  })
}
