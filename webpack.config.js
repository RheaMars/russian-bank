module.exports = {
	mode: "development",
	entry: {
		app: __dirname + "/app/js/app.js"
	},
	output: {
		path: __dirname + "/app/js/dist",
		filename: "[name].js"
	},
	resolve: {
		// Set a jQuery alias to avoid conflicts with other imported modules like "jquery-ui-touch-punch":
		alias: {
			jquery: "jquery/src/jquery"
		}
	},
	module: {
		rules: [
			{
				enforce: "pre",
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "eslint-loader",
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['babel-preset-env']
					}
				}
			},
			{
				test: /\.css$/,
				use: [
	        		{
	        			loader: "style-loader"
					},
					{
						loader: "css-loader",
					}
				]
			}
		]
	}
};