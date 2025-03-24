const { test, expect } = require("@playwright/test");

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display login form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    await page.getByLabel("Email").fill("doctor@test.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Login" }).click();

    // Wait for successful login and redirect
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText("Welcome, Test Doctor")).toBeVisible();
  });

  test("should show error with invalid credentials", async ({ page }) => {
    await page.getByLabel("Email").fill("invalid@test.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText("Invalid credentials")).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("should navigate to registration page", async ({ page }) => {
    await page.getByRole("link", { name: "Register" }).click();

    await expect(page).toHaveURL(/.*register/);
    await expect(page.getByRole("heading", { name: "Register" })).toBeVisible();
  });

  test("should register new user successfully", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("Name").fill("New User");
    await page.getByLabel("Email").fill("newuser@test.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByLabel("Role").selectOption("PATIENT");
    await page.getByRole("button", { name: "Register" }).click();

    // Wait for successful registration and redirect
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText("Welcome, New User")).toBeVisible();
  });

  test("should show error for duplicate email", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("Name").fill("Duplicate User");
    await page.getByLabel("Email").fill("doctor@test.com"); // Using existing email
    await page.getByLabel("Password").fill("password123");
    await page.getByLabel("Role").selectOption("PATIENT");
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByText("Email already exists")).toBeVisible();
  });

  test("should validate password strength", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("Name").fill("Weak Password");
    await page.getByLabel("Email").fill("weak@test.com");
    await page.getByLabel("Password").fill("weak");
    await page.getByLabel("Role").selectOption("PATIENT");
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByText(/Password must be at least 8 characters/)).toBeVisible();
  });

  test("should handle forgot password flow", async ({ page }) => {
    await page.getByRole("link", { name: "Forgot Password?" }).click();

    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(page.getByRole("heading", { name: "Reset Password" })).toBeVisible();

    await page.getByLabel("Email").fill("doctor@test.com");
    await page.getByRole("button", { name: "Send Reset Link" }).click();

    await expect(page.getByText("Password reset email sent")).toBeVisible();
  });

  test("should handle logout", async ({ page }) => {
    // Login first
    await page.getByLabel("Email").fill("doctor@test.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Login" }).click();

    // Wait for successful login
    await expect(page).toHaveURL(/.*dashboard/);

    // Click logout
    await page.getByRole("button", { name: "Logout" }).click();

    // Verify redirect to login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  });

  test("should maintain session after page refresh", async ({ page }) => {
    // Login first
    await page.getByLabel("Email").fill("doctor@test.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Login" }).click();

    // Wait for successful login
    await expect(page).toHaveURL(/.*dashboard/);

    // Refresh the page
    await page.reload();

    // Verify still logged in
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText("Welcome, Test Doctor")).toBeVisible();
  });

  test("should handle expired session", async ({ page }) => {
    // Set an expired token in localStorage
    await page.evaluate(() => {
      localStorage.setItem("token", "expired.token.here");
    });

    // Navigate to protected route
    await page.goto("/dashboard");

    // Verify redirect to login
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText("Session expired. Please login again.")).toBeVisible();
  });
});
