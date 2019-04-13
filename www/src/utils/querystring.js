export function parseSearchQuery() {
  const pairs = document.location.search.substr(1).split('&');

  const qs = {};

  for (const pair of pairs) {
    const [, key, value] = pair.match(/^([^=]+)(?:=(.*))?$/);

    qs[key] = value === undefined ? true : value;
  }

  return qs;
}
