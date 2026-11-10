# Pooprinter

Generate downloadable SVG lettering from text and manage a shared library of letter G-code.
The app uses React, MUI, Firebase Authentication/Firestore, and a small Firebase HTTP service.

## Local development

Use Node **24.22.2** (`nvm use`) and Corepack. The function targets **Node 22** and explicitly
keeps its first-generation API, preserving the existing `/app` endpoint generation.
This does not establish the deployed runtime.

```sh
corepack enable
yarn install --immutable
yarn --cwd functions install --immutable
yarn hooks:install
cp .env.example .env.local
```

Start Firebase emulators in one terminal, then the app in another:

```sh
yarn emulators
yarn dev
```

The app runs at <http://localhost:3002>. Emulators need Java 21 or newer. Local functions
should also be exercised with Node 22 before deploying. The example environment uses the
isolated `demo-poorinter` project; no production credentials or data are needed.

Without `.env.local`, the app retains the existing project's public Firebase configuration.
`VITE_*` values are public browser configuration, not secrets. Never put server credentials
in them. `VITE_FUNCTIONS_URL` overrides the SVG service URL; otherwise the URL follows the
configured Firebase project, using the local functions emulator during development.

## Checks

```sh
yarn check          # format, lint, type checks, smoke tests, production builds
yarn test:rules     # two local Firebase emulator rules tests; requires Java 21+
yarn fmt           # format source and configuration
```

The small smoke suite checks signed-out rendering, the signed-in letters route, SVG
success/failure, and both real server renderers against the compiled function artifact.
Auth and Firestore are mocked in UI tests. Rules tests run only against a demo project.

Install the versioned Git hooks once per checkout with `yarn hooks:install`:

- **Pre-commit:** formatting and lint checks.
- **Pre-push:** the full `yarn check` (including production builds).
- **CI:** one cached job running type checks and smoke tests. No emulator, browser matrix,
  deployment, or repeated production frontend build in CI.

Both package directories use pinned Yarn 4 with `node_modules` and independent lockfiles.
The function remains independently installable because Firebase builds that subtree.
Backend HTTP tests use Node's test runner; frontend rendering tests use Vitest and Testing Library.
The pinned Firebase CLI runs on demand through `yarn firebase`; its large dependency tree
is excluded from routine installs and CI.

## Deployment and remaining validation

```sh
yarn deploy                       # hosting, existing poop-rinter project
yarn deploy:functions              # HTTP service, existing project
```

Deployment is a separate, explicit action. Existing `default`, `dev`, and `prod` aliases
all refer to the same production Firebase project; the `dev` alias is not a sandbox.
Hosting still serves `build/`, with SPA rewrites for `/letters`.

Google, Facebook, Twitter, GitHub, email/password, and phone sign-in are retained. OAuth
providers, authorized domains, and SMS/reCAPTCHA must be configured in Firebase Console.
Local mocks and emulators do not establish that real providers or deployed endpoints work.

Repository rules now permit authenticated access to `/letters` with bounded document
validation, and require an existing admin for Realtime Database admin writes. Deploying
hosting/functions does not deploy rules. Review and deploy rules separately when ready:

```sh
yarn firebase deploy --project poop-rinter --only firestore:rules,database
```

Legacy starter chat/account/admin UI, unused locales, push messaging, Redux, CRA, TSLint,
JSS, and old polyfills were removed. Existing data and deployed services were not deleted.
Fonts have one source directory, copied into the compiled function; renderer provenance
and licensing are recorded in [functions/src/fonts/README.md](functions/src/fonts/README.md).

## Dependency maintenance

Firebase 13.2 still constrains its Node Firestore transport to gRPC 1.9. A root resolution
selects patched `@grpc/grpc-js` 1.14.7 for Firestore until Firebase updates that constraint
([advisory](https://github.com/advisories/GHSA-m9gg-hp2v-232j)). The local
rules tests exercise the Node client with this override. Compatible lockfile refreshes
also pick up patched protobuf and YAML packages. Upstream OpenTelemetry and DOMException
polyfill deprecation notices remain in SDK dependencies.

## Tooling references

- [Vite 8 and the Rust-based Rolldown/Oxc toolchain](https://vite.dev/blog/announcing-vite8)
- [TypeScript 7 migration and removed compiler options](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [Yarn modern migration with node_modules](https://yarnpkg.com/migration/guide)
- [Oxlint type-aware linting](https://oxc.rs/docs/guide/usage/linter/type-aware)
- [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html)
- [MUI 9 migration](https://mui.com/material-ui/migration/upgrade-to-v9/)
- [Firebase function dependencies and Yarn](https://firebase.google.com/docs/functions/handle-dependencies)
