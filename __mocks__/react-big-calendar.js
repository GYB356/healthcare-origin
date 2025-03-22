// Mock for react-big-calendar
const Calendar = (props) => {
  return { type: 'div', props: { ...props, 'data-testid': 'calendar' } };
};

Calendar.Views = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
};

module.exports = Calendar; 