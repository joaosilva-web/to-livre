// Local ESLint config (CJS) to register our custom inline plugin rules.
module.exports = {
  plugins: {
    local: {
      rules: {
        "no-toISOString-slice": require("./eslint-rules/no-toISOString-slice.js"),
      },
    },
  },
  rules: {
    "local/no-toISOString-slice": "error",
  },
};
