const React = require('react');

// Create React elements instead of object literals
const LineChart = (props) => React.createElement('div', { 'data-testid': 'line-chart', ...props });
const Line = (props) => React.createElement('div', { 'data-testid': 'line', ...props });
const BarChart = (props) => React.createElement('div', { 'data-testid': 'bar-chart', ...props });
const Bar = (props) => React.createElement('div', { 'data-testid': 'bar', ...props });
const XAxis = (props) => React.createElement('div', { 'data-testid': 'x-axis', ...props });
const YAxis = (props) => React.createElement('div', { 'data-testid': 'y-axis', ...props });
const CartesianGrid = (props) => React.createElement('div', { 'data-testid': 'grid', ...props });
const Tooltip = (props) => React.createElement('div', { 'data-testid': 'tooltip', ...props });
const Legend = (props) => React.createElement('div', { 'data-testid': 'legend', ...props });
const ResponsiveContainer = (props) => React.createElement('div', { 'data-testid': 'responsive-container', ...props }, props.children);
const PieChart = (props) => React.createElement('div', { 'data-testid': 'pie-chart', ...props });
const Pie = (props) => React.createElement('div', { 'data-testid': 'pie', ...props });
const Cell = (props) => React.createElement('div', { 'data-testid': 'cell', ...props });
const AreaChart = (props) => React.createElement('div', { 'data-testid': 'area-chart', ...props });
const Area = (props) => React.createElement('div', { 'data-testid': 'area', ...props });

module.exports = {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
}; 