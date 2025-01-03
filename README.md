This SvelteKit adapter allow you to quickly build your own PDF generation service using PDF templates written in Svelte. The adapter will generate a [CDK](https://docs.aws.amazon.com/cdk/api/v2/) construct which you can simply import into your [CDK](https://docs.aws.amazon.com/cdk/api/v2/).

## Usage

### Installation

The package is available on [NPM](https://www.npmjs.com/package/@flit/cdk-auth0) and can be installed using your package manager of choice:

```bash
npm i @flit/sveltekit-adapter-pdf-gen-cdk
```

```bash
pnpm add @flit/sveltekit-adapter-pdf-gen-cdk
```

```bash
yarn add @flit/sveltekit-adapter-pdf-gen-cdk
```

### Setup

To get started you simply create a new SvelteKit project and add the adapter to your config:

#### **`svelte.config.js`**

```javascript
import adapter from "@flit/sveltekit-adapter-pdf-gen-cdk";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
  },
};
```

Now, when the project is built, the adapter will generate a [CDK](https://docs.aws.amazon.com/cdk/api/v2/) construct in the output directory (`dist/` by default) which can be imported and integrated into your [CDK](https://docs.aws.amazon.com/cdk/api/v2/) project.
