import { expect, test } from "@playwright/test";
import { completeRace, loginAsGuest } from "./utils";

test("two players race - first finishes then second finishes then both leave", async ({
  browser,
}) => {
  // Create two browser contexts for two different players
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  try {
    // Both players login as guests with different names
    await loginAsGuest({ page: page1, guestName: "Player1" });
    await loginAsGuest({ page: page2, guestName: "Player2" });

    // Player 1 creates a race
    await page1.getByRole("button", { name: "Create race" }).click();
    await page1.waitForURL(/\/races\/.*$/);

    // Get the race URL to share with player 2
    const raceUrl = page1.url();

    // Player 2 joins the same race
    await page2.goto(raceUrl);
    await page2.waitForURL(/\/races\/.*$/);

    // Verify both players see each other in the race
    await expect(page1.getByRole("list").getByText("Player2")).toBeVisible();
    await expect(page2.getByRole("list").getByText("Player1")).toBeVisible();

    // Player 1 starts the race
    await page1.getByRole("button", { name: /Start Race/ }).click();

    // Verify both players see countdown
    await expect(page1.getByTestId("dot-1")).toBeVisible();
    await expect(page2.getByTestId("dot-1")).toBeVisible();

    // Wait for race to start for both players
    await expect(page1.locator('input[id="input-id"]')).toBeVisible();
    await expect(page2.locator('input[id="input-id"]')).toBeVisible();

    // Player 1 completes the race first
    await completeRace({ page: page1 });

    // Verify Player 1 does see End Race
    await expect(page1.getByText("End Race")).toBeVisible();

    // Player 2 should still be racing - complete the race
    await completeRace({ page: page2 });

    // Verify Player 2 also sees results
    await expect(page2.getByText("% correct")).toBeVisible();

    // Player 1 leaves the race first
    await page1.getByRole("button", { name: /Leave/ }).click();
    await page1.waitForURL("/");
    await expect(
      page1.getByRole("button", { name: "Create race" }),
    ).toBeVisible();

    // Player 2 should still see the results page
    await expect(page2.getByText("% correct")).toBeVisible();

    // Player 2 leaves the race
    await page2.getByRole("button", { name: /Leave/ }).click();
    await page2.waitForURL("/");
    await expect(
      page2.getByRole("button", { name: "Create race" }),
    ).toBeVisible();

    // Both players logout
    await page1.getByRole("button", { name: "Logout" }).click();
    await expect(page1.getByRole("button", { name: "Guest" })).toBeVisible();

    await page2.getByRole("button", { name: "Logout" }).click();
    await expect(page2.getByRole("button", { name: "Guest" })).toBeVisible();
  } finally {
    // Clean up browser contexts
    await context1.close();
    await context2.close();
  }
});
