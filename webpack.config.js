const TerserPlugin = require('terser-webpack-plugin');

var PRODUCTION = false;
var SOURCE_MAP = true;
module.exports = {

	mode: (PRODUCTION) ? 'production' : 'development',

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
							// 0 => no loaders (default);
							// 1 => postcss-loader;
							// 2 => postcss-loader, sass-loader
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
				use: "babel-loader",
				exclude: /node_modules/
			}
		],
	},

	entry: './src/js/main.js',

	optimization: {
		minimizer: [
			new TerserPlugin({
				extractComments: true,
				sourceMap: SOURCE_MAP, // Must be set to true if using source-maps in production
				terserOptions: {
					compress: {
						drop_console: PRODUCTION,
						ecma: 6,
						unsafe_methods: PRODUCTION
					},
				},
			}),
		],
	},

	output:
	{
		path: __dirname + '/dest/js/',
		publicPath: '/js/',
		filename: '[name].min.js'
	},

	devtool: (SOURCE_MAP) ? 'source-map' : 'none',
	devServer: {
		port: 1414,
		inline: true,
		overlay: true,
		contentBase: './dest',
	},

	resolve:
	{
		extensions: ['.js']
	}
};