const path = require("path");

module.exports = {
  debug: process.env.NODE_ENV === "development",
  defaultNS: "common",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "pt"],
  },
  ...(typeof window === undefined
    ? { localePath: path.resolve("./public/locales") }
    : {}),
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
