import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import GraphiQL from './GraphiQL'

const configs = [
  { title: 'HSL', router: 'hsl' }, 
  { title: 'Waltti', router: 'waltti' }, 
  { title: 'Finland', router: 'finland' }
]

export default class App extends React.Component {
  render() { 
    return (
      <Router basename="/graphiql">
        <GraphiQL configs={configs}/>
      </Router>
    );
  }
}
