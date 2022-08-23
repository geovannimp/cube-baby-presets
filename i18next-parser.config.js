const { i18n, defaultNS } = require("./next-i18next.config");

module.exports = {
  defaultNamespace: defaultNS,
  output: "public/locales/$LOCALE/$NAMESPACE.json",
  locales: i18n.locales,
};
