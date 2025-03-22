// Mock for recharts
module.exports = {
  LineChart: function LineChart(props) {
    return { type: 'div', props: { ...props, 'data-testid': 'line-chart' } };
  },
  Line: () => null,
  BarChart: function BarChart(props) {
    return { type: 'div', props: { ...props, 'data-testid': 'bar-chart' } };
  },
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }) => children
}; 