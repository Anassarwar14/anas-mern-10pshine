import bcrypt from "bcryptjs";
import prismadb from "@/lib/prismaDB";
import { POST as signupPOST } from "@/app/api/auth/signup/route";

jest.mock("bcryptjs");
jest.mock("@/lib/prismaDB", () => ({
  user: {
    create: jest.fn()
  }
}));

describe("Auth API - Signup (Jest)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a user and return 201", async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpw");
    (prismadb.user.create as jest.Mock).mockResolvedValue({
      id: 1,
      username: "testuser",
      email: "test@example.com",
      password: "hashedpw",
      firstName: "Test",
      lastName: "User",
      bio: "Bio",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const req = {
      json: async () => ({
        firstName: "Test",
        lastName: "User",
        bio: "Bio",
        email: "test@example.com",
        password: "pw"
      })
    } as Request;

    const res = await signupPOST(req);
    expect(res.status).toBe(201);
  });

  it("should handle signup errors and return 500", async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpw");
    (prismadb.user.create as jest.Mock).mockImplementation(() => {
      throw new Error("DB error");
    });

    const req = {
      json: async () => ({
        firstName: "Test",
        lastName: "User",
        bio: "Bio",
        email: "test@example.com",
        password: "pw"
      })
    } as Request;

    const res = await signupPOST(req);
    expect(res.status).toBe(500);
  });

  it("should handle missing fields and return 500", async () => {
    const req = {
      json: async () => ({
        firstName: "Test"
        // missing other fields
      })
    } as Request;

    const res = await signupPOST(req);
    expect(res.status).toBe(500);
  });
});