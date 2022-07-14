import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';

import './fix.css';

const digitransitUrl = (apiType, router) => `https://${apiType === 'dev' ? 'dev-api' : 'api'}.digitransit.fi/routing/v1/routers/${router}/index/graphql`

const graphQLFetcher = (apiType, router) => graphQLParams => fetch(digitransitUrl(apiType, router), {
  method: 'post',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(graphQLParams),
}).then(response => response.json());

class CustomGraphiQL extends React.Component {
  constructor(props) {
    super(props);

    const urlSearchParams = new URLSearchParams(props.location.search)

    const query = urlSearchParams.has('query') && decodeURIComponent(urlSearchParams.get('query'))
    const variables = urlSearchParams.has('variables') && decodeURIComponent(urlSearchParams.get('variables'))
    const operationName = urlSearchParams.has('operationName') && decodeURIComponent(urlSearchParams.get('operationName'))

    this.state = { query, variables, operationName, apiType: (!!props.location.state && props.location.state.apiType) || (window.location.hostname === 'api.digitransit.fi' ? 'prod' : 'dev') }
    
    this.graphiql = React.createRef()
  }

  isSelected = config => config.router === this.props.router

  getSearchParams = (query, variables, operationName) => {
    const urlSearchParams = new URLSearchParams()
    query && urlSearchParams.set('query', encodeURIComponent(query))
    variables && urlSearchParams.set('variables', encodeURIComponent(variables))
    operationName && urlSearchParams.set('operationName', encodeURIComponent(operationName))

    return `?${urlSearchParams.toString()}`
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.query !== nextState.query || this.state.variables !== nextState.variables || this.state.operationName !== nextState.operationName) {
      this.props.replace({ search: this.getSearchParams(nextState.query, nextState.variables, nextState.operationName)})
    }

    return this.props.location.pathname !== nextProps.location.pathname || this.state.apiType !== nextState.apiType
  }

  render() {
    return (
      <GraphiQL 
        ref={this.graphiql} 
        fetcher={graphQLFetcher(this.state.apiType, this.props.router)}
        query={this.state.query ? this.state.query : undefined}
        variables={this.state.variables ? this.state.variables : undefined}
        operationName={this.state.operationName ? this.state.operationName : undefined}
        onEditQuery={query => this.setState({ query })}
        onEditVariables={variables => this.setState({ variables })}
        onEditOperationName={operationName => this.setState({ operationName })}
        >
        <GraphiQL.Toolbar>
          <GraphiQL.Button
            onClick={() => this.graphiql.current.handlePrettifyQuery()}
            title="Prettify Query (Shift-Ctrl-P)"
            label="Prettify"
          />
          <GraphiQL.Button
            onClick={() => this.graphiql.current.handleToggleHistory()}
            title="Show History"
            label="History"
          />
          <span style={{ paddingTop: 3 }}>Endpoint:</span>
          <GraphiQL.Select label="Endpoint" title="Change GraphQL endpoint">
            {
                this.props.configs.map(config =>
                    <GraphiQL.SelectOption 
                        key={config.router}
                        title={config.title}
                        label={config.title}
                        selected={this.isSelected(config)}
                        onSelect={() => this.props.push({ 
                          pathname: `/${config.router}`, 
                          search: this.getSearchParams(this.state.query, this.state.variables, this.state.operationName), 
                          state: { apiType: this.state.apiType } 
                        })}
                    />
                )
            }
          </GraphiQL.Select>
          <span style={{ paddingTop: 3 }}>API version:</span>
          <GraphiQL.Select label="API version" title="Change API version">
            <GraphiQL.SelectOption 
                title="Production"
                label="Production"
                selected={this.state.apiType === 'prod'}
                onSelect={() => this.setState({ apiType: 'prod' })}
            />
            <GraphiQL.SelectOption 
                title="Development"
                label="Development"
                selected={this.state.apiType === 'dev'}
                onSelect={() => this.setState({ apiType: 'dev' })}
            />
          </GraphiQL.Select>
        </GraphiQL.Toolbar>
      </GraphiQL>
    );
  }
}

const GraphiQLRoute = withRouter(({ location, history, router, configs }) => (
  <Route path={"/"+router} render={() => <CustomGraphiQL location={location} push={history.push} replace={history.replace} router={router} configs={configs}/>} />
))

const GraphiQLRoutes = ({ configs }) => configs.map(config => 
  <GraphiQLRoute key={config.router} router={config.router} configs={configs} />
)

export default GraphiQLRoutes