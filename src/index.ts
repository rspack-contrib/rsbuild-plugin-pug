import type {
	DevConfig,
	RsbuildPlugin,
	SetupMiddlewaresFn,
	SetupMiddlewaresServer,
} from '@rsbuild/core';
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
			server?: SetupMiddlewaresServer;
		} = {
			readyToReload: false,
			server: undefined,
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
		api.modifyRsbuildConfig((config) => {
			const setupMiddlewares = config.dev?.setupMiddlewares ?? [];

			const middleware: SetupMiddlewaresFn = (_, server) => {
				state.server = server;
			};

			const dev: DevConfig = {
				...config.dev,
				setupMiddlewares: [...setupMiddlewares, middleware],
			};

			return {
				...config,
				dev,
			};
		});

		api.onCloseDevServer(() => {
			state.server = undefined;
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

				// Compile pug to JavaScript for html-webpack-plugin
				const { body, dependencies } = compileClientWithDependenciesTracked(
					code,
					options,
				);

				// Watch all unique dependencies (includes, extends, etc.)
				for (const dependency of Array.from(new Set(dependencies))) {
					addDependency(dependency);
				}

				if (state.readyToReload === true) {
					triggerPageReload();
				}

				return `${body}; export default template;`;
			},
		);
	},
});
