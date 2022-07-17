// from https://github.com/microsoft/TypeScript/issues/18442#issuecomment-749896695
// setup: `npm i rollup @rollup/plugin-typescript` or `npm i rollup rollup-plugin-typescript2` (for visible TS error output)
// ref: <https://devhints.io/rollup>

import typescript from '@rollup/plugin-typescript';
// import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
    // ES module build (replaces broken basic TypeScript compilation)
    // * ref: <https://github.com/microsoft/TypeScript/issues/18442> , <https://github.com/alshdavid/rxjs/blob/main/rollup.config.js#L10>
    // * ref: <https://github.com/microsoft/TypeScript/pull/35148>
    // * ref: <https://github.com/microsoft/TypeScript/issues/37582>
    {
        preserveModules: true, // or `false` to bundle as a single file
        input: ['src/index.ts', 'src/calc-fifo.ts', 'src/last-row.ts', 'src/orders.ts', 'src/validate.ts'],
        output: [
            {
                dir: 'dist',
                sourcemap: true,
                format: 'esm',
                entryFileNames: '[name].mjs'
            }],
        plugins: [typescript({ tsconfig: './tsconfig.json' }), nodeResolve()]
    }
];
