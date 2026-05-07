import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  expect: {
    timeout: 30_000
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off"
  },
  projects: [
    {
      name: "iphone-layout",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        channel: "msedge"
      }
    },
    {
      name: "android-layout",
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
        channel: "msedge"
      }
    }
  ]
});
