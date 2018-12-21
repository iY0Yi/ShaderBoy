var webpack = require('webpack');
var PROD = true;
var version = 0;
module.exports = {
	module:
	{
		loaders: [
			{
				loader: 'babel-loader',
				test: /\.js$/,
				exclude: /node_modules/
			}
		]
	},
	// devtool: 'source-map',
	entry:
	{
		main: './src/js/main.js'
	},
	output:
	{
		path: __dirname + '/dest/js/',
		filename: PROD ? '[name].min.js' : '[name].js'
	},
	resolve:
	{
		extensions: ['', '.js']
	},
	plugins: [
		// new webpack.optimize.DedupePlugin(),
		// new webpack.optimize.CommonsChunkPlugin(
		// 	{
		// 		name: 'bundle',
		// 		filename: PROD ? 'bundle.min.js' : 'bundle.js',
		// 		minChunks: Infinity
		// 	}),
		// new webpack.optimize.AggressiveMergingPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			include: /\.min\.js$/,
			minimize: true
		})
	]
};