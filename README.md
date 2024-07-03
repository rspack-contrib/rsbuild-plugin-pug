# @rsbuild/plugin-pug

An Rsbuild plugin to provide support for the Pug template engine.

> [Pug](https://github.com/pugjs/pug) is a robust, elegant, feature rich template engine for Node.js.

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

### Using Pug Templates

After the plugin registration is completed, Rsbuild will automatically parse template files with the `.pug` extension and compile them using the Pug template engine.

For example, first create a `src/index.pug` file, and point to that file using `html.template`:

```ts title="rsbuild.config.ts"
export default {
  html: {
    template: "./src/index.pug",
  },
};
```

Then, you can use Pug syntax in the `index.pug` template:

```html
<!-- Input -->
p Hello #{text}!

<!-- Output -->
<p>Hello World!</p>
```

Please refer to the [Pug documentation](https://github.com/pugjs/pug) for a complete understanding of Pug's usage.

### Using in Vue

When using Vue, you can use Pug syntax in the template of `.vue` files:

```vue title="App.vue"
<template lang="pug">
button.my-button(@click='count++') Count is: {{ count }}
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    const count = ref(0);

    return {
      count,
    };
  },
};
</script>
```

## Options

### pugOptions

Used to set the compilation options for Pug. For detailed options, please refer to the [Pug API Reference](https://pugjs.org/api/reference.html#options).

- **Type:** `Object | Function | undefined`
- **Default:**

```ts
const defaultOptions = {
  doctype: "html",
  compileDebug: false,
};
```

- **Example 1:** Pass in a configuration object that will be merged with the default options using `Object.assign`.

```ts
pluginPug({
  pugOptions: {
    doctype: "xml",
  },
});
```

- **Example 2:** Pass in a configuration function. The default configuration will be passed as the first argument, and you can directly modify the configuration object or return a value as the final result.

```ts
pluginPug({
  pugOptions(config) {
    config.doctype = "xml";
  },
});
```

## License

[MIT](./LICENSE).
