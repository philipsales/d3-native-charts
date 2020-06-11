const path = require('path');

module.exports = {
	mode: 'development',
<<<<<<< HEAD
	entry: './src/dendogram-bar.js',
=======
	entry: './src/tree.js',
>>>>>>> fa33f78547255a93a84fc46164e7e5fa5fc63d08
	devServer: {
		contentBase: './dist'
	},
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist')
	}
};
