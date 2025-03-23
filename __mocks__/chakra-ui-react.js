const React = require('react');

// Factory function to create simple component mocks
const createMockComponent = (displayName) => {
  const component = ({ children, ...props }) => {
    return React.createElement('div', {
      'data-testid': displayName.toLowerCase(),
      ...props
    }, children);
  };
  component.displayName = displayName;
  return component;
};

// Create mock components
const Box = createMockComponent('Box');
const Heading = createMockComponent('Heading');
const Text = createMockComponent('Text');
const Spinner = createMockComponent('Spinner');
const Alert = createMockComponent('Alert');
const AlertIcon = createMockComponent('AlertIcon');
const Badge = createMockComponent('Badge');
const Accordion = createMockComponent('Accordion');
const AccordionItem = createMockComponent('AccordionItem');
const AccordionButton = createMockComponent('AccordionButton');
const AccordionPanel = createMockComponent('AccordionPanel');
const AccordionIcon = createMockComponent('AccordionIcon');
const List = createMockComponent('List');
const ListItem = createMockComponent('ListItem');
const ListIcon = createMockComponent('ListIcon');
const Button = createMockComponent('Button');
const FormControl = createMockComponent('FormControl');
const FormLabel = createMockComponent('FormLabel');
const Input = createMockComponent('Input');
const Select = createMockComponent('Select');
const Textarea = createMockComponent('Textarea');
const Modal = createMockComponent('Modal');
const ModalOverlay = createMockComponent('ModalOverlay');
const ModalContent = createMockComponent('ModalContent');
const ModalHeader = createMockComponent('ModalHeader');
const ModalFooter = createMockComponent('ModalFooter');
const ModalBody = createMockComponent('ModalBody');
const ModalCloseButton = createMockComponent('ModalCloseButton');
const Tabs = createMockComponent('Tabs');
const TabList = createMockComponent('TabList');
const Tab = createMockComponent('Tab');
const TabPanels = createMockComponent('TabPanels');
const TabPanel = createMockComponent('TabPanel');
const Stack = createMockComponent('Stack');
const HStack = createMockComponent('HStack');
const VStack = createMockComponent('VStack');

// Mock hooks
const useDisclosure = () => ({
  isOpen: false,
  onOpen: jest.fn(),
  onClose: jest.fn(),
  onToggle: jest.fn()
});

// Export all components and hooks
module.exports = {
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Stack,
  HStack,
  VStack,
  useDisclosure
}; 