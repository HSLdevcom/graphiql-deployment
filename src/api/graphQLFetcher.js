export const buildHeaders = (headers) => ({
  ...(headers instanceof Object ? headers : {}),
  'Content-Type': 'application/json'
});

const addSubscriptionKey = (apiUrl, key, keyParam = 'subscription-key') => {
  const url = new URL(apiUrl);
  if (key && keyParam) {
    url.searchParams.set(keyParam, key);
  }
  return url;
};

const graphQLFetcher =
  (apiUrl, subscriptionKey, subscriptionKeyParam = 'subscription-key') =>
  (graphQLParams, headers = null) =>
    fetch(addSubscriptionKey(apiUrl, subscriptionKey, subscriptionKeyParam), {
      method: 'post',
      headers: buildHeaders(headers),
      body: JSON.stringify(graphQLParams)
    }).then((response) => response.json());

export default graphQLFetcher;
