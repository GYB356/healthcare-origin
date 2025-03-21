const React = require('react');

module.exports = {
  __esModule: true,
  default: function Image({ src, alt, ...props }) {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', {
      src: src || '',
      alt: alt || '',
      ...props,
    });
  },
}; 