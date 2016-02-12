import babel from 'rollup-plugin-babel';

export default {
  // tell rollup our main entry point
  entry: 'src/index.js',
  dest: 'lib/bundle.js',
  format: 'cjs',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: ['es2015-rollup']
    })
  ]
}
