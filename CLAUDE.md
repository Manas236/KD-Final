## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## The KD test server: work there goes through its own Claude Code session

A Claude Code session runs on the KD test server (hostname `ip-172-26-8-71`, site at `/srv/kd-site`). The user relays between that session and the one on the development PC. Which half of this applies to you depends on where you are running — check `hostname` if unsure.

**If you are NOT on `ip-172-26-8-71`** (the development PC):

- Never give the user shell commands to run on the server. For anything that has to run there — a database check, a deploy, reading a log — write a **prompt for the server's Claude Code session** instead. The user pastes it there and pastes the report back to you.
- The prompt opens with a box check: run `hostname`; if it is not exactly `ip-172-26-8-71`, stop, say which machine it is, and do nothing else.
- The prompt is self-contained. The server session has none of your conversation, so say what to do and why, where (`/srv/kd-site`), what must not change (state "read-only" when it is a check), and exactly what to report back.
- Do not treat a check as done until the report comes back. Record what it says, not what you expected.

**If you ARE on `ip-172-26-8-71`:** prompts relayed by the user from the development-PC session are how work reaches you. Run the box check they open with, stay inside what the prompt allows, and report back in the form it asks for.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
