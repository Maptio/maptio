export class URIService {
  parseFragment(fragment: string): Map<string, string> {
    if (!fragment) return new Map<string, string>();
    let query = new Map<string, string>();
    let pairs = (fragment[0] === '#' ? fragment.substr(1) : fragment).split(
      '&'
    );
    for (let i = 0; i < pairs.length; i++) {
      let pair = pairs[i].split('=');
      query.set(
        decodeURIComponent(pair[0]),
        pair[1] ? decodeURIComponent(pair[1]) : undefined
      );
    }

    if (query.has('error')) {
      console.error('Got the following error from Auth0: ', query);
      throw new Error('authorize_error_from_auth0');
    }

    return query;
  }

  buildFragment(fragmentMap: Map<string, string>): string {
    let fragment = '';
    fragmentMap.forEach((v, k, map) => {
      if (k) fragment += `${k}=${v}&`;
    });
    return fragment.slice(0, fragment.length - 1);
  }

  splitUrl(url: String): { url: String; fragment: String } {
    let split = url.split('#');
    return { url: split[0], fragment: split.slice(1).join('#') };
  }
}
