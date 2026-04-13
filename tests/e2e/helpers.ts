import { expect, type Page } from "@playwright/test";

export const blockExternalMedia = async (page: Page) => {
  await page.route("https://www.youtube.com/**", async (route) => {
    await route.fulfill({
      status: 204,
      body: ""
    });
  });

  await page.route("https://www.google.com/**", async (route) => {
    await route.fulfill({
      status: 204,
      body: ""
    });
  });
};

export const login = async (page: Page, email: string, password: string) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード").fill(password);
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
};

export const registerLearner = async (page: Page, seed: string) => {
  const email = `learner-${seed}@example.com`;
  const password = "Password123!";

  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "新規登録" })).toBeVisible();
  await expect(page.getByRole("button", { name: "ブルー" })).toBeVisible();

  await page.getByLabel("表示名").fill(`学習者${seed}`);
  await page.getByLabel("性別").selectOption("other");
  await page.getByRole("button", { name: "グリーン" }).click();
  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード").fill(password);
  await page.getByRole("button", { name: "登録する" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("link", { name: "マップを開く" })).toBeVisible();
  await expect(page.getByText(/現在レベル/)).toBeVisible();

  return { email, password };
};

export const logout = async (page: Page) => {
  await page.getByRole("button", { name: "ログアウト" }).click();
  await expect(page).toHaveURL(/\/login/);
};
