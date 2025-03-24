const React = require("react");

// Mock for react-big-calendar
const Calendar = (props) => {
  return React.createElement("div", {
    "data-testid": "calendar",
    ...props,
  });
};

Calendar.Views = {
  MONTH: "month",
  WEEK: "week",
  DAY: "day",
  AGENDA: "agenda",
};

module.exports = Calendar;
module.exports.default = Calendar;
