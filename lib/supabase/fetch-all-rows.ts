type PageResult<Row> = {
  data: Row[] | null;
  error: { message: string } | null;
};

/** PostgREST caps a response at `max_rows` (1000), silently cutting the rest.
 *  Reads a full result set by requesting it one page at a time; the query
 *  must have a stable order or pages can overlap or skip rows. */
const PAGE_SIZE = 1000;

const RETRY_DELAY_MS = 300;

/** One page, tried a second time after a short pause: a single dropped
 *  request on a weak connection shouldn't fail the whole read. */
async function fetchPageWithRetry<Row>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<Row>>,
  from: number,
): Promise<PageResult<Row>> {
  const first = await fetchPage(from, from + PAGE_SIZE - 1);
  if (!first.error) return first;
  console.warn(`Page at row ${from} failed, retrying: ${first.error.message}`);
  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  return fetchPage(from, from + PAGE_SIZE - 1);
}

export async function fetchAllRows<Row>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<Row>>,
): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await fetchPageWithRetry(fetchPage, from);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}
