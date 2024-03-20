# Description

- We use libraries to encapsulate code that is common to most projects
- The libraries live [here](https://www.npmjs.com/settings/inlaze_techlead/packages)
- There are libraries dedicated to Gannar and libraries for other projects; the Gannar project uses components from various libraries, not just the Gannar ones (e.g.: logger from `@inlaze_techlead/inlaze-common`)

# Usage

Include the dependency in the project's `package.json`:

```json
{
  ...,
  "dependencies": {
    "@inlaze_techlead/gannar-core": "^0.0.11",
    "@inlaze_techlead/inlaze-common": "^0.0.58",
    ...
  },
  ...
}
```

# NPM Package Registry Configuration

## NPM Package Registry

- Site: [`inlaze_techlead organization`](https://www.npmjs.com/settings/inlaze_techlead/packages)
- Authenticate your account from the `CLI` against the `npm package registry`:

  ```bash
  npm adduser
  ```

## Authentication

You need an authentication token to be able to authenticate against the `npm package registry`; you can set this through an `.npmrc` configuration file:

- Globally: `.npmrc` goes on your home directory
- Project: `.npmrc` goes on the project's root directory

`.npmrc` content:

```bash
@inlaze_techlead:registry=https://registry.npmjs.org
//registry.npmjs.org/:_authToken=<NPM_AUTH_TOKEN>
```

**Note**:

- Ask supervisor for the `NPM_AUTH_TOKEN` value
- If you have both a global and a project `.npmrc`, the project one takes precedence

# Create a New Library

We use [nx](https://nx.dev/) to manage libraries and monorepos.

- Generate a new library with name <library_name>

  ```bash
  pnpm exec nx generate @nx/js:library \
   --name=<library_name> \
   --unitTestRunner=jest \
   --directory=libs/<library_name> \
   --importPath=@inlaze_techlead/inlaze-<library_name> \
   --publishable=true \
   --projectNameAndRootFormat=as-provided \
   --no-interactive
  ```

  Modify the resulting folders/files according to existing libraries.

# Publish Library Updates

Go to the library's `package.json` and copy-paste the corresponding command as needed; e.g.:

```bash
# build the lib
npm run common-build

# publish the lib
npm run common-publish

# build and publish the lib
npm run common:build:publish
```

# Special Considerations

## Publishing

- You need to be a member of the [`inlaze_techlead organization`](https://www.npmjs.com/settings/inlaze_techlead/members) in the `npm package registry`
- Use `npm` or `pnpm` to install dependencies
- Make sure the `nx` dependencies are up to date
- The publish script will ask for the following
  - `Target version`: library's new version number
  - `OTP`: OTP the `2FA` you configured on your `npm package registry` account
