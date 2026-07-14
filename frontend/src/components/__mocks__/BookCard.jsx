const React = require("react");
module.exports = ({ book, priority }) =>
  React.createElement("div", { "data-testid": "book-card", "data-book-id": book?.id, "data-priority": priority }, book?.title);
