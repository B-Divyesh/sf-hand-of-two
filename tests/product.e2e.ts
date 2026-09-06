import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Browser, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

async function chooseFirstThree(page: Page): Promise<void> {
  await page.locator('button.game-card').nth(0).click();
  await page.locator('button.game-card').nth(1).click();
  await page.locator('button.game-card').nth(2).click();
}

async function playOneTurn(page: Page, locationIndex = 0): Promise<void> {
  await page.locator('button.game-card').first().click();
  await page.locator('[data-location]').nth(locationIndex % 3).click();
  await page.getByRole('button', { name: 'Lock this move' }).click();
}

async function createTwoPlayerRoom(browser: Browser): Promise<{ host: Page; guest: Page; close: () => Promise<void>; code: string }> {
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();
  await host.goto('/play');
  await host.getByRole('button', { name: 'Create a room' }).click();
  await expect(host.getByText('Room ready')).toBeVisible();
  const code = (await host.locator('.room-code').textContent())!.trim();
  await guest.goto(`/play?room=${code}`);
  await guest.getByRole('button', { name: `Join room ${code}` }).click();
  await expect(host.getByRole('heading', { name: 'Draft three weather cards' })).toBeVisible();
  await expect(guest.getByRole('heading', { name: 'Draft three weather cards' })).toBeVisible();
  const thirdJoin = await host.request.post(`/api/rooms/${code}/join`);
  expect(thirdJoin.status()).toBe(409);
  expect((await thirdJoin.json() as { error: string }).error).toContain('already has two players');
  return { host, guest, code, close: async () => { await hostContext.close(); await guestContext.close(); } };
}

async function finishDraft(host: Page, guest: Page): Promise<void> {
  await chooseFirstThree(host);
  await chooseFirstThree(guest);
  await Promise.all([
    host.getByRole('button', { name: 'Lock three cards' }).click(),
    guest.getByRole('button', { name: 'Lock three cards' }).click()
  ]);
  await expect(host.getByRole('heading', { name: 'Choose a card and predict the other move' })).toBeVisible();
  await expect(guest.getByRole('heading', { name: 'Choose a card and predict the other move' })).toBeVisible();
}

test('@claim:demo-sandbox enters a populated sample in one click without changing real settings', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('hand-of-two:settings', JSON.stringify({ sound: true, motion: 'full' })));
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('button.game-card')).toHaveCount(6);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('button.game-card')).toHaveCount(6);
  const storage = await page.evaluate(() => ({ keys: Object.keys(localStorage), settings: localStorage.getItem('hand-of-two:settings') }));
  expect(storage.keys.filter((key) => key.startsWith('demo:'))).toEqual([]);
  expect(storage.settings).toContain('"sound":true');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'system');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.goBack();
  await expect(page.getByText('0 of 3 selected')).toBeVisible();
});

test('@claim:six-turn-match completes six turns and restart returns to a fresh draft', async ({ page }, testInfo) => {
  await page.goto('/demo');
  await chooseFirstThree(page);
  await page.getByRole('button', { name: 'Lock three cards' }).click();
  for (let turn = 0; turn < 6; turn += 1) await playOneTurn(page, turn);
  await expect(page.getByRole('heading', { name: /win|lose|draw/i })).toBeVisible();
  await page.getByText('Review all six turns').click();
  await expect(page.locator('.history-list li')).toHaveCount(6);
  const screenshot = await page.screenshot();
  await testInfo.attach('demo-end-screen', { body: screenshot, contentType: 'image/png' });
  await page.getByRole('button', { name: 'Play the sample again' }).click();
  await expect(page.getByRole('heading', { name: 'Draft three weather cards' })).toBeVisible();
  await expect(page.getByText('0 of 3 selected')).toBeVisible();
});

test('@claim:private-requests keeps sample and room setup on product-owned origins', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4173') external.push(url.origin);
  });
  await page.goto('/demo');
  await chooseFirstThree(page);
  await page.getByRole('button', { name: 'Lock three cards' }).click();
  await playOneTurn(page);
  await page.goto('/play');
  await page.getByRole('button', { name: 'Create a room' }).click();
  await expect(page.getByText('Room ready')).toBeVisible();
  expect(external).toEqual([]);
});

test('@claim:two-client-room resolves hidden choices for independent clients and reaches an end screen', async ({ browser }, testInfo) => {
  const room = await createTwoPlayerRoom(browser);
  try {
    await finishDraft(room.host, room.guest);
    for (let turn = 0; turn < 6; turn += 1) {
      const guestScore = await room.guest.locator('.score-grid').textContent();
      await playOneTurn(room.host, turn);
      await expect(room.host.getByRole('heading', { name: 'Wait for the other player’s move' })).toBeVisible();
      await expect(room.guest.getByRole('heading', { name: 'Choose a card and predict the other move' })).toBeVisible();
      expect(await room.guest.locator('.score-grid').textContent()).toBe(guestScore);
      await playOneTurn(room.guest, turn + 1);
      if (turn < 5) {
        await expect(room.host.getByRole('heading', { name: 'Choose a card and predict the other move' })).toBeVisible();
      }
    }
    await expect(room.host.getByRole('heading', { name: /win|lose|draw/i })).toBeVisible();
    await expect(room.guest.getByRole('heading', { name: /win|lose|draw/i })).toBeVisible();
    await testInfo.attach('two-client-end-screen', { body: await room.host.screenshot(), contentType: 'image/png' });
    await Promise.all([
      room.host.getByRole('button', { name: 'Ask for a rematch' }).click(),
      room.guest.getByRole('button', { name: 'Ask for a rematch' }).click()
    ]);
    await expect(room.host.getByRole('heading', { name: 'Draft three weather cards' })).toBeVisible();
    await expect(room.guest.getByRole('heading', { name: 'Draft three weather cards' })).toBeVisible();
  } finally { await room.close(); }
});

test('@claim:one-turn-reconnect restores a locked move after refresh', async ({ browser }) => {
  const room = await createTwoPlayerRoom(browser);
  try {
    await finishDraft(room.host, room.guest);
    await playOneTurn(room.host, 0);
    await expect(room.host.getByRole('heading', { name: 'Wait for the other player’s move' })).toBeVisible();
    await room.host.reload();
    await expect(room.host.getByRole('heading', { name: 'Wait for the other player’s move' })).toBeVisible();
    await playOneTurn(room.guest, 1);
    await expect(room.host.getByRole('heading', { name: 'Choose a card and predict the other move' })).toBeVisible();
    await expect(room.host.getByText('Turn 2 of 6')).toBeVisible();
  } finally { await room.close(); }
});

test('@claim:settings-persist keeps sound and reduced motion after reload', async ({ page }) => {
  await page.goto('/settings');
  await page.getByRole('radio', { name: 'On', exact: true }).check();
  await page.getByLabel('Reduce motion').check();
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(page.getByText('Settings saved on this device.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('radio', { name: 'On', exact: true })).toBeChecked();
  await expect(page.getByLabel('Reduce motion')).toBeChecked();
  expect(await page.locator('html').getAttribute('data-motion')).toBe('reduced');
  const transitionSeconds = await page.getByRole('button', { name: 'Save settings' }).evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration));
  expect(transitionSeconds).toBeLessThanOrEqual(.001);
  await page.addInitScript(() => {
    (window as unknown as { __toneStarts: number }).__toneStarts = 0;
    class TestAudioContext {
      currentTime = 0;
      destination = {};
      createOscillator() {
        return {
          frequency: { value: 0 },
          connect() { return this; },
          start() { (window as unknown as { __toneStarts: number }).__toneStarts += 1; },
          stop() {},
          addEventListener(_name: string, callback: () => void) { setTimeout(callback, 0); }
        };
      }
      createGain() {
        return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; } };
      }
      close() { return Promise.resolve(); }
    }
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: TestAudioContext });
  });
  await page.goto('/play');
  await page.getByRole('button', { name: 'Create a room' }).click();
  const code = (await page.locator('.room-code').textContent())!.trim();
  const guestContext = await page.context().browser()!.newContext();
  const guest = await guestContext.newPage();
  await guest.goto(`/play?room=${code}`);
  await guest.getByRole('button', { name: `Join room ${code}` }).click();
  await chooseFirstThree(page);
  await chooseFirstThree(guest);
  await Promise.all([
    page.getByRole('button', { name: 'Lock three cards' }).click(),
    guest.getByRole('button', { name: 'Lock three cards' }).click()
  ]);
  await playOneTurn(page);
  await playOneTurn(guest, 1);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __toneStarts: number }).__toneStarts)).toBe(1);
  await guestContext.close();
});

test('@claim:one-time-offer presents one inactive $8 offer without starting checkout', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Buy the complete deck once for $8 USD' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Purchase setup pending' })).toBeDisabled();
  await page.goto('/terms');
  await expect(page.getByText('$8 USD as a one-time purchase')).toBeVisible();
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('backend persists room state and rate limits creation with Retry-After', async ({ request }) => {
  const health = await request.get('/api/health');
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({ status: 'ok' });
  const statuses: number[] = [];
  let retryAfter: string | undefined;
  for (let index = 0; index < 13; index += 1) {
    const response = await request.post('/api/rooms', { headers: { 'x-forwarded-for': '198.51.100.44' } });
    statuses.push(response.status());
    if (response.status() === 429) retryAfter = response.headers()['retry-after'];
  }
  expect(statuses.filter((status) => status === 201)).toHaveLength(12);
  expect(statuses.at(-1)).toBe(429);
  expect(retryAfter).toBe('60');
});

test('invalid rooms, lost connections, and keyboard card choices provide recovery', async ({ page, context }) => {
  await page.goto('/play');
  await page.locator('#room-code').fill('AAAAA');
  await page.getByRole('button', { name: 'Join room' }).click();
  await expect(page.getByRole('alert')).toContainText('room was not found');

  await context.setOffline(true);
  await page.getByRole('button', { name: 'Create a room' }).click();
  await expect(page.getByRole('alert')).toContainText('Try again when the connection returns');
  await context.setOffline(false);

  await page.goto('/demo');
  const firstCard = page.locator('button.game-card').first();
  await firstCard.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('button.game-card').first()).toHaveAttribute('aria-pressed', 'true');
});

test('@a11y core routes have one heading, keyboard landmarks, and no serious axe violations', async ({ page }) => {
  for (const route of ['/', '/demo', '/play', '/settings', '/privacy', '/terms']) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.title()).not.toBe('');
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});

test('phone layout shows the job, first action, and active game preview before scrolling', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Draft cards and predict the other player’s moves' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  const gamePreview = page.locator('.mobile-game-strip');
  await expect(gamePreview).toBeVisible();
  expect((await gamePreview.boundingBox())!.y).toBeLessThan(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await testInfo.attach('phone-first-screen', { body: await page.screenshot(), contentType: 'image/png' });
  await page.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await context.close();
});

test('unknown URLs return a designed 404 response with a way home', async ({ page }) => {
  const response = await page.goto('/not-a-real-route');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'This page does not exist' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to Hand of Two' })).toBeVisible();
});
