import { test, expect } from '@playwright/test';

const TEST_USER = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'TestPassword123!',
};

test.describe('Authentication Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user registration workflow', async ({ page }) => {
    // Navigate to registration
    await page.click('text=Register');
    await expect(page).toHaveURL('/auth/register');

    // Fill registration form
    await page.fill('[data-testid="username-input"]', TEST_USER.username);
    await page.fill('[data-testid="email-input"]', TEST_USER.email);
    await page.fill('[data-testid="password-input"]', TEST_USER.password);

    // Submit registration
    await page.click('[data-testid="register-submit"]');

    // Should redirect to verify-email page
    await expect(page).toHaveURL(/\/verify-email/);

    // Should show email verification form
    await expect(page.locator('h2')).toContainText('Verify Your Email');

    // Email should be pre-filled
    const emailInput = page.locator('[data-testid="email-input"]');
    await expect(emailInput).toHaveValue(TEST_USER.email);
  });

  test('email verification workflow', async ({ page }) => {
    await page.goto('/verify-email?email=test@example.com');

    // Check page loads correctly
    await expect(page.locator('h2')).toContainText('Verify Your Email');

    // Email should be pre-filled from URL
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveValue('test@example.com');

    // Test resend functionality
    const resendButton = page.locator('button:has-text("Resend code")');
    await expect(resendButton).toBeVisible();
    await expect(resendButton).toBeEnabled();

    // Fill OTP code (will fail with invalid code, but tests form)
    await page.fill('input[maxlength="6"]', '123456');

    // Submit verification
    await page.click('button:has-text("Verify Email")');

    // Should show error for invalid code
    await expect(page.locator('text=Invalid verification code')).toBeVisible();
  });

  test('login workflow', async ({ page }) => {
    await page.goto('/auth/login');

    // Test login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Test with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('forgot password workflow', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    // Check page loads
    await expect(page.locator('h1')).toContainText('Reset Password');

    // Step 1: Request reset
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Send Reset Code")');

    // Should proceed to OTP step
    await expect(page.locator('input[maxlength="6"]')).toBeVisible();

    // Step 2: Enter OTP (will fail but tests flow)
    await page.fill('input[maxlength="6"]', '123456');
    await page.click('button:has-text("Verify Code")');

    // Step 3: Should show password reset form
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Fill new password
    await page.fill('input[type="password"]', 'NewPassword123!');
    await page.fill('input[placeholder*="confirm"]', 'NewPassword123!');
    await page.click('button:has-text("Reset Password")');

    // Will fail with invalid token, but tests the complete flow
  });

  test('navigation between auth pages', async ({ page }) => {
    // Start at login
    await page.goto('/auth/login');

    // Go to register
    await page.click('text=Create account');
    await expect(page).toHaveURL('/auth/register');

    // Go back to login
    await page.click('text=Sign in');
    await expect(page).toHaveURL('/auth/login');

    // Go to forgot password
    await page.click('text=Forgot password');
    await expect(page).toHaveURL('/auth/forgot-password');

    // Go back to login
    await page.click('text=Back to login');
    await expect(page).toHaveURL('/auth/login');
  });

  test('form validation', async ({ page }) => {
    await page.goto('/auth/register');

    // Test empty form submission
    await page.click('[data-testid="register-submit"]');

    // Should show validation errors
    await expect(page.locator('text=Username is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();

    // Test invalid email
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="register-submit"]');
    await expect(page.locator('text=Please enter a valid email')).toBeVisible();

    // Test weak password
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="register-submit"]');
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });
});
