import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const initWindowLocation = (window, url) => {
  const location = new URL(url);
  location.assign = jest.fn();
  location.replace = jest.fn();
  location.reload = jest.fn();

  /* eslint-disable no-param-reassign */
  delete window.location;
  window.location = location;
  /* eslint-enable no-param-reassign */
};

describe('App', () => {
  test('renders basepath without crashing', () => {
    initWindowLocation(window, 'https://localhost/graphiql');
    const div = document.createElement('div');
    const root = ReactDOM.createRoot(div);
    root.render(<App />);
  });

  test('renders end-point "hsl" without crashing', () => {
    initWindowLocation(
      window,
      'https://localhost/graphiql/hsl?query=%257Bfeeds%257BfeedId%257D%257D',
    );
    const div = document.createElement('div');
    const root = ReactDOM.createRoot(div);
    root.render(<App />);
  });
});
