# Svelte API Worker

> Live: [https://api.svelte.dev](https://api.svelte.dev)

## Install

```sh
$ pnpm install
```

## Development

We use [Wrangler](https://developers.cloudflare.com/workers/cli-wrangler) for its local development server. This is effectively a proxy-service that (nearly) replicates the Cloudflare Worker runtime.

Anyone can develop this repository locally. Simply copy the `wrangler.example.toml` file as your own `wrangler.toml` file and insert the appropriate values. These values may (and should) be your own personal account values. This way any changes you make will not affect the live, production server and/or data.

```sh
$ cp wrangler.example.toml wrangler.toml
```

## Build

```sh
$ pnpm run build
```

## Deploy

> **Important:** For the relevent Svelte maintainers only~!

Deployment is handled by GitHub Actions, and is triggered automatically via `tag` events.
Tag & release this as if it were any other npm module – but don't publish it to the registry :wink:

```sh
# Format:
#   npm version <major|minor|patch> && git push origin master --tags
# Example:
$ npm version patch && git push origin master --tags
```
