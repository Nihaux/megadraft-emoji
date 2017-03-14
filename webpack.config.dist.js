/*
 * Copyright (c) 2017, Nicolas Hauseux <nicolas.hauseux@gmail.com>
 *
 * License: MIT
 */

module.exports = {
  entry: [
    "."
  ],
  output: {
    path: "./dist",
    publicPath: "/dist/",
    filename: "megadraft-emoji.js",
    library: "megadraft-emoji",
    libraryTarget: "umd"
  },
  externals: {
    "megadraft": "Megadraft",
    "react": "React",
    "react-dom": "ReactDOM"
  },
  devtool: "source-map",
  devServer: {
    inline: true,
    contentBase: "./"
  },
  module: {
    loaders: [
      {
        exclude: /node_modules/,
        loader: "babel"
      },
      {
        test: /\.json$/,
        loader: "json"
      }
    ]
  }
};
