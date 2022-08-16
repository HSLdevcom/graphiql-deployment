import { buildHeaders } from './graphQLFetcher';

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
});
