import { StrictAsyncStorage, DriverInterface } from 'strict-async-storage';

export * from 'strict-async-storage';

export declare class MobxStorageStore<
  TDefault extends {
    [key: string]: any;
  },
  TKey extends string & keyof TDefault,
  TDriver extends DriverInterface = Storage
> extends StrictAsyncStorage<TDefault, TKey, TDriver> {
  constructor(defaults: TDefault, driver?: TDriver | Storage);
}
