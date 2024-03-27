# Software

- Frontend: [`React`](https://react.dev/)
- Backend: [`NestJS`](https://nestjs.com/)
  - Package Manager: [`Yarn`](https://yarnpkg.com/)
  - Testing: [`Jest`](https://jestjs.io/)
  - Docs: [`TypeDco`](https://typedoc.org/)
- Editor: [VSCode](https://code.visualstudio.com/)
  - Extensions: ESLint, SonarLint, Prettier, Code Spell Checker

# Standards

- [Core Dependencies](./docs/dependencies/dependencies.md)
- [Git Flow](./docs/git/git_flow.md)
- [Testing](./docs/test/test.md)
- [TypeDoc](./docs/type_doc/type_doc.md)
- Code
  - [Style Rules](./docs/code_style/code_style.md)
  - `DRY` (Don't Repeat Yourself)
  - `KISS` (Keep It Simple Stupid)
  - `SOLID`
  - In general, apply OOP (and Functional where applicable) principles well to write clean, modular, scalable, robust code

# Environments & Deployments

Will have the following environments:

- `Development`
- `SIT` (System Integration Testing)
- `PROD`

All environments should be the same, except for environment specific variables and data.

Deployments will be taken care of by scripts, which will perform the tasks necessary to deploy; you will use the same scripts to deploy for all environments (no manual deploys even in `Development`).

Only code in the `Development` environment can be modified; anything in environments `SIT` and above is to be left **UNTOUCHED**.

# Developer Responsibilities

- Comment high-level plan to solve story on JIRA issue
- 1st hour of day to be used to write tests and documentation
- Estimates
  - Only for dev effort; testing will be taken care of with 1st hour of each day
  - Story points in fib (1, 2, 3, 5, 8, ...)
  - Can use relationship between story point estimation & time taken to develop story to measure developer speed
- Explain overall solution on PRs

# Miscellaneous

- [Yarn](./docs/yarn/yarn.md)
- [Libraries](./docs/libs/libs.md)
- [Docker](./docs/docker/docker.md)
