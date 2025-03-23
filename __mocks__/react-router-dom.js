const React = require('react');

// Create proper React components for router mocks
const BrowserRouter = ({ children }) => React.createElement('div', { 'data-testid': 'browser-router' }, children);
const Route = ({ children }) => React.createElement('div', { 'data-testid': 'route' }, children);
const Routes = ({ children }) => React.createElement('div', { 'data-testid': 'routes' }, children);
const Link = ({ children, to }) => React.createElement('a', { href: to, 'data-testid': 'link' }, children);
const NavLink = ({ children, to }) => React.createElement('a', { href: to, 'data-testid': 'nav-link' }, children);
const Navigate = ({ to }) => React.createElement('div', { 'data-testid': 'navigate', to });
const MemoryRouter = ({ children }) => React.createElement('div', { 'data-testid': 'memory-router' }, children);
const Outlet = () => React.createElement('div', { 'data-testid': 'outlet' });

// Navigation hooks
const useNavigate = () => jest.fn();
const useParams = () => ({});
const useLocation = () => ({ pathname: '/', search: '', hash: '', state: null });
const useRouteMatch = () => ({ path: '/', url: '/', isExact: true, params: {} });
const useSearchParams = () => [new URLSearchParams(), jest.fn()];

module.exports = {
  BrowserRouter,
  Route,
  Routes,
  Link,
  NavLink,
  Navigate,
  MemoryRouter,
  Outlet,
  useNavigate,
  useParams,
  useLocation,
  useRouteMatch,
  useSearchParams
}; 