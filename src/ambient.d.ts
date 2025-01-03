declare module "HANDLER_DEST" {
  export function handler(...any): any;
}

declare module "MANIFEST_DEST" {
  import { SSRManifest } from "@sveltejs/kit";

  export const manifest: SSRManifest;
  export const prerendered: Set<string>;
}

declare namespace App {
  export interface Platform {
    req: import("http").IncomingMessage;
  }
}
