import path from 'path';
import alias from 'rollup-plugin-alias';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import minify from 'rollup-plugin-babel-minify';

export default {
  input: './glry.js',
  output: {
    file: './glry.min.js',
    format: 'iife',
  },
  sourceMap: true,
  plugins: [
    resolve(),
    sourcemaps(),
    babel({
      exclude: 'node_modules/**', // only transpile our source code
    }),
    alias({
      react: path.resolve(
        __dirname,
        'node_modules',
        'preact-compat',
        'dist',
        'preact-compat.es.js'
      ),
      'react-dom': path.resolve(
        __dirname,
        'node_modules',
        'preact-compat',
        'dist',
        'preact-compat.es.js'
      ),
    }),
    minify(),
  ],
};
