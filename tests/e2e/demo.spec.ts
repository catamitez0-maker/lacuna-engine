import { expect, test } from "@playwright/test";

test("runs the framework demo flow", async ({ page }) => {
  await page.goto("/demo");

  await expect(page.getByText("No active world loaded").first()).toBeVisible();
  await page.getByRole("button", { name: "Load empty world template" }).click();
  await page.getByRole("button", { name: "Start framework demo" }).click();
  await page.getByRole("button", { name: "observe" }).click();
  await page.getByRole("button", { name: "Fragment A" }).click();
  await page.getByRole("button", { name: "placeholder action" }).click();
  await page.getByRole("button", { name: "Run DailyPulse" }).click();

  await expect(page.getByText("PlayerTimeline")).toBeVisible();
  await expect(page.getByText("Trace list")).toBeVisible();
  await expect(page.getByText("DailyPulse result")).toBeVisible();
  await expect(page.getByText("City state before / after")).toBeVisible();
  await expect(page.getByText("ObserverReport")).toBeVisible();
});
