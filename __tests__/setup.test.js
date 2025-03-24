describe("Jest Setup", () => {
  it("should run tests", () => {
    expect(true).toBe(true);
  });

  it("should have environment variables set", () => {
    expect(process.env.JWT_SECRET).toBe("test-secret");
    expect(process.env.MONGODB_URI).toBe("mongodb://localhost:27017/test-db");
    expect(process.env.NEXTAUTH_SECRET).toBe("test-nextauth-secret");
    expect(process.env.NEXTAUTH_URL).toBe("http://localhost:3000");
  });
});
