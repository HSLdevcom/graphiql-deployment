import { describe, it, expect } from 'vitest';
import {
  addSubscriptionKey,
  buildHeaders,
  buildRequest,
} from './graphQLFetcher';

describe('graphQLFetcher', () => {
  describe('buildHeaders', () => {
    it('should return headers with custom header', () => {
      const headers = buildHeaders({ 'X-ExtraHeader': 'abc' });
      expect(headers['X-ExtraHeader']).toEqual('abc');
      expect(headers['Content-Type']).toBeTruthy();
    });

    it('should return standard headers', () => {
      const headers = buildHeaders();
      expect(headers['Content-Type']).toBeTruthy();
    });
  });

  describe('addSubscriptionKey', () => {
    it('should set URL subscription key', () => {
      const url = addSubscriptionKey(
        'https://api.example.com/graphql',
        'secret1',
        'subscription-key',
      );
      expect(url.pathname).toEqual('/graphql');
      expect(url.searchParams.get('subscription-key')).toEqual('secret1');
    });

    it('should add subscription key to URL without removing existing query params', () => {
      const url = addSubscriptionKey(
        'https://api.example.com/graphql?query=my-graphql-query',
        'secret1',
        'subscription-key',
      );
      expect(url.pathname).toEqual('/graphql');
      expect(url.searchParams.get('query')).toEqual('my-graphql-query');
      expect(url.searchParams.get('subscription-key')).toEqual('secret1');
    });
  });

  describe('buildRequest', () => {
    it('should build valid Request object', () => {
      const req = buildRequest(
        'https://api.example.com/graphql',
        'secret1',
        'subscription-key',
        '{feed{feedId}}',
      );
      expect(req instanceof Request).toBeTruthy();
      expect(req.method).toEqual('POST');
      expect(req.url).toEqual(
        'https://api.example.com/graphql?subscription-key=secret1',
      );
    });
  });
});
