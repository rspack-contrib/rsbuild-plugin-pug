# @rsbuild/plugin-pug

An Rsbuild plugin to provide support for the Pug template engine.

> This repo is still working in progress.

<p>
  <a href="https://npmjs.com/package/@rsbuild/plugin-pug">
   <img src="https://img.shields.io/npm/v/@rsbuild/plugin-pug?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
</p>

## Usage

Install:

```bash
npm add @rsbuild/plugin-pug -D
```

Add plugin to your `rsbuild.config.ts`:

```ts
// rsbuild.config.ts
import { pluginPug } from "@rsbuild/plugin-pug";

export default {
  plugins: [pluginPug()],
};
```

## Options

### foo

Some description.

- Type: `string`
- Default: `undefined`
- Example:

```js
pluginPug({
  foo: "bar",
});
```

## License

[MIT](./LICENSE).
