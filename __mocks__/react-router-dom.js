// Mock for react-router-dom
module.exports = {
  BrowserRouter: ({ children }) => children,
  Route: ({ children }) => children,
  Routes: ({ children }) => children,
  Link: ({ children, to }) => children,
  NavLink: ({ children, to }) => children,
  Navigate: ({ to }) => null,
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  MemoryRouter: ({ children }) => children
}; 