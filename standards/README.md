# Intro

The project Gannar is a white-label betting house product, which means its users can use to
create their own betting house product through CMS functionality.
It will go live in Dominican Republic initially and expand from there.

# MVP

The MVP will include the minimum functionality / features:

- Back office
  - Ability to administer
    - Users
    - Roles
    - Permissions
- CMS
  - Dynamic register
  - Generic module to demonstrate ability to modify components
- Betting
  - Subset of sports / markets
  - GTS (Risk Management System)
- Casino
  - Some integrations with casinos
- Payment Gateways
  - ???

# Project

- [JIRA](https://inlaze.atlassian.net/jira/software/projects/GAN/boards/8/backlog)
- [Repositories](https://github.com/orgs/sport-enlace-sas-gannar/repositories)
- [Commercial Documentation](https://sportenlace-my.sharepoint.com/personal/c_osorio_sportenlace_onmicrosoft_com/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fc%5Fosorio%5Fsportenlace%5Fonmicrosoft%5Fcom%2FDocuments%2FGannar%2FDocumentacion%20Comercial&view=0)
- [Technical Documentation (this)](https://github.com/sport-enlace-sas-gannar/gannar-docs/tree/main)

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

# Documentation

There are 3 places for documentation:

- [Commercial Documentation](https://sportenlace-my.sharepoint.com/personal/c_osorio_sportenlace_onmicrosoft_com/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fc%5Fosorio%5Fsportenlace%5Fonmicrosoft%5Fcom%2FDocuments%2FGannar%2FDocumentacion%20Comercial&view=0): in Spanish, high-level overview of the system in natural language, tailored towards comercial staff
- [Technical Documentation (this)](https://github.com/sport-enlace-sas-gannar/gannar-docs/tree/main): in English, detailed technical documentation of the system in `MD`, tailored towards developers and IT staff
  - [Gannar repos](https://github.com/orgs/sport-enlace-sas-gannar/repositories)
  - [General developer information](./docs/)
- Code documentation produced by `TypeDoc`

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
