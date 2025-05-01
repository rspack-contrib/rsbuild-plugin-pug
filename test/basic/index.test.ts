import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild, loadConfig } from '@rsbuild/core';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should allow to use .pug template file', async ({ page }) => {
	const rsbuild = await createRsbuild({
		cwd: __dirname,
		rsbuildConfig: (await loadConfig({ cwd: __dirname })).content,
	});

	await rsbuild.build();
	const { server, urls } = await rsbuild.preview();

	await page.goto(urls[0]);
	const testPug = page.locator('#test-pug');
	await expect(testPug).toHaveText('Pug source code!');

	const testEl = page.locator('#test');
	await expect(testEl).toHaveText('Hello Rsbuild!');

	const dependencyEl = page.locator('#dependency');
	await expect(dependencyEl).toHaveText('dependency text');

	await server.close();
});
