const React = require("react");
const MockIcon = (props) => React.createElement("svg", { "data-testid": "icon", ...props });
module.exports = new Proxy({}, { get: () => MockIcon });
