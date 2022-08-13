const path = require("path");

module.exports = {
    entry: './examples/konva/src/index.js',
    resolve: {
        extensions: [ '.js' ],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './examples/konva/dist'),
    },
};