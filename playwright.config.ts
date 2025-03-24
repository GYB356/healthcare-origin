import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "Chrome",
      use: { browserName: "chromium" },
    },
    {
      name: "Firefox",
      use: { browserName: "firefox" },
    },
    {
      name: "Safari",
      use: { browserName: "webkit" },
    },
  ],
};

export default config;
