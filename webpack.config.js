const TerserPlugin = require('terser-webpack-plugin');

const PRODUCTION = process.env.NODE_ENV_PRODUCTION === 'YES';
const SOURCE_MAP = process.env.NODE_ENV_SOURCE_MAP === 'YES';

module.exports = {
  mode: PRODUCTION ? 'production' : 'development',

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
              sourceMap: SOURCE_MAP,
              importLoaders: 2
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: SOURCE_MAP,
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

  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: true,
        terserOptions: {
          compress: {
            drop_console: !SOURCE_MAP,
            ecma: 6,
            unsafe_methods: PRODUCTION
          },
        },
      }),
    ],
  },

  output: {
    path: __dirname + '/dest/js/',
    publicPath: (PRODUCTION ? '/app/' : '/') + 'js/',
    filename: '[name].min.js'
  },

  devtool: SOURCE_MAP ? 'source-map' : false,

  devServer: {
    port: 1414,
    static: {
      directory: './dest',
    },
    client: {
      overlay: true,
    },
    hot: true,
    open: true
  },

  resolve: {
    extensions: ['.js']
  }
};
