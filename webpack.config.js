const path = require('path');

module.exports = {
	mode: 'development',
	entry: './src/histogram.js',
	devServer: {
		contentBase: './dist'
	},
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist')
	}
};
