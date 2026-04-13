import { expect, test } from "@playwright/test";
import { blockExternalMedia, login, logout, registerLearner } from "./helpers";

test.describe("localhost-only detailed browser flow", () => {
  test.beforeEach(async ({ page }) => {
    await blockExternalMedia(page);
  });

  test("register and login flows show friendly validation and error feedback", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: "登録する" }).click();
    await expect(page.getByText("表示名は2文字以上で入力してください")).toBeVisible();
    await expect(page.getByText("メールアドレスの形式が不正です")).toBeVisible();
    await expect(page.getByText("パスワードは6文字以上にしてください")).toBeVisible();

    await page.goto("/login");
    await page.getByLabel("メールアドレス").fill("learner@example.com");
    await page.getByLabel("パスワード").fill("WrongPassword!");
    await page.getByRole("button", { name: "ログイン" }).click();
    await expect(page.getByText("ログインに失敗しました。メールアドレスまたはパスワードを確認してください。")).toBeVisible();
  });

  test("learner can register, update profile, move on the map, study, answer quiz, and review history", async ({
    page
  }) => {
    const seed = `${Date.now()}`;
    const { email, password } = await registerLearner(page, seed);

    await page.getByRole("link", { name: "プロフィール" }).click();
    await expect(page).toHaveURL(/\/profile/);
    await page.getByLabel("表示名").fill(`更新学習者${seed}`);
    await page.getByRole("button", { name: "ピンク" }).click();
    await page.getByRole("button", { name: "保存" }).click();
    await expect(page.getByText("プロフィールを更新しました。")).toBeVisible();

    await page.getByRole("link", { name: "マップ" }).click();
    await expect(page).toHaveURL(/\/map\/main-map/);
    await expect(page.getByText("現在地: (0, 0)")).toBeVisible();
    await page.getByRole("button", { name: "↓" }).click();
    await page.getByRole("button", { name: "↓" }).click();
    await expect(page.getByText("「スタート地点」に到達しました。")).toBeVisible();
    await expect(page.getByRole("heading", { name: "スタート地点" })).toBeVisible();
    await page.getByRole("link", { name: "動画を見る" }).click();

    await expect(page).toHaveURL(/\/videos\/video-1$/);
    await expect(page.getByRole("heading", { name: "あいさつの基本" })).toBeVisible();
    await page.getByRole("button", { name: "視聴完了として記録" }).click();
    await expect(page.getByText("視聴回数を更新しました。")).toBeVisible();
    await page.getByRole("link", { name: "クイズへ進む" }).click();

    await expect(page).toHaveURL(/\/videos\/video-1\/quiz/);
    await page.getByLabel("笑顔で目を見る").check();
    await page.getByRole("button", { name: "回答を送信" }).click();
    await expect(page.getByText("合格です。次の教材が解放されました。")).toBeVisible();

    await page.getByRole("link", { name: "ホーム" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("身だしなみチェック")).toBeVisible();

    await page.getByRole("link", { name: "履歴", exact: true }).click();
    await expect(page).toHaveURL(/\/history/);
    await expect(page.getByText("video-1")).toBeVisible();
    await expect(page.getByText("quiz-1")).toBeVisible();

    await logout(page);
    await login(page, email, password);
    await expect(page.getByText("身だしなみチェック")).toBeVisible();
  });

  test("seeded learner sees completed and unlocked states, uses bottom nav, and can tap-move to a locked point hint", async ({
    page
  }) => {
    await login(page, "learner@example.com", "Password123!");

    const mobileNav = page.getByRole("navigation");
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "ホーム" })).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "マップ" })).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "履歴", exact: true })).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "プロフィール" })).toBeVisible();

    await expect(page.getByText("再視聴可", { exact: true })).toBeVisible();
    await expect(page.getByText("解放済み", { exact: true })).toBeVisible();
    await expect(page.getByText("未解放", { exact: true })).toHaveCount(0);

    await mobileNav.getByRole("link", { name: "マップ" }).click();
    await expect(page).toHaveURL(/\/map\/main-map/);
    await page.getByRole("button", { name: /地点 まんなか地点/ }).click();
    await expect(page.getByRole("heading", { name: "まんなか地点" })).toBeVisible();
    await expect(page.getByText("身だしなみチェック")).toBeVisible();
    await expect(page.getByText("解放済み", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: /セル 3, 2/ }).click();
    await expect(page.getByText("現在地: (3, 2)")).toBeVisible();
    await page.getByRole("button", { name: /セル 4, 2/ }).click();
    await expect(page.getByText("「ゴール地点」に到達しました。")).toBeVisible();
    await expect(page.getByRole("heading", { name: "ゴール地点" })).toBeVisible();
    await expect(page.getByText("未解放の教材があります")).toBeVisible();
    await expect(page.getByText("前の動画の視聴回数やクイズ合格を満たすと、この地点の次の教材が見えるようになります。")).toBeVisible();
  });

  test("admin can add a video and quiz through the integrated CRUD screens", async ({ page }) => {
    const seed = `${Date.now()}`;
    await login(page, "admin@example.com", "Password123!");

    await page.getByRole("link", { name: "管理" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.getByRole("link", { name: "動画" }).click();
    await expect(page).toHaveURL(/\/admin\/videos/);
    const videoForm = page.locator("form").first();
    await videoForm.getByLabel("ID", { exact: true }).fill(`video-e2e-${seed}`);
    await videoForm.getByLabel("タイトル").fill(`E2E動画${seed}`);
    await videoForm.getByLabel("説明").fill("ローカル E2E で追加した動画です。");
    await videoForm.getByLabel("地点").selectOption("point-3");
    await videoForm.getByLabel("YouTube URL").fill("https://www.youtube.com/watch?v=ysz5S6PUM-U");
    await videoForm.getByLabel("YouTube videoId").fill("ysz5S6PUM-U");
    await videoForm.getByLabel("レベル").fill("4");
    await videoForm.getByLabel("順番").fill("10");
    await videoForm.getByLabel("必須視聴回数").fill("1");
    await videoForm.getByLabel("対象性別").selectOption("all");
    await videoForm.getByRole("button", { name: "保存" }).click();
    await expect(page.getByText(`E2E動画${seed}`)).toBeVisible();

    await page.getByRole("link", { name: "クイズ" }).click();
    await expect(page).toHaveURL(/\/admin\/quizzes/);
    const quizForm = page.locator("form").first();
    await quizForm.getByLabel("クイズID").fill(`quiz-e2e-${seed}`);
    await quizForm.getByLabel("問題ID").fill(`question-quiz-e2e-${seed}`);
    await quizForm.getByLabel("対象動画").selectOption(`video-e2e-${seed}`);
    await quizForm.getByLabel("タイトル").fill(`E2Eクイズ${seed}`);
    await quizForm.getByLabel("説明").fill("ローカル E2E で追加したクイズです。");
    await quizForm.getByLabel("合格点").fill("100");
    await quizForm.getByLabel("問題形式").selectOption("multiple_choice");
    await quizForm.getByLabel("問題文").fill("ローカルテストの正解はどれですか？");
    await quizForm.getByLabel("選択肢A").fill("A");
    await quizForm.getByLabel("選択肢B").fill("B");
    await quizForm.getByLabel("選択肢C").fill("C");
    await quizForm.getByLabel("選択肢D").fill("D");
    await quizForm.getByLabel("正解キー").selectOption("A");
    await quizForm.getByLabel("解説").fill("A が正解です。");
    await quizForm.getByRole("button", { name: "保存" }).click();
    await expect(page.getByText(`E2Eクイズ${seed}`)).toBeVisible();
  });
});
