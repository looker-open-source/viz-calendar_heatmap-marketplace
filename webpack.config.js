var path = require("path");

const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

var webpackConfig = {
  mode: "production",
  entry: {
    calendar_chart: "./src/calendar_visualization/calendar_chart_container.js",
  },
  devServer: {
    contentBase: "./dist",
  },
  output: {
    filename: "calendar_chart.js",
    path: path.join(path.resolve(__dirname), "/dist"),
    library: "[name]",
    libraryTarget: "umd",
  },
  resolve: {
    extensions: [".js"],
    modules: [path.join(__dirname, "../src"), "node_modules"],
  },
  plugins: [new UglifyJSPlugin()],
  module: {
    rules: [
      { test: /\.(js|jsx)$/, use: "babel-loader" },
      { test: /\.css$/, loader: ["to-string-loader", "css-loader"] },
    ],
  },
  stats: {},
};

module.exports = webpackConfig;
