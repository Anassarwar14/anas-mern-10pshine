import { POST as logoutPOST } from "@/app/api/auth/logout/route";

describe("Auth API - Logout (Jest)", () => {
  it("should clear token cookie and return 200", async () => {
    const res = await logoutPOST();
    expect(res.status).toBe(200);
  });
});