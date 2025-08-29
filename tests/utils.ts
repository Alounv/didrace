import { expect, type Page } from "@playwright/test";

export async function completeRace({ page }: { page: Page }) {
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
}

export async function loginAsGuest({
  page,
  guestName,
}: {
  page: Page;
  guestName: string;
}) {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Guest" })).toBeVisible();
  await page.getByRole("button", { name: "Guest" }).click();
  await page.waitForURL("/");
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();

  // Set guest name through settings
  const dropdownContainer = page.locator(".dropdown").last();
  await expect(dropdownContainer).toBeVisible();

  dropdownContainer.locator('[role="button"]').click();

  const settingsDropdown = dropdownContainer.locator(".dropdown-content");
  const nameInput = settingsDropdown.locator('input[placeholder="Type here"]');
  await expect(nameInput).toBeVisible();
  await nameInput.fill(guestName);
  // await page.waitForTimeout(500);

  // Close dropdown
  await page.locator("body").click();
}
