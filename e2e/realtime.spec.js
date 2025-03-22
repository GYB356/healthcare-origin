const { test, expect } = require('@playwright/test');

test.describe('Real-time Updates', () => {
  let doctorPage;
  let patientPage;

  test.beforeEach(async ({ browser }) => {
    // Create two browser contexts for doctor and patient
    const doctorContext = await browser.newContext();
    const patientContext = await browser.newContext();

    doctorPage = await doctorContext.newPage();
    patientPage = await patientContext.newPage();

    // Login as doctor
    await doctorPage.goto('/login');
    await doctorPage.getByLabel('Email').fill('doctor@test.com');
    await doctorPage.getByLabel('Password').fill('password123');
    await doctorPage.getByRole('button', { name: 'Login' }).click();
    await expect(doctorPage).toHaveURL(/.*dashboard/);

    // Login as patient
    await patientPage.goto('/login');
    await patientPage.getByLabel('Email').fill('patient@test.com');
    await patientPage.getByLabel('Password').fill('password123');
    await patientPage.getByRole('button', { name: 'Login' }).click();
    await expect(patientPage).toHaveURL(/.*dashboard/);
  });

  test('should update appointment status in real-time', async () => {
    // Navigate to appointments page on both contexts
    await doctorPage.goto('/appointments');
    await patientPage.goto('/appointments');

    // Get initial status
    const initialStatus = await doctorPage.getByRole('cell', { name: 'SCHEDULED' }).first().textContent();

    // Update status as doctor
    const statusCell = doctorPage.getByRole('cell', { name: 'SCHEDULED' }).first();
    await statusCell.click();
    await doctorPage.getByRole('option', { name: 'COMPLETED' }).click();

    // Verify patient sees the update
    await expect(patientPage.getByRole('cell', { name: 'COMPLETED' }).first()).toBeVisible();
  });

  test('should show new appointments in real-time', async () => {
    // Navigate to appointments page on both contexts
    await doctorPage.goto('/appointments');
    await patientPage.goto('/appointments');

    // Create new appointment as doctor
    await doctorPage.getByRole('button', { name: 'New Appointment' }).click();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    await doctorPage.getByLabel('Patient').fill('Test Patient');
    await doctorPage.getByLabel('Date').fill(dateStr);
    await doctorPage.getByLabel('Time').selectOption('09:00');
    await doctorPage.getByRole('button', { name: 'Schedule' }).click();

    // Verify patient sees the new appointment
    await expect(patientPage.getByText('Test Patient')).toBeVisible();
  });

  test('should handle chat messages in real-time', async () => {
    // Navigate to chat page on both contexts
    await doctorPage.goto('/chat');
    await patientPage.goto('/chat');

    // Send message as doctor
    await doctorPage.getByPlaceholder('Type a message...').fill('Hello, how are you?');
    await doctorPage.getByRole('button', { name: 'Send' }).click();

    // Verify patient receives the message
    await expect(patientPage.getByText('Hello, how are you?')).toBeVisible();
  });

  test('should show online status indicators', async () => {
    // Navigate to chat page on both contexts
    await doctorPage.goto('/chat');
    await patientPage.goto('/chat');

    // Verify online status
    await expect(doctorPage.getByText('Online')).toBeVisible();
    await expect(patientPage.getByText('Online')).toBeVisible();

    // Close patient context to simulate offline
    await patientPage.context().close();

    // Verify doctor sees patient as offline
    await expect(doctorPage.getByText('Offline')).toBeVisible();
  });

  test('should handle reconnection gracefully', async () => {
    // Navigate to appointments page
    await doctorPage.goto('/appointments');

    // Simulate network disconnect
    await doctorPage.route('**/api/appointments', route => route.abort('failed'));

    // Try to update appointment
    const statusCell = doctorPage.getByRole('cell', { name: 'SCHEDULED' }).first();
    await statusCell.click();
    await doctorPage.getByRole('option', { name: 'COMPLETED' }).click();

    // Verify reconnection message
    await expect(doctorPage.getByText('Reconnecting...')).toBeVisible();

    // Restore network
    await doctorPage.unroute('**/api/appointments');

    // Verify successful reconnection
    await expect(doctorPage.getByText('Connected')).toBeVisible();
  });

  test('should handle multiple concurrent updates', async () => {
    // Navigate to appointments page on both contexts
    await doctorPage.goto('/appointments');
    await patientPage.goto('/appointments');

    // Create multiple appointments simultaneously
    const createAppointment = async (page, time) => {
      await page.getByRole('button', { name: 'New Appointment' }).click();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      await page.getByLabel('Patient').fill('Test Patient');
      await page.getByLabel('Date').fill(dateStr);
      await page.getByLabel('Time').selectOption(time);
      await page.getByRole('button', { name: 'Schedule' }).click();
    };

    // Create appointments with different times
    await Promise.all([
      createAppointment(doctorPage, '09:00'),
      createAppointment(patientPage, '10:00')
    ]);

    // Verify both appointments appear on both pages
    await expect(doctorPage.getByText('09:00')).toBeVisible();
    await expect(doctorPage.getByText('10:00')).toBeVisible();
    await expect(patientPage.getByText('09:00')).toBeVisible();
    await expect(patientPage.getByText('10:00')).toBeVisible();
  });

  test('should handle notification preferences', async () => {
    // Navigate to settings page
    await doctorPage.goto('/settings');

    // Toggle notification preferences
    await doctorPage.getByLabel('Email notifications').click();
    await doctorPage.getByLabel('Push notifications').click();
    await doctorPage.getByRole('button', { name: 'Save Preferences' }).click();

    // Verify settings are saved
    await expect(doctorPage.getByText('Settings saved successfully')).toBeVisible();
  });

  test('should handle message delivery status', async () => {
    // Navigate to chat page on both contexts
    await doctorPage.goto('/chat');
    await patientPage.goto('/chat');

    // Send message as doctor
    await doctorPage.getByPlaceholder('Type a message...').fill('Test message');
    await doctorPage.getByRole('button', { name: 'Send' }).click();

    // Verify delivery status
    await expect(doctorPage.getByText('Delivered')).toBeVisible();

    // Read message as patient
    await patientPage.getByText('Test message').click();

    // Verify read status on doctor's page
    await expect(doctorPage.getByText('Read')).toBeVisible();
  });

  test('should handle presence indicators in chat', async () => {
    // Navigate to chat page on both contexts
    await doctorPage.goto('/chat');
    await patientPage.goto('/chat');

    // Verify typing indicator
    await doctorPage.getByPlaceholder('Type a message...').fill('Typing...');
    await expect(patientPage.getByText('Doctor is typing...')).toBeVisible();

    // Clear typing indicator
    await doctorPage.getByPlaceholder('Type a message...').clear();
    await expect(patientPage.getByText('Doctor is typing...')).not.toBeVisible();
  });

  test('should handle real-time availability updates', async () => {
    // Navigate to schedule page
    await doctorPage.goto('/schedule');

    // Update availability
    await doctorPage.getByRole('button', { name: 'Update Availability' }).click();
    await doctorPage.getByLabel('Monday').click();
    await doctorPage.getByLabel('Tuesday').click();
    await doctorPage.getByRole('button', { name: 'Save' }).click();

    // Navigate to appointments as patient
    await patientPage.goto('/appointments');

    // Verify updated availability is reflected
    await expect(patientPage.getByText('Available on Monday and Tuesday')).toBeVisible();
  });
}); 