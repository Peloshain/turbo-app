### Create monorepo structure

```sh
mkdir mi-app && cd mi-app
pnpm init
```

## Create the pnpm workspace `pnpm-workspace.yaml` with:

```sh
packages:
  - 'apps/*'
  - 'packages/*'
```

### Install Turborepo

```sh
pnpm add -D turbo -w
```

### Create `turbo.json`

### Add TypeScript Node Types

```sh
pnpm add -D @types/node -w
```

### Create db package

```sh
mkdir -p packages/db
cd packages/db
pnpm init
pnpm add prisma @prisma/client
npx prisma init
```

## Add package.json prisma scripts

## Add initial schema

### Add `packages/db/src/index.ts` with prisma client configs and exports

## Generate prisma client

```sh
pnpm prisma generate
```

## Generate initial migration

```sh
pnpm prisma migrate dev
```

#### Git

```sh
git init
```

## Create basic .gitignore

## Add files

```sh
git add .
```

## Or file

```sh
git add some-file.extension
```
