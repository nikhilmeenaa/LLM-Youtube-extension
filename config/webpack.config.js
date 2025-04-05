'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      popup: PATHS.src + '/popup.ts',
      contentScript: PATHS.src + '/contentScript.ts',
      background: PATHS.src + '/background.ts',
      classifierWorker: PATHS.src + '/classifierWorker.ts'
    },
    // module: {
    //   rules: [
    //     {
    //       test: /classifierWorker\.ts$/,  // Specific to your worker file
    //       use: {
    //         loader: 'worker-loader',
    //         options: {
    //           filename: 'classifierWorker.js',
    //           inline: 'no-fallback',
    //           worker: {
    //             type: 'Worker',
    //             options: {
    //               name: 'ClassifierWorker'
    //             }
    //           }
    //         }
    //       }
    //     },
    //     // Your existing rules...
    //   ]
    // },
    devtool: argv.mode === 'production' ? false : 'source-map',
    output: {
      filename: '[name].js',
      publicPath: ''
    },

  });

module.exports = config;
