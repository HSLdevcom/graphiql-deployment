import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

import GraphiQL from './GraphiQL';

/**
 *
 * @param {String} apiType 'dev' or 'prod'
 * @param {String} version 'v1' or 'v2'
 * @param {String} router router name (eg. 'hsl', 'waltti', ...)
 * @param {String} dialect api dialect (eg. 'gtfs' or 'transmodel')
 * @param {String} dialectVersion version of the api dialect (eg. 'v1')
 * @returns
 */
const buildUrl = (apiType, version, router, dialect, dialectVersion) => {
  const apiPath = version === 'v1' ? `routers/${router}/index/graphql` : `${router}/${dialect}/${dialectVersion}`;
  return `https://${
    apiType === 'dev' ? 'dev-api' : 'api'
  }.digitransit.fi/routing/${version}/${apiPath}`;
}

const VERSION_1 = 'v1';
const VERSION_2 = 'v2';

const configs = [
  {
    router: 'hsl',
    api: {
      v1: {
        title: 'HSL (v1 Deprecated)',
        routerUrl: {
          dev: buildUrl('dev', VERSION_1, 'hsl'),
          prod: buildUrl('prod', VERSION_1, 'hsl')
        }
      },
      v2: {
        title: 'HSL (v2)',
        apis: [
          {
            title: 'GTFS (v1)',
            routerUrl: {
              dev: buildUrl('dev', VERSION_2, 'hsl', 'gtfs', 'v1'),
              prod: buildUrl('prod', VERSION_2, 'hsl', 'gtfs', 'v1')
            }
          }
        ]
      }
    }
  },
  {
    router: 'waltti',
    api: {
      v1: {
        title: 'Waltti (v1 Deprecated)',
        routerUrl: {
          dev: buildUrl('dev', VERSION_1, 'waltti'),
          prod: buildUrl('prod', VERSION_1, 'waltti')
        }
      },
      v2: {
        title: 'Waltti (v2)',
        apis: [
          {
            title: 'GTFS (v1)',
            routerUrl: {
              dev: buildUrl('dev', VERSION_2, 'waltti', 'gtfs', 'v1'),
              prod: buildUrl('prod', VERSION_2, 'waltti', 'gtfs', 'v1')
            }
          }
        ]
      }
    }
  },
  {
    router: 'waltti-alt',
    api: {
      v2: {
        title: 'Waltti alt. (v2)',
        apis: [
          {
            title: 'GTFS (v1)',
            routerUrl: {
              dev: buildUrl('dev', VERSION_2, 'waltti-alt', 'gtfs', 'v1'),
              prod: buildUrl('prod', VERSION_2, 'waltti-alt', 'gtfs', 'v1')
            }
          }
        ]
      }
    }
  },
  {
    router: 'finland',
    api: {
      v1: {
        title: 'Finland (v1 Deprecated)',
        routerUrl: {
          dev: buildUrl('dev', VERSION_1, 'finland'),
          prod: buildUrl('prod', VERSION_1, 'finland')
        }
      },
      v2: {
        title: 'Finland (v2)',
        apis: [
          {
            title: 'GTFS (v1)',
            routerUrl: {
              dev: buildUrl('dev', VERSION_2, 'finland', 'gtfs', 'v1'),
              prod: buildUrl('prod', VERSION_2, 'finland', 'gtfs', 'v1')
            }
          }
        ]
      }
    }
  },
  {
    router: 'varely',
    api: {
      v2: {
        title: 'VARELY (v2)',
        apis: [
          {
            title: 'GTFS (v1)',
            routerUrl: {
              dev: buildUrl('dev', VERSION_2, 'varely', 'gtfs', 'v1'),
              prod: buildUrl('prod', VERSION_2, 'varely', 'gtfs', 'v1')
            }
          }
        ]
      }
    }
  }
];

export default class App extends React.Component {
  render() {
    return (
      <Router basename="/graphiql">
        <GraphiQL configObjs={configs} />
        <Route path="/" exact>
          <Redirect to="/hsl" />
        </Route>
      </Router>
    );
  }
}
