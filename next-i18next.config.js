module.exports = {
  debug: process.env.NODE_ENV === "development",
  defaultNS: "common",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "pt"],
  },
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
