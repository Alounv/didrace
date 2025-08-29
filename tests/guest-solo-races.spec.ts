import { expect, test } from "@playwright/test";
import { completeRace, loginAsGuest } from "./utils";

test("guest login and perform two solo races then return home", async ({
  page,
}) => {
  // Login as guest
  await loginAsGuest({ page, guestName: "Player1" });

  // First solo race
  // Click "Create race" button (the + button)
  await page.getByRole("button", { name: "Create race" }).click();

  // Wait for race page to load
  await page.waitForURL(/\/races\/.*$/);

  // Click "Start Race" button to begin the race
  await page.getByRole("button", { name: /Start Race/ }).click();

  // Complete the second race by typing all letters
  await completeRace({ page });

  // Verify we are on the results page
  await expect(page.getByText("% correct")).toBeVisible();

  // Click to start the next race
  await page.getByRole("link", { name: /Next Race/ }).click();

  // Click "Start Race" button to begin the race
  await page.getByRole("button", { name: /Start Race/ }).click();

  // Complete the second race by typing all letters
  await completeRace({ page });

  // Verify we are on the results page
  await expect(page.getByText("% correct")).toBeVisible();

  // Click to leave the race
  await page.getByRole("button", { name: /Leave/ }).click();

  // Verify we're back on the home page and still authenticated
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create race" })).toBeVisible();

  // Click on "Logout" button
  await page.getByRole("button", { name: "Logout" }).click();

  // Verify we're back on the home page and not authenticated
  await expect(page.getByRole("button", { name: "Guest" })).toBeVisible();
});
