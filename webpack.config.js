module.exports = {
    devtool : 'source-map',
    entry : './dist/main.js',
    output : {
        path : __dirname,
        filename : 'convert_main.js'
    },
    module : {
        rules : [{
            test : /\.js$/,
            exclude : /node_modules/,
            use : [{
                loader : 'babel-loader',
                options : {
                    presets : ['es2015']
                }
            }]        
        }]
    },
    devServer : {
        inline : true,
        port : 7777,
        contentBase : __dirname
    }
}