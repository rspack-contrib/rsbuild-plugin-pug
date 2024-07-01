import { defineConfig } from '@rsbuild/core';
import { pluginPug } from '../src';

export default defineConfig({
	plugins: [pluginPug()],
});
