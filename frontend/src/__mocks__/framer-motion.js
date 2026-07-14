const React = require("react");
const allowed = new Set(["children", "className", "style", "key", "ref", "id", "href", "target", "rel",
  "onClick", "onChange", "onSubmit", "onKeyDown", "onBlur", "onFocus",
  "data-testid", "src", "alt", "title", "srcSet"]);
const MockDiv = (props) => {
  const safe = {};
  for (const k of Object.keys(props)) {
    if (allowed.has(k) || k.startsWith("data-") || k.startsWith("aria-") || k === "x-column" || k === "x-component" || k === "x-dynamic" || k === "x-file-name" || k === "x-id" || k === "x-line-number") {
      safe[k] = props[k];
    }
  }
  const tag = props.href ? "a" : "div";
  return React.createElement(tag, safe);
};
const motion = new Proxy({}, { get: () => MockDiv });
const AnimatePresence = ({ children }) => children;

module.exports = { motion, AnimatePresence };
