const React = require("react");
const navigate = jest.fn();
const setSearchParams = jest.fn();
const params = new URLSearchParams("");

const MockMemoryRouter = ({ children, initialEntries, initialIndex, basename }) =>
  React.createElement("div", { "data-testid": "memory-router" }, children);

module.exports = {
  MemoryRouter: MockMemoryRouter,
  Link: ({ children, to, ...props }) =>
    React.createElement("a", { href: to, ...props }, children),
  useNavigate: () => navigate,
  useSearchParams: jest.fn(() => [params, setSearchParams]),
  useParams: jest.fn(() => ({})),
  useLocation: jest.fn(() => ({ pathname: "/", search: "" })),
  Navigate: jest.fn(({ to }) => React.createElement("div", { "data-testid": "navigate", "data-to": to })),
};
