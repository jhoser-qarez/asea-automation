import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { users } from '../fixtures/credentials';

test.describe('Login - ASEA Shop', () => {

  test('Login exitoso con credenciales válidas', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(users.valid.username, users.valid.password);
    await loginPage.verifyLoginSuccess(users.valid.username); // 
  });

});