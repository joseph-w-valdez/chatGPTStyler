const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (_env, argv) => {
    const mode = argv.mode || "production";
    const isProduction = mode === "production";

    return {
        mode,
        devtool: isProduction ? false : "inline-source-map",
        entry: {
            backgroundPage: path.join(__dirname, "src/backgroundPage.ts"),
            popup: path.join(__dirname, "src/popup/index.tsx"),
            contentScript: path.join(__dirname, "src/contentScript.ts"),
        },
        output: {
            path: path.join(__dirname, "dist/js"),
            filename: "[name].js",
        },
        module: {
            rules: [
                {
                    exclude: /node_modules/,
                    test: /\.tsx?$/,
                    use: "ts-loader",
                },
                // Treat src/css/app.css as a global stylesheet
                {
                    test: /app\.css$/,
                    use: ["style-loader", "css-loader", "postcss-loader"],
                },
                // Load .module.css files as CSS modules
                {
                    test: /\.module\.css$/,
                    use: [
                        "style-loader",
                        {
                            loader: "css-loader",
                            options: {
                                modules: true,
                            },
                        },
                        "postcss-loader",
                    ],
                },
            ],
        },
        // Setup @src path resolution for TypeScript files
        resolve: {
            extensions: [".ts", ".tsx", ".js"],
            alias: {
                "@src": path.resolve(__dirname, "src/"),
            },
        },
        optimization: isProduction
            ? {
                  minimize: true,
                  minimizer: [
                      new TerserPlugin({
                          terserOptions: {
                              compress: {
                                  // Preserve warning/error logs for real failures.
                                  pure_funcs: [
                                      "console.log",
                                      "console.info",
                                      "console.debug",
                                      "console.table",
                                  ],
                              },
                          },
                      }),
                  ],
              }
            : undefined,
    };
};
