const React = require("react");

const ReportViewer = ({ appointmentId }) => {
  return React.createElement(
    "div",
    { "data-testid": "mock-report-viewer" },
    `Report for appointment ${appointmentId}`,
  );
};

module.exports = ReportViewer;
