# Description

We use `yarn` as the node package manager; it recently had a major update (`versions 4.1.1`), which introduces new functionality:

- [Installation](#installation)
- [Configuration](#configuration)
- [PnP](#pnp---plugnplay)

# Installation

- [Documentation](https://yarnpkg.com/getting-started/install)

# Configuration

- [Documentation](https://yarnpkg.com/configuration/yarnrc)

- The `yarn` configuration file for the `yarn modern` must be called `.yarnrc.yml` and placed in the project's root directory
- `.yarnrc.yml` must contain the following

  ```yml
  # define how Node packages should be installed - if not set will use `pnp` by default, which is very strict and different
  nodeLinker: "node-modules"
  # define the registry to use when fetching packages
  npmRegistryServer: "https://registry.npmjs.org"
  # define the authentication token to use by default when accessing your registries
  npmAuthToken: "<NPM_AUTH_TOKEN>"
  ```

- `.yarnrc.yml` should be ignored as it will contain the registry auth token; create a `.yarnrc.yml-template` with the following contents and commit this instead

  ```yml
  nodeLinker: "node-modules"
  npmRegistryServer: "https://registry.npmjs.org"
  npmAuthToken: "<NPM_AUTH_TOKEN>"
  ```

## PnP - Plug'n'Play

- [Documentation](https://yarnpkg.com/migration/pnp)
- New way to install packages
  - New projects should be developed with this strategy
  - Existing ones should be developed with `nodeLinker: "node-modules"` as it uses the classic way of installing packages (`node_modules`)
