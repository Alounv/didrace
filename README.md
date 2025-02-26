# Didrace

Didace is a typing race app using zero-cache to synchronize players progress.

## Upstream BD

You need a main database to store the data. The db uri must be in the .env ZERO_UPSTREAM_DB. You can initialize this database with `seed.sql` file (include the quotes table). Replication must be enabled.

## Zero cache

Zero cache must be deployed, a simple way to do this is to deploy on fly.io using a `fly.toml`. It is described [here](https://zero.rocicorp.dev/docs/deployment).

## Permissions

You can launch the `bun run permissions`. It will populate a `permissions.sql` from the `src/schema.ts` permission section. You can then use the sql to modify the permissions.

## Front

The front app is Vite + Hono + SolidJS and necessitate the following env variables (consistent with the ones used in `fly.toml`):

```
ZERO_UPSTREAM_DB=
ZERO_AUTH_SECRET=
VITE_PUBLIC_SERVER=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```

The Discords ones are needed for the auth-provider.

## Local development

Add `.env` with the environment variables:
Run `bun install` the first time.
Run `bun run vite` to start the development server (linked to production zero-cache and database)
