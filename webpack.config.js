const TerserPlugin = require('terser-webpack-plugin')

const PRODUCTION = true
const SOURCE_MAP = false

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
			},
			{
				test: /\.worker\.js$/,
				use: {
					loader: 'worker-loader',
					options: { name: 'worker.min.js' }
				}
			}
		],
	},

	entry: './src/js/main.js',
	// entry: { main: './src/js/main', worker: './src/js/workers/keyword.worker' },

	optimization: {
		minimizer: [
			new TerserPlugin({
				extractComments: true,
				sourceMap: SOURCE_MAP, // Must be set to true if using source-maps in production
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

	output:
	{
		path: __dirname + '/dest/js/',
		publicPath: ((PRODUCTION) ? '/app/' : '//') + '/js/',
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
}