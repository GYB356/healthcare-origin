import { test, expect } from "@playwright/test";

test.describe("Healthcare System E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test.describe("Authentication", () => {
    test("should login as doctor", async ({ page }) => {
      await page.fill('input[name="email"]', "doctor@example.com");
      await page.fill('input[name="password"]', "password123");
      await page.click('button[type="submit"]');

      await expect(page.locator("text=Doctor Dashboard")).toBeVisible();
    });

    test("should login as patient", async ({ page }) => {
      await page.fill('input[name="email"]', "patient@example.com");
      await page.fill('input[name="password"]', "password123");
      await page.click('button[type="submit"]');

      await expect(page.locator("text=Patient Dashboard")).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.fill('input[name="email"]', "invalid@example.com");
      await page.fill('input[name="password"]', "wrongpassword");
      await page.click('button[type="submit"]');

      await expect(page.locator("text=Invalid credentials")).toBeVisible();
    });
  });

  test.describe("Doctor Schedule Management", () => {
    test.beforeEach(async ({ page }) => {
      // Login as doctor
      await page.fill('input[name="email"]', "doctor@example.com");
      await page.fill('input[name="password"]', "password123");
      await page.click('button[type="submit"]');
    });

    test("should create available time slot", async ({ page }) => {
      await page.click("text=Manage Schedule");
      await page.click(".fc-timegrid-slot:first-child");

      await expect(page.locator("text=Time slot added successfully")).toBeVisible();
      await expect(page.locator(".fc-event")).toBeVisible();
    });

    test("should delete time slot", async ({ page }) => {
      await page.click("text=Manage Schedule");
      await page.click(".fc-event:first-child");
      await page.click("text=Delete");
      await page.click("text=Confirm");

      await expect(page.locator("text=Time slot removed successfully")).toBeVisible();
    });
  });

  test.describe("Medical Records", () => {
    test.beforeEach(async ({ page }) => {
      // Login as doctor
      await page.fill('input[name="email"]', "doctor@example.com");
      await page.fill('input[name="password"]', "password123");
      await page.click('button[type="submit"]');
    });

    test("should create medical record", async ({ page }) => {
      await page.click("text=Medical Records");
      await page.click("text=Add New Record");

      await page.fill('input[name="title"]', "Regular Check-up");
      await page.fill('textarea[name="description"]', "Patient is in good health");
      await page.fill('input[name="diagnosis"]', "Healthy");
      await page.click('button:has-text("Create Record")');

      await expect(page.locator("text=Medical record created successfully")).toBeVisible();
    });

    test("should validate required fields", async ({ page }) => {
      await page.click("text=Medical Records");
      await page.click("text=Add New Record");
      await page.click('button:has-text("Create Record")');

      await expect(page.locator("text=Title is required")).toBeVisible();
      await expect(page.locator("text=Description is required")).toBeVisible();
    });
  });

  test.describe("Billing System", () => {
    test.beforeEach(async ({ page }) => {
      // Login as staff
      await page.fill('input[name="email"]', "staff@example.com");
      await page.fill('input[name="password"]', "password123");
      await page.click('button[type="submit"]');
    });

    test("should create invoice", async ({ page }) => {
      await page.click("text=Billing");
      await page.click("text=Create New Invoice");

      await page.fill('input[name="amount"]', "100");
      await page.fill('input[name="tax"]', "10");
      await page.fill('input[name="discount"]', "5");
      await page.fill('input[name="dueDate"]', "2024-12-31");
      await page.click('button:has-text("Create Invoice")');

      await expect(page.locator("text=Invoice created successfully")).toBeVisible();
    });

    test("should update invoice status", async ({ page }) => {
      await page.click("text=Billing");
      await page.selectOption("select.invoice-status", "PAID");

      await expect(page.locator("text=Invoice status updated successfully")).toBeVisible();
    });
  });

  test.describe("Responsive Design", () => {
    test("should be responsive on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Check if menu becomes hamburger
      await expect(page.locator(".hamburger-menu")).toBeVisible();

      // Check if tables are scrollable
      await expect(page.locator(".table-container")).toHaveCSS("overflow-x", "auto");

      // Check if forms stack vertically
      await expect(page.locator("form")).toHaveCSS("flex-direction", "column");
    });

    test("should be responsive on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      // Check if sidebar is visible
      await expect(page.locator(".sidebar")).toBeVisible();

      // Check if grid layout adjusts
      await expect(page.locator(".grid-container")).toHaveCSS(
        "grid-template-columns",
        "repeat(2, 1fr)",
      );
    });
  });

  test.describe("Real-time Updates", () => {
    test("should show real-time appointment updates", async ({ page, context }) => {
      // Login in first page
      await page.fill('input[name="email"]', "doctor@example.com");
      await page.fill('input[name="password"]', "password123");
      await page.click('button[type="submit"]');

      // Create new page for patient
      const patientPage = await context.newPage();
      await patientPage.goto("http://localhost:3000");
      await patientPage.fill('input[name="email"]', "patient@example.com");
      await patientPage.fill('input[name="password"]', "password123");
      await patientPage.click('button[type="submit"]');

      // Doctor creates appointment
      await page.click("text=Manage Schedule");
      await page.click(".fc-timegrid-slot:first-child");

      // Check if patient sees update
      await expect(patientPage.locator("text=New appointment available")).toBeVisible();
    });

    test("should show real-time message notifications", async ({ page, context }) => {
      // Login in first page (doctor)
      await page.fill('input[name="email"]', "doctor@example.com");
      await page.fill('input[name="password"]', "password123");
      await page.click('button[type="submit"]');

      // Create new page for patient
      const patientPage = await context.newPage();
      await patientPage.goto("http://localhost:3000");
      await patientPage.fill('input[name="email"]', "patient@example.com");
      await patientPage.fill('input[name="password"]', "password123");
      await patientPage.click('button[type="submit"]');

      // Patient sends message
      await patientPage.click("text=Messages");
      await patientPage.fill('textarea[name="message"]', "Hello doctor");
      await patientPage.click('button:has-text("Send")');

      // Check if doctor receives notification
      await expect(page.locator("text=New message from Patient")).toBeVisible();
    });
  });
});
