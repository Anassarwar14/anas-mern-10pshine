import bcrypt from "bcryptjs";
import * as jwtLib from "@/lib/jwt";
import prismadb from "@/lib/prismaDB";
import { POST as loginPOST } from "@/app/api/auth/login/route";

jest.mock("bcryptjs");
jest.mock("@/lib/jwt");
jest.mock("@/lib/prismaDB", () => ({
  user: {
    findFirst: jest.fn()
  }
}));

describe("Auth API - Login (Jest)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should login and set token cookie", async () => {
    (prismadb.user.findFirst as jest.Mock).mockResolvedValue({
      id: 1,
      username: "testuser",
      email: "testuser@example.com",
      password: "hashedpw",
      firstName: "Test",
      lastName: "User",
      bio: null,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwtLib.signJwt as jest.Mock).mockReturnValue("token");

    const req = {
      json: async () => ({
        username: "testuser",
        password: "pw"
      })
    } as Request;

    const res = await loginPOST(req);
    expect(res.status).toBe(200);
  });

  it("should fail with invalid credentials", async () => {
    (prismadb.user.findFirst as jest.Mock).mockResolvedValue(null);

    const req = {
      json: async () => ({
        username: "baduser",
        password: "pw"
      })
    } as Request;

    const res = await loginPOST(req);
    expect(res.status).toBe(401);
  });

  it("should fail with invalid password", async () => {
    (prismadb.user.findFirst as jest.Mock).mockResolvedValue({
      id: 1,
      username: "testuser",
      email: "testuser@example.com",
      password: "hashedpw",
      firstName: "Test",
      lastName: "User",
      bio: null,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const req = {
      json: async () => ({
        username: "testuser",
        password: "wrongpw"
      })
    } as Request;

    const res = await loginPOST(req);
    expect(res.status).toBe(401);
  });
});