import { expect, test } from "@playwright/test";
import { completeRaceAlternatingMultiple, loginAsGuest } from "./utils";

test("three players race with alternating typing", async ({ browser }) => {
  // Create three browser contexts for three different players
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  const context3 = await browser.newContext();

  const page1 = await context1.newPage();
  const page2 = await context2.newPage();
  const page3 = await context3.newPage();

  try {
    // All players login as guests with different names
    await loginAsGuest({ page: page1, guestName: "Alice" });
    await loginAsGuest({ page: page2, guestName: "Bob" });
    await loginAsGuest({ page: page3, guestName: "Charlie" });

    // Player 1 creates a race
    await page1.getByRole("button", { name: "Create race" }).click();
    await page1.waitForURL(/\/races\/.*$/);

    // Get the race URL to share with other players
    const raceUrl = page1.url();

    // Players 2 and 3 join the same race
    await page2.goto(raceUrl);
    await page2.waitForURL(/\/races\/.*$/);
    await page3.goto(raceUrl);
    await page3.waitForURL(/\/races\/.*$/);

    // Verify all players see each other
    await expect(page1.getByRole("list").getByText("Bob")).toBeVisible();
    await expect(page1.getByRole("list").getByText("Charlie")).toBeVisible();
    await expect(page2.getByRole("list").getByText("Alice")).toBeVisible();
    await expect(page2.getByRole("list").getByText("Charlie")).toBeVisible();
    await expect(page3.getByRole("list").getByText("Alice")).toBeVisible();
    await expect(page3.getByRole("list").getByText("Bob")).toBeVisible();

    // Player 1 starts the race
    await page1.getByRole("button", { name: /Start Race/ }).click();

    // Wait for race to start for all players
    await expect(page1.locator('input[id="input-id"]')).toBeVisible();
    await expect(page2.locator('input[id="input-id"]')).toBeVisible();
    await expect(page3.locator('input[id="input-id"]')).toBeVisible();

    // For now, we'll have two players alternate, and let the third finish separately
    // This demonstrates the alternating behavior while keeping the test manageable
    await completeRaceAlternatingMultiple({ players: [page1, page2, page3] });

    // Verify all players see results
    await expect(page1.getByText("% correct")).toBeVisible();
    await expect(page2.getByText("% correct")).toBeVisible();
    await expect(page3.getByText("% correct")).toBeVisible();

    // All players leave
    await page1.getByRole("button", { name: /Leave/ }).click();
    await page2.getByRole("button", { name: /Leave/ }).click();
    await page3.getByRole("button", { name: /Leave/ }).click();

    // Verify all players are back at home
    await page1.waitForURL("/");
    await page2.waitForURL("/");
    await page3.waitForURL("/");
  } finally {
    await context1.close();
    await context2.close();
    await context3.close();
  }
});
