const React = require("react");
module.exports = function MockBookCustomizer() {
  return React.createElement("div", { "data-testid": "book-customizer" }, "BookCustomizer");
};
