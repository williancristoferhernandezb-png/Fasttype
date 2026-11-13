import { expect, test } from "@playwright/test";

async function openLesson(page: import("@playwright/test").Page, caso: string) {
  await page.goto(`/keyboard-test.html?case=${caso}`);
  await page.getByRole("button", { name: "Continuar donde voy" }).click();
  const input = page.getByRole("textbox", { name: "Escribe aquí el texto de la lección" });
  await expect(input).toBeFocused();
  return input;
}

// Primer contador de la barra de métricas: "<escritos> / <total>".
const contador = (page: import("@playwright/test").Page) =>
  page.locator(".leccion-metricas span").first();

test("Backspace borra el último carácter en una lección Numpad", async ({ page }) => {
  await openLesson(page, "space");
  const characters = page.locator(".caracter-escritura");

  await page.keyboard.press("Numpad5");
  await page.keyboard.press("Numpad0"); // error: se esperaba un espacio
  await expect(contador(page)).toHaveText(/^2 \/ \d+$/);

  await page.keyboard.press("Backspace");
  await expect(contador(page)).toHaveText(/^1 \/ \d+$/);
  await expect(characters.nth(1)).toHaveClass(/pendiente/);

  // Después de borrar se puede escribir el espacio correctamente.
  await page.keyboard.press("Space");
  await expect(characters.nth(1)).toHaveClass(/correcta/);
});

test("Backspace puede borrar varios caracteres seguidos", async ({ page }) => {
  await openLesson(page, "space");

  await page.keyboard.press("Numpad5");
  await page.keyboard.press("Space");
  await page.keyboard.press("Numpad5");
  await expect(contador(page)).toHaveText(/^3 \/ \d+$/);

  await page.keyboard.press("Backspace");
  await page.keyboard.press("Backspace");
  await expect(contador(page)).toHaveText(/^1 \/ \d+$/);
});

test("Backspace con el campo vacío no rompe nada", async ({ page }) => {
  await openLesson(page, "space");
  await page.keyboard.press("Backspace");
  await expect(contador(page)).toHaveText(/^0 \/ \d+$/);

  await page.keyboard.press("Numpad5");
  await expect(page.locator(".caracter-escritura").nth(0)).toHaveClass(/correcta/);
});

test("NumpadBackspace (Backspace del bloque numérico) también borra", async ({ page }) => {
  const input = await openLesson(page, "space");

  await page.keyboard.press("Numpad5");
  await page.keyboard.press("Numpad5");
  await expect(contador(page)).toHaveText(/^2 \/ \d+$/);

  // Playwright no tiene un nombre de tecla para NumpadBackspace, así que se
  // envía el evento con el mismo code que reporta un teclado que sí lo trae.
  await input.evaluate((el) => {
    el.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Backspace",
        code: "NumpadBackspace",
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await expect(contador(page)).toHaveText(/^1 \/ \d+$/);
});

test("Numpad0 donde se espera un espacio queda marcado como error y muestra el 0", async ({ page }) => {
  await openLesson(page, "space");
  const characters = page.locator(".caracter-escritura");

  await page.keyboard.press("Numpad5");
  await page.keyboard.press("Numpad0");

  const espacio = characters.nth(1);
  await expect(espacio).toHaveClass(/incorrecta/);
  await expect(espacio).toHaveClass(/caracter-espacio/);
  await expect(espacio).toHaveAttribute("data-escrito", "0");
  // Los aciertos no llevan marca de error.
  await expect(characters.nth(0)).not.toHaveAttribute("data-escrito", /.*/);
});

test("Un espacio tecleado donde se espera un número se muestra como ␣", async ({ page }) => {
  await openLesson(page, "space");
  const characters = page.locator(".caracter-escritura");

  await page.keyboard.press("Space");

  await expect(characters.nth(0)).toHaveClass(/incorrecta/);
  await expect(characters.nth(0)).toHaveAttribute("data-escrito", "␣");
});
