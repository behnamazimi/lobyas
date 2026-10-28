const RETRY_DELAYS_MS = [800, 1600];

/** Right after a session refreshes, the new token can be a moment ahead of
 *  the database's clock and PostgREST rejects it as "JWT issued at future".
 *  The token is fine a second later, so the request is sent again. */
async function isFutureJwt(response: Response) {
  if (response.status !== 401) return false;
  try {
    const body: { code?: string } = await response.clone().json();
    return body.code === "PGRST303";
  } catch {
    return false;
  }
}

export function retryFutureJwt(
  baseFetch: typeof fetch = (input, init) => fetch(input, init),
  delays: number[] = RETRY_DELAYS_MS,
): typeof fetch {
  return async (input, init) => {
    let response = await baseFetch(input, init);
    // Only requests that can be sent twice: a Request's body may be a stream.
    if (input instanceof Request) return response;
    for (const delay of delays) {
      if (!(await isFutureJwt(response))) break;
      await new Promise((resolve) => setTimeout(resolve, delay));
      response = await baseFetch(input, init);
    }
    return response;
  };
}
