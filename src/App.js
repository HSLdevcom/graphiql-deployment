import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import GraphiQL from './GraphiQL';

/**
 *
 * @param {String} apiType 'dev' or 'prod'
 * @param {String} version 'v1' or 'v2'
 * @param {String} router router name (eg. 'hsl', 'waltti', ...)
 * @returns
 */
const buildUrl = (apiType, version, router) =>
  `https://${
    apiType === 'dev' ? 'dev-api' : 'api'
  }.digitransit.fi/routing/${version}/routers/${router}/index/graphql`;

const VERSION_1 = 'v1';
const VERSION_2 = 'v2';

const configs = [
  {
    router: 'hsl',
    api: {
      v1: {
        title: 'HSL (v1)',
        routerUrl: {
          dev: buildUrl('dev', VERSION_1, 'hsl'),
          prod: buildUrl('prod', VERSION_1, 'hsl')
        }
      },
      v2: {
        title: 'HSL (v2 experimental)',
        routerUrl: {
          dev: buildUrl('dev', VERSION_2, 'hsl')
        }
      }
    }
  },
  {
    router: 'waltti',
    api: {
      v1: {
        title: 'Waltti (v1)',
        routerUrl: {
          dev: buildUrl('dev', VERSION_1, 'waltti'),
          prod: buildUrl('prod', VERSION_1, 'waltti')
        }
      },
      v2: {
        title: 'Waltti (v2 experimental)',
        routerUrl: {
          dev: buildUrl('dev', VERSION_2, 'waltti')
        }
      }
    }
  },
  {
    router: 'waltti-alt',
    api: {
      v2: {
        title: 'Waltti alt. (otp2)',
        routerUrl: {
          dev: buildUrl('dev', VERSION_2, 'waltti-alt'),
          prod: buildUrl('prod', VERSION_2, 'waltti-alt')
        }
      }
    }
  },
  {
    router: 'finland',
    api: {
      v1: {
        title: 'Finland (otp1)',
        routerUrl: {
          dev: buildUrl('dev', VERSION_1, 'finland'),
          prod: buildUrl('prod', VERSION_1, 'finland')
        }
      },
      v2: {
        title: 'Finland (otp2)',
        routerUrl: {
          dev: buildUrl('dev', VERSION_2, 'finland')
        }
      }
    }
  },
  {
    router: 'varely',
    api: {
      v2: {
        title: 'VARELY (otp2)',
        routerUrl: {
          dev: buildUrl('dev', VERSION_2, 'varely')
        }
      }
    }
  }
];

export default class App extends React.Component {
  render() {
    return (
      <Router basename="/graphiql">
        <GraphiQL configObjs={configs} />
      </Router>
    );
  }
}
