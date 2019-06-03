const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.join(__dirname, './dist'),
        libraryTarget: 'umd',
        libraryExport: 'default',
        library: 'rxsv',
        filename: 'index.js',
    },
    plugins: [new ForkTsCheckerWebpackPlugin()],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                enforce: 'pre',
                loader: 'tslint-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    mode: 'production',
    resolve: {
        extensions: ['.ts', '.js'],
    },
};
