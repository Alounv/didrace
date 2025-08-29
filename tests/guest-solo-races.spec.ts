import { test, expect, Page } from "@playwright/test";

async function completeRace({ page }: { page: Page }) {
  // Wait for the race text to appear and typing area to be ready
  const input = page.locator('input[id="input-id"]');
  await expect(input).toBeVisible();

  // Read and type each letter from the screen
  await input.focus();

  // Complete the first race by typing all letters
  while (true) {
    const letters = await page.locator('div[id="letter"]').all();
    if (letters.length === 0) break;

    const firstLetter = await letters[0].textContent();
    if (!firstLetter) break;

    await input.type(firstLetter);
    await page.waitForTimeout(50); // Small delay between keystrokes
  }

  // Verify we are on the results page
  await expect(page.getByText("% correct")).toBeVisible();
}

test("guest login and perform two solo races then return home", async ({
  page,
}) => {
  // Navigate to the home page
  await page.goto("/");

  // Wait for the page to load and check for guest login button
  await expect(page.getByRole("button", { name: "Guest" })).toBeVisible();

  // Click guest login button
  await page.getByRole("button", { name: "Guest" }).click();

  // Wait for redirect and authentication
  await page.waitForURL("/");
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();

  // First solo race
  // Click "Create race" button (the + button)
  await page.getByRole("button", { name: "Create race" }).click();

  // Wait for race page to load
  await page.waitForURL(/\/races\/.*$/);

  // Click "Start Race" button to begin the race
  await page.getByRole("button", { name: /Start Race/ }).click();

  // Complete the second race by typing all letters
  await completeRace({ page });

  // Click to start the next race
  await page.getByRole("link", { name: /Next Race/ }).click();

  // Click "Start Race" button to begin the race
  await page.getByRole("button", { name: /Start Race/ }).click();

  // Complete the second race by typing all letters
  await completeRace({ page });

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
