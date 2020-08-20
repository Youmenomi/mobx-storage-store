import { autorun, IReactionDisposer } from 'mobx';

import { MobxStorageStore, DriverInterface } from '../src';
import {
  getSaved,
  setSaved,
  defaults,
  AsyncDriver,
  StorageName,
  restoreSaved,
  defLen,
} from './helper';

describe('mobx-storage-store', () => {
  jest
    .spyOn(Object.getPrototypeOf(localStorage) as Storage, 'getItem')
    .mockImplementation((name: string) => {
      return getSaved(name) ? getSaved(name) : null;
    });
  jest
    .spyOn(Object.getPrototypeOf(localStorage) as Storage, 'setItem')
    .mockImplementation((name: string, value: string) => {
      setSaved(name, value);
    });
  oneSetTest('default sync', new MobxStorageStore(defaults));

  oneSetTest(
    'cunstom async',
    new MobxStorageStore(defaults, () => new AsyncDriver()),
    true
  );
});

function oneSetTest<TDriver extends DriverInterface = Storage>(
  testName: string | number | Function | jest.FunctionLike,
  mobxStorageStore: MobxStorageStore<typeof defaults, StorageName, TDriver>,
  handleDispose = false
) {
  describe(testName, () => {
    restoreSaved();

    let view: jest.Mock<string>;
    let dispose: IReactionDisposer;
    beforeAll(() => {
      view = jest.fn(() => {
        try {
          return mobxStorageStore.getItem(StorageName.user);
        } catch (error) {
          return error;
        }
      });
      dispose = autorun(view);
    });
    afterAll(() => {
      dispose();
    });

    it('test init', async () => {
      expect(view).lastReturnedWith(
        new RangeError(
          'The key parameter is an invalid value. May be disposed or uninitialized.'
        )
      );
      await mobxStorageStore.init();
      expect(mobxStorageStore.defaults).toEqual(defaults);
      expect(view).lastReturnedWith(getSaved(StorageName.user));
    });

    it('test length', async () => {
      expect(await mobxStorageStore.length).toBe(defLen);
    });

    it('test hasItem', () => {
      expect(mobxStorageStore.hasItem(StorageName.user)).toBeTruthy();
      expect(mobxStorageStore.hasItem('other' as any)).toBeFalsy();
    });

    it('test getItem', () => {
      expect(mobxStorageStore.getItem(StorageName.user)).toBe(
        getSaved(StorageName.user)
      );
      expect(mobxStorageStore.getItem(StorageName.no)).toBe(
        getSaved(StorageName.no)
      );
      expect(mobxStorageStore.getItem(StorageName.enable)).toBe(
        defaults[StorageName.enable]
      );
      expect(mobxStorageStore.getItem(StorageName.data)).toEqual(
        getSaved(StorageName.data)
      );

      expect(() => mobxStorageStore.getItem('other' as any)).toThrowError(
        RangeError
      );
    });

    it('test setItem', async () => {
      const user = 'test001';
      await mobxStorageStore.setItem(StorageName.user, user);
      expect(mobxStorageStore.getItem(StorageName.user)).toBe(user);
      expect(view).lastReturnedWith(user);

      await mobxStorageStore.setItem(StorageName.user, undefined as any);
      expect(mobxStorageStore.getItem(StorageName.user)).toBeUndefined();
      await mobxStorageStore.setItem(StorageName.user, null as any);
      expect(mobxStorageStore.getItem(StorageName.user)).toBe(
        defaults[StorageName.user]
      );

      await expect(
        mobxStorageStore.setItem('other' as any, null as any)
      ).rejects.toThrowError(RangeError);
    });

    it('test resetItem', async () => {
      expect(await mobxStorageStore.resetItem(StorageName.user)).toBe(
        defaults[StorageName.user]
      );
      expect(mobxStorageStore.getItem(StorageName.user)).toBe(
        defaults[StorageName.user]
      );
      expect(view).lastReturnedWith(defaults[StorageName.user]);

      await expect(
        mobxStorageStore.resetItem('other' as any)
      ).rejects.toThrowError(RangeError);
    });

    it('test resetAll', async () => {
      await mobxStorageStore.resetAll();

      expect(mobxStorageStore.getItem(StorageName.user)).toBe(
        defaults[StorageName.user]
      );
      expect(mobxStorageStore.getItem(StorageName.no)).toBe(
        defaults[StorageName.no]
      );
      expect(mobxStorageStore.getItem(StorageName.enable)).toBe(
        defaults[StorageName.enable]
      );
      expect(mobxStorageStore.getItem(StorageName.data)).toEqual(
        defaults[StorageName.data]
      );
    });

    it('test dispose', () => {
      if (handleDispose) {
        const handler = jest.fn();
        mobxStorageStore.dispose(handler);
        expect(handler).toBeCalled();
      } else {
        mobxStorageStore.dispose();
        expect(mobxStorageStore.length).toBe(0);
      }
    });
  });
}
