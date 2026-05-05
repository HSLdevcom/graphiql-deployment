import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  addSubscriptionKey,
  getQueryString,
  getQueryParameterValues,
  readGraphiQLTabValues,
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
  it('always includes urlVersion=2', () => {
    const params = new URLSearchParams(getQueryString());
    expect(params.get('urlVersion')).toEqual('2');
  });

  it('omits empty/trivial variables and headers but keeps urlVersion', () => {
    const check = qs => {
      const params = new URLSearchParams(qs);
      expect(params.has('variables')).toBe(false);
      expect(params.has('headers')).toBe(false);
      expect(params.get('urlVersion')).toEqual('2');
    };
    check(getQueryString(null, '{}', '{}', null));
    check(getQueryString(null, '[]', '[]', null));
    check(getQueryString(null, '  {}  ', '  {}  ', null));
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
    expect(params.get('urlVersion')).toEqual('2');
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

  it('decodes legacy double-encoded query param', () => {
    // Simulate an old-format URL where the value was passed through
    // encodeURIComponent before being given to URLSearchParams, resulting in
    // double-encoding.  Construct it the same way the old code did.
    const original = '{ stop { id } }';
    const oldStyleSearch = new URLSearchParams();
    oldStyleSearch.set('query', encodeURIComponent(original));
    oldStyleSearch.set('variables', encodeURIComponent('{"id":"1"}'));
    const values = getQueryParameterValues(
      makeLocation(`?${oldStyleSearch.toString()}`),
    );
    expect(values.query).toEqual(original);
    expect(values.variables).toEqual('{"id":"1"}');
  });

  it('leaves new-format values unchanged (no residual %XX sequences)', () => {
    const original = '{ stop { id } }';
    const qs = getQueryString(original);
    const values = getQueryParameterValues(makeLocation(qs));
    // Value must equal the original with no stray percent-encoding
    expect(values.query).toEqual(original);
    expect(/%[0-9A-Fa-f]{2}/.test(values.query)).toBe(false);
  });

  it('does not decode %XX sequences in new-format values (urlVersion=2 guard)', () => {
    // A new-format variables value that legitimately contains a percent-encoded
    // sequence (e.g. a URL inside a JSON object). The urlVersion=2 flag must
    // prevent tryLegacyDecode from corrupting it.
    const original = '{"url": "https://example.com/path?id=50%25encoded"}';
    const qs = getQueryString(null, original, null, null);
    const values = getQueryParameterValues(makeLocation(qs));
    expect(values.variables).toEqual(original);
  });

  it('returns raw value unchanged when decoding would fail (bare % sign)', () => {
    // A query that contains a literal %, which is not a valid percent-encoded
    // sequence — decodeURIComponent would throw, so we keep the raw value.
    const rawValue = '50% off';
    const params = new URLSearchParams();
    params.set('query', rawValue);
    const values = getQueryParameterValues(
      makeLocation(`?${params.toString()}`),
    );
    expect(values.query).toEqual(rawValue);
  });
});

describe('readGraphiQLTabValues', () => {
  const TAB_STATE_KEY = 'graphiql:tabState';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns empty object when localStorage has no tabState', () => {
    expect(readGraphiQLTabValues()).toEqual({});
  });

  it('returns active tab values from stored tabState', () => {
    const tabState = {
      activeTabIndex: 0,
      tabs: [
        {
          id: 'tab-1',
          title: 'Tab 1',
          query: '{ stop { id } }',
          variables: '{"id": "1"}',
          headers: null,
          operationName: null,
          response: null,
        },
      ],
    };
    localStorage.setItem(TAB_STATE_KEY, JSON.stringify(tabState));
    const values = readGraphiQLTabValues();
    expect(values.query).toEqual('{ stop { id } }');
    expect(values.variables).toEqual('{"id": "1"}');
    expect(values.headers).toBeNull();
  });

  it('returns the active tab when there are multiple tabs', () => {
    const tabState = {
      activeTabIndex: 1,
      tabs: [
        {
          id: 'tab-1',
          title: 'Tab 1',
          query: 'query A { stop { id } }',
          variables: null,
          headers: null,
          operationName: null,
          response: null,
        },
        {
          id: 'tab-2',
          title: 'Tab 2',
          query: 'query B { route { id } }',
          variables: '{"limit": 10}',
          headers: null,
          operationName: null,
          response: null,
        },
      ],
    };
    localStorage.setItem(TAB_STATE_KEY, JSON.stringify(tabState));
    const values = readGraphiQLTabValues();
    expect(values.query).toEqual('query B { route { id } }');
    expect(values.variables).toEqual('{"limit": 10}');
  });

  it('returns empty object on malformed JSON', () => {
    localStorage.setItem(TAB_STATE_KEY, 'not-valid-json{{');
    expect(readGraphiQLTabValues()).toEqual({});
  });
});
