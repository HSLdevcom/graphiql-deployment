import React, { useEffect, useState, useMemo } from 'react';
import { Route, withRouter } from 'react-router-dom';

import GraphiQL from 'graphiql';
import { usePrettifyEditors, useHistoryContext } from '@graphiql/react';
import 'graphiql/graphiql.css';

import './fix.css';


const API_TYPES = {
  prod: { label: 'Production' },
  dev: { label: 'Development' }
};

const digitransitUrl = (apiType, router) =>
  `https://${
    apiType === 'dev' ? 'dev-api' : 'api'
  }.digitransit.fi/routing/v1/routers/${router}/index/graphql`;

const graphQLFetcher = (apiType, router) => (graphQLParams) =>
  fetch(digitransitUrl(apiType, router), {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(graphQLParams)
  }).then((response) => response.json());


const isSelected = (config, router) => config.router === router;

const getQueryString = (query, variables, operationName) => {
  const urlSearchParams = new URLSearchParams();
  query && urlSearchParams.set('query', encodeURIComponent(query));
  variables && urlSearchParams.set('variables', encodeURIComponent(variables));
  operationName &&
    urlSearchParams.set('operationName', encodeURIComponent(operationName));

  return `?${urlSearchParams.toString()}`;
};

const PrettifyButton = () => {
  const prettify = usePrettifyEditors();

  return (
    <GraphiQL.ToolbarButton
      onClick={prettify}
      title="Prettify Query (Shift-Ctrl-P)"
      label="Prettify"
    />
  );
};

const ToggleHistoryButton = () => {
  const historyCtx = useHistoryContext();
  return (
    <GraphiQL.ToolbarButton
      onClick={() => historyCtx?.toggle()}
      title="Show History"
      label="History"
    />
  );
};

const buildLookup = (arr, propName) =>
  Array.isArray(arr) &&
  arr.reduce((acc, x) => ({ ...acc, [x[propName]]: x }), {});

const CustomGraphiQL = ({ location, push, configs, replace, router }) => {
  const [query, setQuery] = useState();
  const [variables, setVariables] = useState();
  const [operationName, setOperationName] = useState();
  const [apiType, setApiType] = useState(
    (!!location.state && location.state.apiType) ||
      (window.location.hostname === 'api.digitransit.fi' ? 'prod' : 'dev')
  );

  // build { waltti: {router: 'waltti', title: 'Waltti:, ...}} style lookup
  const endpoints = useMemo(() => buildLookup(configs, 'router'), [configs]);

  useEffect(() => {
    const queryString = getQueryString(query, variables, operationName);
    replace(queryString);
  }, [replace, query, variables, operationName]);

  useEffect(
    (location) => {
      if (!location) {
        return;
      }

      const urlSearchParams = new URLSearchParams(location.search);

      const query =
        urlSearchParams.has('query') &&
        decodeURIComponent(urlSearchParams.get('query'));
      const variables =
        urlSearchParams.has('variables') &&
        decodeURIComponent(urlSearchParams.get('variables'));
      const operationName =
        urlSearchParams.has('operationName') &&
        decodeURIComponent(urlSearchParams.get('operationName'));

      setQuery(query);
      setVariables(variables);
      setOperationName(operationName);
    },
    [location]
  );

  return (
    <GraphiQL
      fetcher={graphQLFetcher(apiType, router)}
      query={query ? query : undefined}
      variables={variables ? variables : undefined}
      operationName={operationName ? operationName : undefined}
      onEditQuery={(query) => setQuery(query)}
      onEditVariables={(variables) => setVariables(variables)}
      onEditOperationName={(operationName) => setOperationName(operationName)}>
      <GraphiQL.Toolbar>
        <PrettifyButton />
        <ToggleHistoryButton />
        <span style={{ paddingTop: 3 }}>Endpoint:</span>
        <GraphiQL.Menu
          label={router ? endpoints[router].title : 'Endpoint'}
          title="Change GraphQL endpoint">
          {configs.map((config) => (
            <GraphiQL.MenuItem
              key={config.router}
              title={config.title}
              label={config.title}
              selected={isSelected(config, router)}
              onSelect={() =>
                push({
                  pathname: `/${config.router}`,
                  search: getQueryString(query, variables, operationName),
                  state: { apiType: apiType }
                })
              }
            />
          ))}
        </GraphiQL.Menu>
        <span style={{ paddingTop: 3 }}>API version:</span>
        <GraphiQL.Menu
          label={apiType ? API_TYPES[apiType].label : 'API version'}
          title="Change API version">
          {['prod', 'dev'].map((type) => (
            <GraphiQL.MenuItem
              key={type}
              title={API_TYPES[type].label}
              label={API_TYPES[type].label}
              selected={apiType === type}
              onSelect={() => setApiType(type)}
            />
          ))}
        </GraphiQL.Menu>
      </GraphiQL.Toolbar>
    </GraphiQL>
  );
};

const GraphiQLRoute = withRouter(({ location, history, router, configs }) => (
  <Route
    path={'/' + router}
    render={() => (
      <CustomGraphiQL
        location={location}
        push={history.push}
        replace={history.replace}
        router={router}
        configs={configs}
      />
    )}
  />
));

const GraphiQLRoutes = ({ configs }) =>
  configs.map((config) => (
    <GraphiQLRoute
      key={config.router}
      router={config.router}
      configs={configs}
    />
  ));

export default GraphiQLRoutes;
