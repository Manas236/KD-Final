/* Request-scoped values shared between a page and src/middleware.ts. */
declare namespace App {
  interface Locals {
    /** Launch mode only (src/lib/launch.ts): the saved edits the page was
        rendered against, which the middleware then writes into it. */
    kdSavedEdits?: Promise<import("./lib/server-edits").SavedEdits | null>;
  }
}
