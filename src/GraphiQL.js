import React, { useEffect, useState, useMemo } from 'react';
import { Route, withRouter } from 'react-router-dom';

import GraphiQL from 'graphiql';
import { usePrettifyEditors, useHistoryContext } from '@graphiql/react';
import 'graphiql/graphiql.css';

import './fix.css';
import graphQLFetcher from './api/graphQLFetcher';

import { API_VERSION_2, DIALECT_VERSION_1, API_TYPE, API_CONFIG, PRODUCTION_API_URL } from './constants';

const areConfigsEqual = (config1, config2) => {
  return config1.router === config2.router &&
    Boolean(config1.apiVersion) &&
    Boolean(config2.apiVersion)
    ? config1.apiVersion === config2.apiVersion
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
              key={it.router + ':' + it.apiVersion}
              title={it.title}
              label={it.title}
              selected={areConfigsEqual(it, config)}
              onSelect={() => onSelectApi(it.router, it.apiVersion)}
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
        label={apiType ? API_CONFIG[apiType].label : 'API version'}
        title="Change API version">
        {Object.entries(API_CONFIG).map(([elementApiType, elementApiConfig]) => (
          <GraphiQL.MenuItem
            key={elementApiType}
            title={elementApiConfig.label}
            label={elementApiConfig.label}
            selected={apiType === elementApiType}
            onSelect={() => {
              if (hasRoute(config.router, config.apiVersion, elementApiType)) {
                setApiType(elementApiType);
              } else {
                alert(
                  `No endpoint exists for API version: ${elementApiConfig.label}`
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
    // Compare only apiType. The single source of truth for other properties
    // is `window.location` and thus rendering is managed by wrapper component.
    return props.apiType === newProps.apiType;
  }
);

const QUERY_STRING_PARAMS = ['query', 'variables', 'operationName'];

/**
 * Get query from URL and provide update function for application
 * @param {RouterLocation} location
 */
const useQuery = (location) => {
  const params = new URLSearchParams(location.search);

  let initial = location.search
    ? QUERY_STRING_PARAMS.reduce(
        (output, paramName) => ({
          ...output,
          [paramName]:
            params.has(paramName) && decodeURIComponent(params.get(paramName))
        }),
        {}
      )
    : {};

  const [query, setQuery] = useState(initial.query);
  const [variables, setVariables] = useState(initial.variables);
  const [operationName, setOperationName] = useState(initial.operationName);

  return {
    query,
    variables,
    operationName,
    setQuery,
    setVariables,
    setOperationName
  };
};

const CustomGraphiQLWrapper = ({
  location,
  push,
  configs,
  config,
  replace,
  prodSubscriptionKey,
  subscriptionKeyParam,
  devSubscriptionKey
}) => {
  const {
    query,
    variables,
    operationName,
    setQuery,
    setVariables,
    setOperationName
  } = useQuery(location);

  const [apiType, setApiType] = useState(
    (!!location.state && location.state.apiType) ||
      (window.location.hostname === PRODUCTION_API_URL ? API_TYPE.PROD : API_TYPE.DEV)
  );

  useEffect(() => {
    const queryString = getQueryString(query, variables, operationName);
    replace(queryString);
  }, [replace, query, variables, operationName]);

  const hasRoute = (router, apiVersion, apiType) =>
    Boolean(
      configs.find(
        (config) =>
          config.router === router &&
          config.apiVersion === apiVersion &&
          config.routerUrl[apiType]
      )
    );

  const onSelectApi = (router, api) => {
    push({
      pathname: getPath(!hasRoute(router, api, apiType), router, api),
      search: getQueryString(query, variables, operationName),
      state: { apiType: apiType }
    });
  };

  const subscriptionKey = apiType === API_TYPE.PROD ? prodSubscriptionKey : devSubscriptionKey;
  
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
      prodSubscriptionKey={process.env.REACT_APP_API_SUBSCRIPTION_KEY}
      devSubscriptionKey={process.env.REACT_APP_DEV_API_SUBSCRIPTION_KEY}
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
      prodSubscriptionKey = null,
      subscriptionKeyParam = null,
      devSubscriptionKey = null,
    }) => (
      <Route
        path={getPath(isDefault, config.router, config.apiVersion)}
        exact
        render={() => (
          <>
            <CustomGraphiQLWrapper
              location={location}
              push={history.push}
              replace={history.replace}
              configs={configs}
              config={config}
              prodSubscriptionKey={prodSubscriptionKey}
              subscriptionKeyParam={subscriptionKeyParam}
              devSubscriptionKey={devSubscriptionKey}
            />
          </>
        )}
      />
    )
  )
);

const parseConfig = (configs) =>
  configs.reduce(
    (acc, config) =>
      Object.entries(config.api).reduce(
        (acc, [apiVersion, apiConfig]) =>
          apiVersion === API_VERSION_2 ?
            Object.entries(apiConfig.dialect).reduce(
              (acc, [dialectName, dialectNameConfig]) =>
                Object.entries(dialectNameConfig).reduce(
                  (acc, [dialectVersion, dialectConfig]) => [
                    ...acc,
                    {
                      ...dialectConfig,
                      apiVersion: apiVersion,
                      router: config.router,
                      dialect: dialectName,
                      dialectVersion: dialectVersion,
                      title: `${apiConfig.title} - ${dialectConfig.title}`
                    }
                  ],
                  acc
                ),
                acc
            ) :
            [
              ...acc,
              {
                ...apiConfig,
                apiVersion: apiVersion,
                router: config.router,
                dialect: null,
                dialectVersion: null
              }
            ],
        acc
      ),
    []
  );

const getDefaultApi = (configs, router, apiVersion, dialect, dialectVersion) => {
  return apiVersion === API_VERSION_2 ?
    configs.find((config) =>
      config.router === router &&
      config.apiVersion === apiVersion &&
      config.dialect === dialect &&
      config.dialectVersion === dialectVersion
    ) :
    configs.find((config) =>
      config.router === router &&
      config.apiVersion === apiVersion
    )
};

const getPath = (isDefault, router, apiVersion, dialect, dialectVersion) => {
  return isDefault ?
    `/${router}` : 
    apiVersion === API_VERSION_2 ?
      `/${router}/${apiVersion}/${dialect}/${dialectVersion}` :
      `/${router}/${apiVersion}`
}

const GraphiQLRoutes = ({ configs }) => {
  // build config list for toolbar selectors
  const parsedConfigs = useMemo(() => parseConfig(configs), [configs]);

  const routes = parsedConfigs.map((config) => (
    <GraphiQLRoute
      key={`${config.router}:${config.apiVersion}`}
      configs={parsedConfigs}
      config={config}
    />
  ));

  // the default route is a route without the api version (eg. /hsl --> /hsl/v2)
  const defaultRoutes = configs.map((config) => (
    <GraphiQLRoute
      key={`${config.router}`}
      configs={parsedConfigs}
      config={getDefaultApi(parsedConfigs, config.router, API_VERSION_2, 'gtfs', DIALECT_VERSION_1)}
      isDefault
    />
  ));

  return [...defaultRoutes, ...routes];
};

export default GraphiQLRoutes;
