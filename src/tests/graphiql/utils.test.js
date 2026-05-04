import { describe, it, expect } from 'vitest';
import {
  addSubscriptionKey,
  getQueryString,
  getQueryParameterValues,
} from '../../graphiql/utils';

describe('addSubscriptionKey', () => {
  it('should set URL subscription key', () => {
    const url = addSubscriptionKey(
      'https://api.example.com/graphiql',
      'secret1',
      'subscription-key',
    );
    expect(url.pathname).toEqual('/graphiql');
    expect(url.searchParams.get('subscription-key')).toEqual('secret1');
  });

  it('should add subscription key to URL without removing existing query params', () => {
    const url = addSubscriptionKey(
      'https://api.example.com/graphiql?query=my-graphiql-query',
      'secret1',
      'subscription-key',
    );
    expect(url.pathname).toEqual('/graphiql');
    expect(url.searchParams.get('query')).toEqual('my-graphiql-query');
    expect(url.searchParams.get('subscription-key')).toEqual('secret1');
  });
});

describe('getQueryString', () => {
  it('returns empty string when all params are empty', () => {
    expect(getQueryString()).toEqual('');
    expect(getQueryString('', '', '', '')).toEqual('');
  });

  it('returns empty string when variables/headers are only empty braces', () => {
    expect(getQueryString(null, '{}', '{}', null)).toEqual('');
    expect(getQueryString(null, '[]', '[]', null)).toEqual('');
    expect(getQueryString(null, '  {}  ', '  {}  ', null)).toEqual('');
  });

  it('encodes a query with special characters without double-encoding', () => {
    const qs = getQueryString('{ stop { id } }');
    const params = new URLSearchParams(qs);
    expect(params.get('query')).toEqual('{ stop { id } }');
  });

  it('includes all provided params', () => {
    const qs = getQueryString(
      '{ stop { id } }',
      '{"id": "1"}',
      '{"x-key": "abc"}',
      'prod',
    );
    const params = new URLSearchParams(qs);
    expect(params.get('query')).toEqual('{ stop { id } }');
    expect(params.get('variables')).toEqual('{"id": "1"}');
    expect(params.get('headers')).toEqual('{"x-key": "abc"}');
    expect(params.get('apiType')).toEqual('prod');
  });
});

describe('getQueryParameterValues', () => {
  const makeLocation = search => ({ search });

  it('returns empty object when there is no search string', () => {
    expect(getQueryParameterValues(makeLocation(''))).toEqual({});
  });

  it('reads all supported params from the URL', () => {
    const qs = getQueryString(
      '{ stop { id } }',
      '{"id": "1"}',
      '{"x-key": "abc"}',
      'prod',
    );
    const values = getQueryParameterValues(makeLocation(qs));
    expect(values.query).toEqual('{ stop { id } }');
    expect(values.variables).toEqual('{"id": "1"}');
    expect(values.headers).toEqual('{"x-key": "abc"}');
    expect(values.apiType).toEqual('prod');
  });

  it('returns null for absent params', () => {
    const values = getQueryParameterValues(makeLocation('?query=hello'));
    expect(values.query).toEqual('hello');
    expect(values.variables).toBeNull();
    expect(values.headers).toBeNull();
    expect(values.apiType).toBeNull();
  });

  it('round-trips without double-encoding', () => {
    const original = '{ stop(id: "HSL:1140447") { name } }';
    const qs = getQueryString(original);
    const values = getQueryParameterValues(makeLocation(qs));
    expect(values.query).toEqual(original);
  });
});
