import { getPublicEnv } from "@/lib/env";

describe("getPublicEnv", () => {
  it("uses the local development URL by default", () => {
    const originalUrl = process.env.NEXT_PUBLIC_APP_URL;

    delete process.env.NEXT_PUBLIC_APP_URL;

    expect(getPublicEnv().NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");

    process.env.NEXT_PUBLIC_APP_URL = originalUrl;
  });
});
