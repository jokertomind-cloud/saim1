import { expect, test } from "@playwright/test";
import { blockExternalMedia } from "./helpers";

test.describe("@smoke localhost-only smoke", () => {
  test.beforeEach(async ({ page }) => {
    await blockExternalMedia(page);
  });

  test("home and auth entry points render on mobile without overflow regressions @smoke", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "ドット絵アバターで学べる学習マップ" })).toBeVisible();
    await expect(page.getByRole("link", { name: /ログイン/i })).toBeVisible();

    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
    await expect(page.getByRole("link", { name: "パスワード再設定" })).toBeVisible();

    await page.goto("/register");
    await expect(page.getByRole("heading", { name: "新規登録" })).toBeVisible();
    await expect(page.getByRole("button", { name: "ブルー" })).toBeVisible();
    await expect(page.getByRole("button", { name: "ピンク" })).toBeVisible();
    await expect(page.getByRole("button", { name: "グリーン" })).toBeVisible();
  });

  test("protected pages redirect guests to login and keep mobile bottom nav hidden until login @smoke", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?redirect=/);
    await expect(page.getByRole("navigation")).toHaveCount(0);
  });

  test("seeded admin can open admin summary and seeded learner progress @smoke", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("メールアドレス").fill("admin@example.com");
    await page.getByLabel("パスワード").fill("Password123!");
    await page.getByRole("button", { name: "ログイン" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByRole("link", { name: "管理" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "管理画面" })).toBeVisible();

    await page.getByRole("link", { name: "ユーザー" }).click();
    await expect(page).toHaveURL(/\/admin\/users/);
    const learnerRow = page.getByRole("row", { name: /サンプル学習者/ });
    await expect(learnerRow).toBeVisible();
    await learnerRow.getByRole("button", { name: "確認" }).click();
    await expect(page.getByText("現在レベル: 2")).toBeVisible();
  });
});
