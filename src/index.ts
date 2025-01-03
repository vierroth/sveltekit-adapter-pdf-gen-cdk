import { Adapter } from "@sveltejs/kit";
import { fileURLToPath } from "url";
import adapterNode from "@sveltejs/adapter-node";
import { join } from "path";

export interface AdapterProps {
  out?: string;
}

export default function (props?: AdapterProps) {
  const { out = "./dist" } = props || {};

  const nodeAdapter = adapterNode({
    out: join(out, "handler"),
  });

  return {
    name: "@flit/sveltekit-adapter-pdf-gen-cdk",
    async adapt(builder) {
      const tmp = builder.getBuildDirectory("adapter-pdf-gen-cdk");
      builder.rimraf(tmp);
      builder.mkdirp(tmp);
      builder.rimraf(out);

      nodeAdapter.adapt(builder);

      builder.writeServer(`${tmp}/server`);

      builder.copy(
        fileURLToPath(new URL("./cdk.js", import.meta.url).href),
        join(out, "index.js"),
        {
          replace: {
            MANIFEST_DEST: "./server/manifest.js",
            HANDLER_DEST: "./handler.js",
          },
        },
      );

      builder.copy(
        fileURLToPath(new URL("./cdk.d.ts", import.meta.url).href),
        join(out, "index.d.ts"),
        {
          replace: {
            MANIFEST_DEST: "./server/manifest.js",
            HANDLER_DEST: "./handler.js",
          },
        },
      );

      builder.copy(
        fileURLToPath(new URL("./handler.cjs.js", import.meta.url).href),
        join(out, "handler", "index.cjs.js"),
        {
          replace: {
            MANIFEST_DEST: "./server/manifest.js",
            HANDLER_DEST: "./handler.js",
          },
        },
      );

      builder.copy(
        fileURLToPath(new URL("./handler.js", import.meta.url).href),
        join(out, "handler", "lambda.js"),
        {
          replace: {
            MANIFEST_DEST: "./server/manifest.js",
            HANDLER_DEST: "./handler.js",
          },
        },
      );

      builder.copy(
        fileURLToPath(
          new URL("./../puppeteer-layer.zip", import.meta.url).href,
        ),
        join(out, "puppeteer-layer.zip"),
      );
    },
  } satisfies Adapter;
}
