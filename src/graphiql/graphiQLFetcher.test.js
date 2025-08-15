import { describe, it, expect } from 'vitest';
import { addSubscriptionKey } from './utils';

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
