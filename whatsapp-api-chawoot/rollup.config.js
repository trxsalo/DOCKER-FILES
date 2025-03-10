import typescript from 'rollup-plugin-typescript2'

export default {
    input: './src/main.ts',
    output: {
        file: './dist/main.js',
        format: 'esm',
    },
    onwarn: (warning) => {
        if (warning.code === 'UNRESOLVED_IMPORT') return
    },
    plugins: [typescript()],
}