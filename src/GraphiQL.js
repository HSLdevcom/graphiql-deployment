import React, { useEffect, useState, useMemo } from 'react';
import { Route, withRouter } from 'react-router-dom';

import GraphiQL from 'graphiql';
import { usePrettifyEditors, useHistoryContext } from '@graphiql/react';
import 'graphiql/graphiql.css';

import './fix.css';
import graphQLFetcher from './api/graphQLFetcher';

const API_TYPES = {
  prod: { label: 'Production' },
  dev: { label: 'Development' }
};

const areConfigsEqual = (config1, config2) => {
  return config1.router === config2.router &&
    Boolean(config1.api) &&
    Boolean(config2.api)
    ? config1.api === config2.api
    : true;
};

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

/**
 * Customized GraphiQL UI. Component should not be re-rendered on state change
 * and thus state management is responsibility of parent
 * (CustomGraphiQLWrapper) component and this component is memoized with custom
 * property comparator function to allow re-rendering only when property
 * `apiType` changes.
 *
 * @param {Object.<String, *>} props
 */
const PureCustomGraphiQL = ({
  config,
  configs,
  graphQLFetcher,
  query,
  variables,
  operationName,
  setQuery,
  setVariables,
  setOperationName,
  onSelectApi,
  apiType,
  hasRoute,
  setApiType,
  alert
}) => (
  <GraphiQL
    fetcher={graphQLFetcher(config.routerUrl[apiType])}
    query={query ? query : undefined}
    variables={variables ? variables : undefined}
    operationName={operationName ? operationName : undefined}
    onEditQuery={(query) => setQuery(query)}
    onEditVariables={(variables) => setVariables(variables)}
    onEditOperationName={(operationName) => setOperationName(operationName)}>
    <GraphiQL.Toolbar>
      <PrettifyButton />
      <ToggleHistoryButton />
      <span
        style={{
          paddingTop: 3
        }}>
        Endpoint:
      </span>
      <GraphiQL.Menu
        label={config.title || 'Endpoint'}
        title="Change GraphQL endpoint">
        {configs
          .filter((it) => Boolean(it.routerUrl[apiType]))
          .map((it) => (
            <GraphiQL.MenuItem
              key={it.router + ':' + it.api}
              title={it.title}
              label={it.title}
              selected={areConfigsEqual(it, config)}
              onSelect={() => onSelectApi(it.router, it.api)}
            />
          ))}
      </GraphiQL.Menu>
      <span
        style={{
          paddingTop: 3
        }}>
        API version:
      </span>
      <GraphiQL.Menu
        label={apiType ? API_TYPES[apiType].label : 'API version'}
        title="Change API version">
        {['prod', 'dev'].map((type) => (
          <GraphiQL.MenuItem
            key={type}
            title={API_TYPES[type].label}
            label={API_TYPES[type].label}
            selected={apiType === type}
            onSelect={() => {
              if (hasRoute(config.router, config.api, type)) {
                setApiType(type);
              } else {
                alert(
                  `No endpoint exists for API version: ${API_TYPES[type].label}`
                );
              }
            }}
          />
        ))}
      </GraphiQL.Menu>
    </GraphiQL.Toolbar>
  </GraphiQL>
);

const NonFlickeringCustomGraphiQL = React.memo(
  PureCustomGraphiQL,
  (props, newProps) => {
    // Compare only apiType as the single source of truth for other properties
    // is window.location and thus rendering is managed by wrapper component.
    return props.apiType === newProps.apiType;
  }
);

const CustomGraphiQLWrapper = ({
  location,
  push,
  configs,
  config,
  replace,
  subscriptionKey,
  subscriptionKeyParam
}) => {
  const [query, setQuery] = useState();
  const [variables, setVariables] = useState();
  const [operationName, setOperationName] = useState();
  const [apiType, setApiType] = useState(
    (!!location.state && location.state.apiType) ||
      (window.location.hostname === 'api.digitransit.fi' ? 'prod' : 'dev')
  );

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

  const hasRoute = (router, api, apiType) =>
    Boolean(
      configs.find(
        (config) =>
          config.router === router &&
          config.api === api &&
          config.routerUrl[apiType]
      )
    );

  const getDefaultRouter = (router) => getDefaultApi(configs, router).router;

  const onSelectApi = (router, api) => {
    const pathname = hasRoute(router, api, apiType)
      ? `/${router}/${api}`
      : '/' + getDefaultRouter(router);

    push({
      pathname,
      search: getQueryString(query, variables, operationName),
      state: { apiType: apiType }
    });
  };

  return (
    <NonFlickeringCustomGraphiQL
      alert={alert}
      apiType={apiType}
      config={config}
      configs={configs}
      graphQLFetcher={(apiUrl) =>
        graphQLFetcher(apiUrl, subscriptionKey, subscriptionKeyParam)
      }
      hasRoute={hasRoute}
      onSelectApi={onSelectApi}
      operationName={operationName}
      query={query}
      setApiType={setApiType}
      setOperationName={setOperationName}
      setQuery={setQuery}
      setVariables={setVariables}
      variables={variables}
    />
  );
};

const withSubscriptionKey = (Component) => (props) =>
  (
    <Component
      {...props}
      subscriptionKey={process.env.REACT_APP_API_SUBSCRIPTION_KEY}
      subscriptionKeyParam={process.env.REACT_APP_API_SUBSCRIPTION_KEY_PARAM}
    />
  );

const GraphiQLRoute = withSubscriptionKey(
  withRouter(
    ({
      location,
      history,
      configs,
      config,
      isDefault = false,
      subscriptionKey = null,
      subscriptionKeyParam = null
    }) => (
      <Route
        path={
          isDefault ? '/' + config.router : `/${config.router}/${config.api}`
        }
        exact
        render={() => (
          <>
            <CustomGraphiQLWrapper
              location={location}
              push={history.push}
              replace={history.replace}
              configs={configs}
              config={config}
              subscriptionKey={subscriptionKey}
              subscriptionKeyParam={subscriptionKeyParam}
            />
          </>
        )}
      />
    )
  )
);

const parseConfig = (configObjs) =>
  configObjs.reduce(
    (acc, config) =>
      Object.entries(config.api).reduce(
        (acc, [apiName, configApi]) => [
          ...acc,
          {
            ...configApi,
            api: apiName,
            router: config.router
          }
        ],
        acc
      ),
    []
  );

const getDefaultApi = (configs, router) => {
  return configs.find((config) => config.router === router);
};

const GraphiQLRoutes = ({ configObjs }) => {
  // build config list for toolbar selectors
  const configs = useMemo(() => parseConfig(configObjs), [configObjs]);

  const routes = configs.map((config) => (
    <GraphiQLRoute
      key={`${config.router}:${config.api}`}
      configs={configs}
      config={config}
    />
  ));

  // default route is route without api version (eg. /hsl --> /hsl/v1)
  const defaultRoutes = configObjs.map((configObj) => (
    <GraphiQLRoute
      key={`${configObj.router}`}
      configs={configs}
      config={getDefaultApi(configs, configObj.router)}
      isDefault
    />
  ));

  return [...defaultRoutes, ...routes];
};

export default GraphiQLRoutes;
