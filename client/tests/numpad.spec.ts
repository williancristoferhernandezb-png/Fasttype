import { expect, test } from "@playwright/test";

async function openLesson(page: import("@playwright/test").Page, caso: string) {
  await page.goto(`/keyboard-test.html?case=${caso}`);
  await page.getByRole("button", { name: "Continuar donde voy" }).click();
  const input = page.getByRole("textbox", { name: "Escribe aquí el texto de la lección" });
  await expect(input).toBeFocused();
  return input;
}

test("Numpad0 is an error when a space is expected", async ({ page }) => {
  await openLesson(page, "space");
  await page.keyboard.press("Numpad5");
  await page.keyboard.press("Numpad0");

  const characters = page.locator(".caracter-escritura");
  await expect(characters.nth(0)).toHaveClass(/correcta/);
  await expect(characters.nth(1)).toHaveClass(/incorrecta/);
  await expect(page.locator(".leccion-metricas")).toContainText("2 /");
});

test("Space is accepted as a space in a numpad lesson", async ({ page }) => {
  await openLesson(page, "space");
  await page.keyboard.press("Numpad5");
  await page.keyboard.press("Space");

  const characters = page.locator(".caracter-escritura");
  await expect(characters.nth(0)).toHaveClass(/correcta/);
  await expect(characters.nth(1)).toHaveClass(/correcta/);
});

test("Numpad0 writes zero in the lesson dedicated to zero", async ({ page }) => {
  await openLesson(page, "zero");
  await page.keyboard.press("Numpad0");
  await page.keyboard.press("Space");

  const characters = page.locator(".caracter-escritura");
  await expect(characters.nth(0)).toHaveClass(/correcta/);
  await expect(characters.nth(1)).toHaveClass(/correcta/);
});
