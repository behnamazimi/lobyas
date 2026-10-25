import { describe, expect, it, vi } from "vitest";
import { retryFutureJwt } from "./retry-future-jwt";

const futureJwt = () =>
  Response.json({ code: "PGRST303", message: "JWT issued at future" }, { status: 401 });

describe("retryFutureJwt", () => {
  it("sends the request again until the token is accepted", async () => {
    const baseFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(futureJwt())
      .mockResolvedValueOnce(Response.json([{ id: 1 }]));

    const response = await retryFutureJwt(baseFetch, [0, 0])("https://db/rest/v1/x");

    expect(response.status).toBe(200);
    expect(baseFetch).toHaveBeenCalledTimes(2);
  });

  it("gives up after the last delay and returns the rejection", async () => {
    const baseFetch = vi.fn<typeof fetch>().mockImplementation(async () => futureJwt());

    const response = await retryFutureJwt(baseFetch, [0, 0])("https://db/rest/v1/x");

    expect(response.status).toBe(401);
    expect(baseFetch).toHaveBeenCalledTimes(3);
  });

  it("does not retry other 401s", async () => {
    const baseFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({ code: "PGRST301", message: "JWT expired" }, { status: 401 }),
      );

    await retryFutureJwt(baseFetch, [0, 0])("https://db/rest/v1/x");

    expect(baseFetch).toHaveBeenCalledTimes(1);
  });
});
