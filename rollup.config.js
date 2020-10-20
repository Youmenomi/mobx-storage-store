//@ts-check

import { build } from 'rollup-simple-configer'
import pkg from './package.json'

const input = './src/index.js'

export default [].concat(
  build(
    input,
    {
      file: pkg.main,
      format: 'cjs',
    },
    { external: ['mobx', 'strict-async-storage'] }
  ),
  build(
    input,
    {
      file: pkg.module,
      format: 'esm',
    },
    { external: ['mobx', 'strict-async-storage'] }
  ),
  build(
    input,
    {
      file: 'dist/umd/mobx-storage-store.umd.js',
      format: 'umd',
      name: 'mobxStorageStore',
      globals: {
        mobx: 'mobx',
      },
    },
    { withMin: true, external: ['mobx'] }
  )
)
