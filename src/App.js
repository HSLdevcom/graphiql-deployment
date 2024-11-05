import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

import GraphiQL from './GraphiQL';

export const API_VERSION_1 = 'v1';
export const API_VERSION_2 = 'v2';
export const DIALECT_VERSION_1 = 'v1';

/**
 *
 * @param {String} apiType 'dev' or 'prod'
 * @param {String} apiVersion 'v1' or 'v2'
 * @param {String} router router name (eg. 'hsl', 'waltti', ...)
 * @param {String} dialect api dialect (eg. 'gtfs' or 'transmodel')
 * @param {String} dialectVersion version of the api dialect (eg. 'v1')
 * @returns
 */
const buildUrl = (apiType, apiVersion, router, dialect, dialectVersion) => {
  const apiPath = apiVersion === API_VERSION_1 ? `routers/${router}/index/graphql` : `${router}/${dialect}/${dialectVersion}`;
  return `https://${
    apiType === 'dev' ? 'dev-api' : 'api'
  }.digitransit.fi/routing/${apiVersion}/${apiPath}`;
}

const configs = [
  {
    router: 'hsl',
    api: {
      [API_VERSION_1]: {
        title: 'HSL (v1 Deprecated)',
        routerUrl: {
          dev: buildUrl('dev', API_VERSION_1, 'hsl'),
          prod: buildUrl('prod', API_VERSION_1, 'hsl')
        }
      },
      [API_VERSION_2]: {
        title: 'HSL (v2)',
        dialect: {
          gtfs: {
            [DIALECT_VERSION_1]: {
              default: true,
              title: 'GTFS (v1)',
              routerUrl: {
                dev: buildUrl('dev', API_VERSION_2, 'hsl', 'gtfs', DIALECT_VERSION_1),
                prod: buildUrl('prod', API_VERSION_2, 'hsl', 'gtfs', DIALECT_VERSION_1)
              }
            }
          }
        }
      }
    }
  },
  {
    router: 'waltti',
    api: {
      [API_VERSION_1]: {
        title: 'Waltti (v1 Deprecated)',
        routerUrl: {
          dev: buildUrl('dev', API_VERSION_1, 'waltti'),
          prod: buildUrl('prod', API_VERSION_1, 'waltti')
        }
      },
      [API_VERSION_2]: {
        title: 'Waltti (v2)',
        dialect: {
          gtfs: {
            [DIALECT_VERSION_1]: {
              default: true,
              title: 'GTFS (v1)',
              routerUrl: {
                dev: buildUrl('dev', API_VERSION_2, 'waltti', 'gtfs', DIALECT_VERSION_1),
                prod: buildUrl('prod', API_VERSION_2, 'waltti', 'gtfs', DIALECT_VERSION_1)
              }
            }
          }
        }
      }
    }
  },
  {
    router: 'waltti-alt',
    api: {
      [API_VERSION_2]: {
        title: 'Waltti alt. (v2)',
        dialect: {
          gtfs: {
            [DIALECT_VERSION_1]: {
              default: true,
              title: 'GTFS (v1)',
              routerUrl: {
                dev: buildUrl('dev', API_VERSION_2, 'waltti-alt', 'gtfs', DIALECT_VERSION_1),
                prod: buildUrl('prod', API_VERSION_2, 'waltti-alt', 'gtfs', DIALECT_VERSION_1)
              }
            }
          }
        }
      }
    }
  },
  {
    router: 'finland',
    api: {
      [API_VERSION_1]: {
        title: 'Finland (v1 Deprecated)',
        routerUrl: {
          dev: buildUrl('dev', API_VERSION_1, 'finland'),
          prod: buildUrl('prod', API_VERSION_1, 'finland')
        }
      },
      [API_VERSION_2]: {
        title: 'Finland (v2)',
        dialect: {
          gtfs: {
            [DIALECT_VERSION_1]: {
              default: true,
              title: 'GTFS (v1)',
              routerUrl: {
                dev: buildUrl('dev', API_VERSION_2, 'finland', 'gtfs', DIALECT_VERSION_1),
                prod: buildUrl('prod', API_VERSION_2, 'finland', 'gtfs', DIALECT_VERSION_1)
              }
            }
          }
        }
      }
    }
  },
  {
    router: 'varely',
    api: {
      [API_VERSION_2]: {
        title: 'VARELY (v2)',
        dialect: {
          gtfs: {
            [DIALECT_VERSION_1]: {
              default: true,
              title: 'GTFS (v1)',
              routerUrl: {
                dev: buildUrl('dev', API_VERSION_2, 'varely', 'gtfs', DIALECT_VERSION_1),
                prod: buildUrl('prod', API_VERSION_2, 'varely', 'gtfs', DIALECT_VERSION_1)
              }
            }
          }
        }
      }
    }
  }
];

export default class App extends React.Component {
  render() {
    return (
      <Router basename="/graphiql">
        <GraphiQL configs={configs} />
        <Route path="/" exact>
          <Redirect to="/hsl" />
        </Route>
      </Router>
    );
  }
}
