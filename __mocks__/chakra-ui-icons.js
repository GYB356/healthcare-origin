const React = require("react");

// Create a factory for icon components
const createIconMock = (name) => {
  const Icon = (props) =>
    React.createElement("span", {
      "data-testid": `${name.toLowerCase()}-icon`,
      "aria-hidden": true,
      ...props,
    });
  Icon.displayName = name;
  return Icon;
};

// Create common icons
const CheckCircleIcon = createIconMock("CheckCircleIcon");
const WarningIcon = createIconMock("WarningIcon");
const InfoIcon = createIconMock("InfoIcon");
const ErrorIcon = createIconMock("ErrorIcon");
const CloseIcon = createIconMock("CloseIcon");
const SearchIcon = createIconMock("SearchIcon");
const AddIcon = createIconMock("AddIcon");
const DeleteIcon = createIconMock("DeleteIcon");
const EditIcon = createIconMock("EditIcon");
const ViewIcon = createIconMock("ViewIcon");
const ChevronDownIcon = createIconMock("ChevronDownIcon");
const ChevronUpIcon = createIconMock("ChevronUpIcon");
const ChevronRightIcon = createIconMock("ChevronRightIcon");
const ChevronLeftIcon = createIconMock("ChevronLeftIcon");

module.exports = {
  CheckCircleIcon,
  WarningIcon,
  InfoIcon,
  ErrorIcon,
  CloseIcon,
  SearchIcon,
  AddIcon,
  DeleteIcon,
  EditIcon,
  ViewIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
};
