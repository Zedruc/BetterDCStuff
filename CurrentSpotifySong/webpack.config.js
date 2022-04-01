const path = require('path');
const { IgnorePlugin, DefinePlugin } = require('webpack');
var NODE_ENV = 'production';
module.exports = {
    entry: './CurrentSpotifySong/CurrentSpotifySong.plugin.js',
    output: {
        filename: './CurrentSpotifySong/bundle/CurrentSpotifySong.plugin.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new IgnorePlugin({
            resourceRegExp: /request/,
        }),
        new DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
        }),
    ],
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            }
        ]
    }
};