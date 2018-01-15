const path = require("path");
const glob = require("glob");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";

module.exports = {
  entry: {
    popup: "./src/popup.js",
    background: "./src/background.js"
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /.js$/,
        exclude: /(node_modules\/(?!(shufflejs)\/).*\/|bower_components)/,
        use: "babel-loader?cacheDirectory"
      },
      {
        test: /.s?css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              loader: "css-loader",
              options: {
                sourceMap: !isProd
              }
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: !isProd
              }
            },
            {
              loader: "resolve-url-loader"
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: true,
                includePaths: glob.sync(path.join(__dirname, "/node_modules"))
              }
            }
          ]
        })
      },
      {
        test: /\.(png|jpg|gif|svg|woff|woff2|eot|ttf|webp)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name]_[hash].[ext]"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(path.resolve(__dirname, "dist")),
    new CopyWebpackPlugin([{ from: "src/static" }]),
    new HtmlWebpackPlugin({
      template: path.resolve("src/popup.html"),
      filename: "popup.html",
      excludeChunks: ["background"]
    }),
    new ExtractTextPlugin({
      filename: "[name]_[contenthash].css",
      disable: !isProd
    }),
    new webpack.EnvironmentPlugin(["NODE_ENV"])
    // isProd ? new UglifyJSPlugin() : null
  ].filter(plugin => !!plugin),
  devtool: isProd ? false : "cheap-module-eval-source-map"
};
