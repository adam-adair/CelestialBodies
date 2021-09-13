const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  ///// using the terser plugin
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 2016,
          parse: {},
          compress: {
            ecma: 2016,
            toplevel: true,
            arguments: true,
            booleans_as_integers: true,
            drop_console: true,
            hoist_funs: true,
            keep_fargs: false,
            passes: 3,
            pure_getters: true,
            unsafe: true,
            unsafe_Function: true,
            unsafe_arrows: true,
            unsafe_comps: true,
            unsafe_math: true,
            unsafe_methods: true,
            unsafe_proto: true,
            unsafe_regexp: true,
            unsafe_symbols: true,
            unsafe_undefined: true,
          },
          mangle: true, // Note `mangle.properties` is `false` by default.
          module: false,
          output: null,
          toplevel: false,
          nameCache: null,
          ie8: false,
          keep_classnames: undefined,
          keep_fnames: false,
          safari10: false,
        },
      }),
    ],
  },
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.glsl$/,
        loader: "webpack-glsl-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname),
  },
};
