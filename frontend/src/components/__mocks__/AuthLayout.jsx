const React = require("react");
module.exports = ({ children, tagline, headline }) =>
  React.createElement("div", { "data-testid": "auth-layout", "data-tagline": tagline, "data-headline": headline }, children);
