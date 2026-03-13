# Create monorepo structure

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

## Install Turborepo

```sh
pnpm add -D turbo -w
```

## Create `turbo.json`

## Add TypeScript Node Types

```sh
pnpm add -D @types/node -w
```

# Create db package

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

# Create AI package

```sh
mkdir -p packages/ai/src
cd packages/ai
pnpm init
pnpm add openai @anthropic-ai/sdk
```

## Create `packages/ai/src/index.ts` with the AI configurations

# Create Storage package

```sh
mkdir -p packages/storage/src
cd packages/storage
pnpm init
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Create `packages/storage/src/index.ts` with storage (R2/S3) configurations

# apps section (api, web, mobile)

### important, add the dependencies from the packages to use them in apps

`add "workspace:*" in package.json dependencies..`

```ts
  "dependencies": {
    "@repo/package": "workspace:*"
  }
```

## Create API (Hono) package

```sh
mkdir -p apps/api/src
cd apps/api
pnpm init
pnpm add hono @hono/node-server
pnpm add -D tsx
```

## Create `apps/api/src/index.ts` with hono server configurations

# Git

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

## First commit

```sh
git commit -m "initial commit"
```

## Set main Branch

```sh
git branch -M main
```

## Connect to github and create the repo

## If git cli available you can create the repo from command

```sh
gh repo create repo-name --public --source=. --remote=origin --push
```

## add the origin remote

```sh
git remote add origin https://github.com/user/repo.git
```

## Verify

```sh
git remote -v
```

## Push code

```sh
git push -u origin main
```

## If fails try to log in, follow steps and once youre loged in try again

```sh
gh auth login
```
