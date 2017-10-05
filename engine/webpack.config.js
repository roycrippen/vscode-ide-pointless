var path = require('path');

module.exports = {
    entry: './src/editor.ts',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    output: {
        filename: 'joy.bundle.js',
        path: path.resolve(__dirname, '../resources/built')
    }
};