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
  }
}

export async function completeRaceAlternatingMultiple({
  players,
}: {
  players: Page[];
}) {
  if (players.length < 2) {
    throw new Error(
      "At least 2 players are required for alternating race completion",
    );
  }

  // Wait for all players' races to be ready and focus their inputs
  const inputs: Array<{ page: Page; input: any }> = [];

  for (const player of players) {
    const input = player.locator('input[id="input-id"]');
    await expect(input).toBeVisible();
    await input.focus();
    inputs.push({ page: player, input });
  }

  let currentPlayerIndex = 0;
  let lettersTyped = 0;

  // Continue until any player finishes
  while (true) {
    // Check if any player has finished (no more letters to type)
    let anyPlayerFinished = false;
    const playerLetters = [];

    for (const { page } of inputs) {
      const letters = await page.locator('div[id="letter"]').all();
      playerLetters.push(letters);
      if (letters.length === 0) {
        anyPlayerFinished = true;
      }
    }

    if (anyPlayerFinished) {
      break;
    }

    // Current player types a letter
    const currentPlayer = inputs[currentPlayerIndex];
    const currentLetters = playerLetters[currentPlayerIndex];

    if (currentLetters.length > 0) {
      const firstLetter = await currentLetters[0].textContent();
      if (firstLetter) {
        await currentPlayer.input.type(firstLetter);
      }
    }

    // Move to next player
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    lettersTyped++;

    // Safety check to prevent infinite loops
    if (lettersTyped > 2000) {
      break;
    }
  }

  // Allow all remaining players to finish
  let allPlayersFinished = false;
  while (!allPlayersFinished) {
    allPlayersFinished = true;

    for (const { page, input } of inputs) {
      const letters = await page.locator('div[id="letter"]').all();

      if (letters.length > 0) {
        allPlayersFinished = false;
        const firstLetter = await letters[0].textContent();
        if (firstLetter) {
          await input.type(firstLetter);
        }
      }
    }
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

  // Close dropdown
  await page.locator("body").click();
}
