var webpack = require('webpack');
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
		filename: '[name].js'
	},
	resolve:
	{
		extensions: ['', '.js']
	},
	plugins: [
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.CommonsChunkPlugin(
			{
				name: 'bundle',
				filename: 'bundle.js',
				minChunks: Infinity
			}),
		new webpack.optimize.AggressiveMergingPlugin()
	]
};