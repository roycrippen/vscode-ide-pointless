const path = require('path');

module.exports = {
    devtool: 'source-map',
    mode: "development",
    entry: './src/editor.ts',
    output: {
        filename: 'joy.bundle.js',
        path: path.resolve(__dirname, './out'),
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
};
