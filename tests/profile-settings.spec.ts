import { test, expect } from "@playwright/test";

test("guest login and edit profile settings", async ({ page }) => {
  // Navigate to the home page
  await page.goto("/");

  // Wait for the page to load and login as guest
  await expect(page.getByRole("button", { name: "Guest" })).toBeVisible();
  await page.getByRole("button", { name: "Guest" }).click();

  // Wait for redirect and authentication
  await page.waitForURL("/");
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();

  // Click on the player name to open settings dropdown
  const dropdownContainer = page.locator(".dropdown").last();
  await expect(dropdownContainer).toBeVisible();

  // Try multiple approaches to open the dropdown
  const playerNameButton = dropdownContainer.locator('[role="button"]');
  await playerNameButton.click();

  // Wait for settings dropdown to be visible
  const settingsDropdown = dropdownContainer.locator(".dropdown-content");

  // Test name editing
  const nameInput = settingsDropdown.locator('input[placeholder="Type here"]');
  await expect(nameInput).toBeVisible();

  // Clear the current name and type new name
  await nameInput.fill("TestPlayer123");

  // Test color editing using preset color buttons
  const colorButtons = settingsDropdown.locator(".badge.btn");
  await expect(colorButtons.first()).toBeVisible();

  // Click the second color button (purple)
  await colorButtons.nth(1).click();

  // Test custom color input
  const colorInput = settingsDropdown.locator('input[placeholder="#ffffff"]');
  await expect(colorInput).toBeVisible();

  // Enter a custom color
  await colorInput.fill("#FF5733");

  // Test avatar URL editing
  const avatarInput = settingsDropdown.locator(
    'input[placeholder="https://..."]',
  );
  await expect(avatarInput).toBeVisible();

  // Enter an avatar URL
  await avatarInput.fill("https://github.com/github.png");

  // Close the dropdown by clicking elsewhere
  await page.locator("body").click();

  // Verify the name change is reflected in the UI
  const userButton = page.getByRole("button", { name: "TestPlayer123" });
  await expect(userButton).toBeVisible();

  // Verify the color change by checking the style attribute
  await expect(userButton).toHaveAttribute(
    "style",
    "background-color: rgb(255, 87, 51); color: rgb(0, 0, 0);",
  );

  // Verify the avatar change by checking if the image loads
  const avatarImage = page.locator('img[src="https://github.com/github.png"]');
  await expect(avatarImage).toBeVisible();

  // Test persistence by refreshing the page
  await page.reload();
  await page.waitForURL("/");

  // Verify changes persist after refresh
  await expect(userButton).toBeVisible();
  await expect(
    page.locator('img[src="https://github.com/github.png"]'),
  ).toBeVisible();

  // Logout
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page.getByRole("button", { name: "Guest" })).toBeVisible();
});

// test("profile settings validation and error handling", async ({ page }) => {
//   // Navigate and login as guest
//   await page.goto("/");
//   await page.getByRole("button", { name: "Guest" }).click();
//   await page.waitForURL("/");

//   // Open settings dropdown
//   const playerNameButton = page.locator('button:has-text("Guest")');
//   await playerNameButton.click();

//   const settingsDropdown = page.locator(".dropdown-content");
//   await expect(settingsDropdown).toBeVisible();

//   // Test empty name handling
//   const nameInput = settingsDropdown.locator('input[placeholder="Type here"]');
//   await nameInput.fill("");
//   await page.waitForTimeout(1000);

//   // The name should revert to a default or maintain previous value
//   // Since we don't have explicit validation, we just verify it doesn't crash
//   await expect(settingsDropdown).toBeVisible();

//   // Test invalid color format
//   const colorInput = settingsDropdown.locator('input[placeholder="#ffffff"]');
//   await colorInput.fill("invalid-color");
//   await page.waitForTimeout(1000);

//   // Verify the UI still works after invalid input
//   await expect(settingsDropdown).toBeVisible();

//   // Test valid hex color without #
//   await colorInput.fill("00FF00");
//   await page.waitForTimeout(1000);

//   // Test invalid avatar URL
//   const avatarInput = settingsDropdown.locator(
//     'input[placeholder="https://..."]',
//   );
//   await avatarInput.fill("not-a-url");
//   await page.waitForTimeout(1000);

//   // Verify the UI doesn't crash with invalid URL
//   await expect(settingsDropdown).toBeVisible();

//   // Logout
//   await page.locator("body").click(); // Close dropdown
//   await page.getByRole("button", { name: "Logout" }).click();
// });
