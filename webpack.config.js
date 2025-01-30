var path = require("path");

const TerserPlugin = require("terser-webpack-plugin");

var webpackConfig = {
  mode: "production",
  entry: {
    calendar_chart: "./src/calendar_visualization/calendar_chart_container.js",
  },
  devServer: {
    contentBase: "./dist",
  },
  output: {
    filename: "bundle.js",
    path: path.join(path.resolve(__dirname), "/dist"),
    library: "[name]",
    libraryTarget: "umd",
  },
  resolve: {
    extensions: [".js"],
    modules: [path.join(__dirname, "../src"), "node_modules"],
  },
  plugins: [new TerserPlugin()],
  module: {
    rules: [
      { test: /\.(js|jsx)$/, use: "babel-loader" },
      { test: /\.css$/, loader: ["to-string-loader", "css-loader"] },
    ],
  },
  stats: {},
};

module.exports = webpackConfig;
