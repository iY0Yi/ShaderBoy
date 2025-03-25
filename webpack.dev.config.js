const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',

  module: {
    rules: [
      {
        test: [/\.scss/, /\.css/],
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: false,
              sourceMap: true,
              importLoaders: 2
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            }
          }
        ],
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
          options: {
            filename: '[name].worker.js'
          }
        }
      }
    ],
  },

  entry: './src/js/main.js',

  output: {
    path: path.resolve(__dirname, 'dest/js/'),
    filename: '[name].min.js?ver=' + new Date().getTime(),
    publicPath: '/js/'
  },

  devtool: 'source-map',

  plugins: [
    new webpack.DefinePlugin({
      'process.env.DEVELOPMENT': JSON.stringify(true),
      'process.env.BUILD_TIMESTAMP': JSON.stringify(new Date().getTime()),
      'process.env.DISABLE_HOT': JSON.stringify(true)
    }),
    new webpack.WatchIgnorePlugin({
      paths: [
        /\.d\.ts$/,
        /node_modules/,
        /editor_hotkeys\.js$/
      ]
    })
  ],

  watchOptions: {
    ignored: [
      '**/node_modules/**',
      '**/*.log',
      '**/src/js/editor/editor_hotkeys.js'
    ],
    poll: 3000
  },

  resolve: {
    extensions: ['.js'],
    alias: {
      'monaco-editor': path.resolve(__dirname, 'node_modules/monaco-editor')
    }
  }
};