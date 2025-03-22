const { test, expect } = require('@playwright/test');

test.describe('Appointments', () => {
  test.beforeEach(async ({ page }) => {
    // Login as doctor
    await page.goto('/login');
    await page.getByLabel('Email').fill('doctor@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should display appointments list', async ({ page }) => {
    await page.goto('/appointments');

    await expect(page.getByRole('heading', { name: 'Appointments' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Patient' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
  });

  test('should create new appointment', async ({ page }) => {
    await page.goto('/appointments');
    await page.getByRole('button', { name: 'New Appointment' }).click();

    // Fill appointment form
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    await page.getByLabel('Patient').fill('Test Patient');
    await page.getByLabel('Date').fill(dateStr);
    await page.getByLabel('Time').selectOption('09:00');
    await page.getByLabel('Type').selectOption('CHECKUP');
    await page.getByLabel('Notes').fill('Regular checkup');
    await page.getByRole('button', { name: 'Schedule' }).click();

    // Verify success message and redirect
    await expect(page.getByText('Appointment scheduled successfully')).toBeVisible();
    await expect(page).toHaveURL(/.*appointments/);
  });

  test('should validate required fields when creating appointment', async ({ page }) => {
    await page.goto('/appointments');
    await page.getByRole('button', { name: 'New Appointment' }).click();
    await page.getByRole('button', { name: 'Schedule' }).click();

    await expect(page.getByText('Patient is required')).toBeVisible();
    await expect(page.getByText('Date is required')).toBeVisible();
    await expect(page.getByText('Time is required')).toBeVisible();
  });

  test('should not allow scheduling in the past', async ({ page }) => {
    await page.goto('/appointments');
    await page.getByRole('button', { name: 'New Appointment' }).click();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    await page.getByLabel('Patient').fill('Test Patient');
    await page.getByLabel('Date').fill(dateStr);
    await page.getByLabel('Time').selectOption('09:00');
    await page.getByRole('button', { name: 'Schedule' }).click();

    await expect(page.getByText('Appointment date must be in the future')).toBeVisible();
  });

  test('should update appointment status', async ({ page }) => {
    await page.goto('/appointments');

    // Find the first appointment and click its status dropdown
    const statusCell = page.getByRole('cell', { name: 'SCHEDULED' }).first();
    await statusCell.click();
    await page.getByRole('option', { name: 'COMPLETED' }).click();

    // Verify status update
    await expect(page.getByText('Appointment status updated')).toBeVisible();
    await expect(statusCell).toHaveText('COMPLETED');
  });

  test('should filter appointments by status', async ({ page }) => {
    await page.goto('/appointments');

    // Select status filter
    await page.getByLabel('Status').selectOption('COMPLETED');

    // Verify filtered results
    const rows = page.getByRole('row');
    for (let i = 1; i < await rows.count(); i++) {
      const statusCell = rows.nth(i).getByRole('cell', { name: 'COMPLETED' });
      await expect(statusCell).toBeVisible();
    }
  });

  test('should search appointments by patient name', async ({ page }) => {
    await page.goto('/appointments');

    // Enter search term
    await page.getByPlaceholder('Search patients...').fill('Test Patient');

    // Verify filtered results
    const rows = page.getByRole('row');
    for (let i = 1; i < await rows.count(); i++) {
      const patientCell = rows.nth(i).getByRole('cell', { name: /Test Patient/ });
      await expect(patientCell).toBeVisible();
    }
  });

  test('should handle pagination', async ({ page }) => {
    await page.goto('/appointments');

    // Click next page
    await page.getByRole('button', { name: 'Next' }).click();

    // Verify page change
    await expect(page.getByText('Page 2')).toBeVisible();
  });

  test('should display appointment details', async ({ page }) => {
    await page.goto('/appointments');

    // Click on first appointment
    const firstAppointment = page.getByRole('row').nth(1);
    await firstAppointment.click();

    // Verify details modal
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Appointment Details')).toBeVisible();
    await expect(page.getByText('Patient Information')).toBeVisible();
    await expect(page.getByText('Notes')).toBeVisible();
  });

  test('should handle concurrent updates', async ({ page }) => {
    await page.goto('/appointments');

    // Open two browser contexts
    const context1 = await page.context();
    const context2 = await page.context();
    const page2 = await context2.newPage();

    // Login as doctor in second context
    await page2.goto('/login');
    await page2.getByLabel('Email').fill('doctor@test.com');
    await page2.getByLabel('Password').fill('password123');
    await page2.getByRole('button', { name: 'Login' }).click();
    await page2.goto('/appointments');

    // Try to update same appointment in both contexts
    const statusCell1 = page.getByRole('cell', { name: 'SCHEDULED' }).first();
    const statusCell2 = page2.getByRole('cell', { name: 'SCHEDULED' }).first();

    await statusCell1.click();
    await page.getByRole('option', { name: 'COMPLETED' }).click();

    await statusCell2.click();
    await page2.getByRole('option', { name: 'CANCELLED' }).click();

    // Verify conflict handling
    await expect(page2.getByText('Appointment has been updated by another user')).toBeVisible();

    // Clean up
    await context2.close();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/appointments');

    // Simulate offline mode
    await page.route('**/api/appointments', route => route.abort('failed'));

    // Try to create appointment
    await page.getByRole('button', { name: 'New Appointment' }).click();
    await page.getByLabel('Patient').fill('Test Patient');
    await page.getByLabel('Date').fill(new Date().toISOString().split('T')[0]);
    await page.getByRole('button', { name: 'Schedule' }).click();

    // Verify error handling
    await expect(page.getByText('Failed to schedule appointment. Please try again.')).toBeVisible();
  });
});