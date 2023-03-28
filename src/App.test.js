import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const initWindowLocation = (window, url) => {
  const location = new URL(url);
  location.assign = jest.fn();
  location.replace = jest.fn();
  location.reload = jest.fn();

  delete window.location;
  window.location = location;
};

describe('App', () => {

  test('renders basepath without crashing', () => {
    initWindowLocation(window, 'https://localhost/graphiql');
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('renders end-point "hsl" without crashing', () => {
    initWindowLocation(window, 'https://localhost/graphiql/hsl?query=%257Bfeeds%257BfeedId%257D%257D');
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
