import type { RsbuildDevServer, RsbuildPlugin } from '@rsbuild/core';
import debounce from 'lodash/debounce.js';
import type { Options as PugOptions } from 'pug';
import { reduceConfigs } from 'reduce-configs';

export type PluginPugOptions = {
	/**
	 * Used to set the compilation options for Pug.
	 * @see https://pugjs.org/api/reference.html#options
	 */
	pugOptions?: PugOptions;
};

export const PLUGIN_PUG_NAME = 'rsbuild:pug';

export const pluginPug = (options: PluginPugOptions = {}): RsbuildPlugin => ({
	name: PLUGIN_PUG_NAME,

	async setup(api) {
		const VUE_SFC_REGEXP = /\.vue$/;
		const { compile, compileClientWithDependenciesTracked } = await import(
			'pug'
		);

		const pugOptions = reduceConfigs({
			initial: {
				doctype: 'html',
				compileDebug: false,
			},
			config: options.pugOptions,
		});

		const state: {
			readyToReload: boolean;
			server?: RsbuildDevServer;
			dependencies: Map<string, Set<string>>;
		} = {
			readyToReload: false,
			server: undefined,
			dependencies: new Map(),
		};

		/**
		 * Trigger a page reload once on .pug entry rebuild
		 */
		const triggerPageReload = debounce(
			() => {
				state.server?.sockWrite('static-changed');
			},
			100,
			{
				leading: false,
				trailing: true,
			},
		);

		// Setup middleware to get access to the dev server instance.
		api.onBeforeStartDevServer(({ server }) => {
			state.server = server;
		});

		api.onCloseDevServer(() => {
			state.server = undefined;
			state.dependencies.clear();
		});

		// Prevent reload on initial build
		api.onDevCompileDone(() => {
			state.readyToReload = true;
		});

		api.transform(
			{ test: /\.pug$/ },
			({ code, resourcePath, addDependency }) => {
				const options = {
					filename: resourcePath,
					...pugOptions,
				};

				// Compile pug to HTML for Vue compiler
				if (VUE_SFC_REGEXP.test(resourcePath)) {
					const template = compile(code, options);
					const { dependencies } = template as unknown as {
						dependencies: string[];
					};

					if (dependencies) {
						dependencies.forEach(addDependency);
					}

					return template();
				}

				try {
					// Compile pug to JavaScript for html-webpack-plugin
					const { body, dependencies } = compileClientWithDependenciesTracked(
						code,
						options,
					);

					state.dependencies.delete(resourcePath);

					// Persis dependencies across builds in case if compilation error occurs
					state.dependencies.set(resourcePath, new Set(dependencies));

					if (state.readyToReload === true) {
						triggerPageReload();
					}

					return `${body}; export default template;`;
				} finally {
					// Watch all unique dependencies (includes, extends, etc.)
					for (const dependency of Array.from(
						state.dependencies.get(resourcePath) ?? [],
					)) {
						addDependency(dependency);
					}
				}
			},
		);
	},
});
