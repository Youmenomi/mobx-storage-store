import { StrictAsyncStorage } from 'strict-async-storage';
import { ObservableMap } from 'mobx';

export type DriverInterface = {
  getItem: (key: any) => any;
  setItem: (key: any, value: any) => any;
};

export type DriverType<TDriver> = TDriver | (() => TDriver);

export class MobxStorageStore<
  TDefault extends { [key: string]: any },
  TKey extends string & keyof TDefault,
  TDriver extends DriverInterface = Storage
> {
  protected _driver: TDriver | Storage;
  protected _strictAsyncStorage: StrictAsyncStorage<
    TDefault,
    TKey,
    TDriver | Storage
  >;

  constructor(
    defaults: TDefault,
    driver: DriverType<TDriver> | DriverType<Storage> = localStorage
  ) {
    if (typeof driver === 'function') {
      this._driver = driver();
    } else {
      this._driver = driver;
    }

    this._strictAsyncStorage = new StrictAsyncStorage(defaults, {
      map: new ObservableMap(),
      driver: this._driver,
    });
  }

  async init() {
    await this._strictAsyncStorage.init();
  }

  getItem<T extends keyof TDefault & string>(key: T): TDefault[T] {
    return this._strictAsyncStorage.getItem(key);
  }

  async setItem<T extends keyof TDefault & string>(key: T, value: TDefault[T]) {
    await this._strictAsyncStorage.setItem(key, value);
  }

  async resetItem<T extends keyof TDefault & string>(key: T) {
    return await this._strictAsyncStorage.resetItem(key);
  }

  async resetAll() {
    await this._strictAsyncStorage.resetAll();
  }

  get length() {
    return this._strictAsyncStorage.length;
  }

  dispose(handler?: (driver: TDriver | Storage) => void) {
    if (handler) handler(this._driver);
    this._strictAsyncStorage.dispose();
  }

  get defaults() {
    return this._strictAsyncStorage.defaults;
  }

  hasItem(key: any) {
    return this._strictAsyncStorage.hasItem(key);
  }
}
