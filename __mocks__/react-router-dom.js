const React = require("react");

// Mock Link component
const Link = ({ to, children, ...props }) => {
  return React.createElement("a", { href: to, ...props }, children);
};

// Mock Router component
const BrowserRouter = ({ children }) => {
  return React.createElement("div", { "data-testid": "router" }, children);
};

// Mock Routes component
const Routes = ({ children }) => {
  return React.createElement("div", { "data-testid": "routes" }, children);
};

// Mock Route component
const Route = ({ path, element, children }) => {
  return React.createElement("div", { "data-testid": "route", path }, element || children);
};

// Mock navigate function
const navigate = jest.fn();

// Mock hooks
const useNavigate = () => navigate;
const useParams = jest.fn(() => ({}));
const useLocation = jest.fn(() => ({ pathname: "/", search: "" }));
const useRouteMatch = jest.fn(() => ({ url: "/" }));

const exports = {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink: Link,
  Navigate: ({ to }) => null,
  useNavigate,
  useParams,
  useLocation,
  useRouteMatch,
  MemoryRouter: BrowserRouter,
  // Make them available as default export as well
  default: {
    BrowserRouter,
    Routes,
    Route,
    Link,
    NavLink: Link,
    Navigate: ({ to }) => null,
    useNavigate,
    useParams,
    useLocation,
    useRouteMatch,
    MemoryRouter: BrowserRouter,
  },
};

exports.__esModule = true;
module.exports = exports;
