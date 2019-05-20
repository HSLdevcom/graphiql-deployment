import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';

const digitransitUrl = router => `https://api.digitransit.fi/routing/v1/routers/${router}/index/graphql`

const graphQLFetcher = router => graphQLParams => fetch(digitransitUrl(router), {
  method: 'post',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(graphQLParams),
}).then(response => response.json());

class CustomGraphiQL extends React.Component {
  constructor(props) {
    super(props);

    const urlSearchParams = new URLSearchParams(props.location.search)

    const query = urlSearchParams.has('query') ?
                  decodeURIComponent(urlSearchParams.get('query')) :
                  props.location.state && props.location.state.query
    const variables = urlSearchParams.has('variables') ?
                  decodeURIComponent(urlSearchParams.get('variables')) :
                  props.location.state && props.location.state.variables
    const operationName = urlSearchParams.has('operationName') ?
                  decodeURIComponent(urlSearchParams.get('operationName')) :
                  props.location.state && props.location.state.operationName

    this.state = { query, variables, operationName }

    this.graphiql = React.createRef()
  }

  isSelected = config => config.router === this.props.router

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.query !== nextState.query || this.state.variables !== nextState.variables || this.state.operationName !== nextState.operationName) {
      const urlSearchParams = new URLSearchParams()
      this.state.query && urlSearchParams.set('query', encodeURIComponent(this.state.query))
      this.state.variables && urlSearchParams.set('variables', encodeURIComponent(this.state.variables))
      this.state.operationName && urlSearchParams.set('operationName', encodeURIComponent(this.state.operationName))

      this.props.replace({ search: "?"+urlSearchParams.toString() })
    }

    return this.props.location.pathname !== nextProps.location.pathname
  }

  render() {
    return (
      <GraphiQL 
        ref={this.graphiql} 
        fetcher={graphQLFetcher(this.props.router)}
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
          <GraphiQL.Select label="Endpoint" title="Change GraphQL endpoint">
            {
                this.props.configs.map(config =>
                    <GraphiQL.SelectOption 
                        key={config.router}
                        title={config.title}
                        label={config.title}
                        selected={this.isSelected(config)}
                        onSelect={() => this.props.push({ pathname: "/"+config.router, state: this.state })}
                    />
                )
            }
          </GraphiQL.Select>
        </GraphiQL.Toolbar>
      </GraphiQL>
    );
  }
}

const GraphiQLRoute = withRouter(({ location, history, router, configs }) => (
  <Route path={"/"+router} render={() => <CustomGraphiQL location={location} push={history.push} replace={history.replace} router={router} configs={configs}/>} />
))

export default ({ configs }) => configs.map(config => 
  <GraphiQLRoute key={config.router} router={config.router} configs={configs} />
)