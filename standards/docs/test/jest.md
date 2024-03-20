# Directories

Create a directory `test` in the project's root directory and add the following subdirectories:

- [`config`](#configuration): jest configurations
- [`src`](#source): test source files
- [`coverage`](#run): test coverage reports

# Configuration

The folder `<root>/test/config` contains 3 configuration files:

- `jest.base.config.ts`: base jest configuration

  ```ts
  import type { Config } from "jest";

  const baseConfig: Config = {
    verbose: true,
    preset: "ts-jest",

    // sets `rootDir` to the project's root directory
    //   - most other settings depend on this one
    //   - doesn't produce coverage reports if not set properly
    rootDir: "./../../",

    // to resolve imports according to the `paths` setting in the project's `tsconfig.json`
    moduleNameMapper: {
      "^@app/(.*)$": "<rootDir>/src/$1",
    },

    transform: {
      "^.+\\.(t|j)s$": "ts-jest",
    },

    // to collect coverage and produce reports
    collectCoverage: true,

    // coverage reports produced
    coverageReporters: ["clover", "json", "lcov", "text", "html"],

    moduleFileExtensions: ["js", "json", "ts"],
    moduleDirectories: ["node_modules", "src"],
  };

  export default baseConfig;
  ```

- `jest.unit.config.ts`: jest configuration for unit tests

  ```ts
  import { Config } from "jest";
  import baseConfig from "test/config/jest.base.config";

  const unitConfig: Config = {
    // extend from `baseConfig`
    ...baseConfig,

    // where to look for unit test files
    testMatch: ["<rootDir>/test/src/unit/**/*.spec.ts"],

    // source files to collect coverage from for unit tests
    collectCoverageFrom: [
      "<rootDir>/src/**/*.ts",
      "!<rootDir>/src/main.ts",
      "!<rootDir>/src/**/*.module.ts",
      "!<rootDir>/src/**/*.schema.ts",
      "!<rootDir>/src/app/**/*",
      "!<rootDir>/src/**/enum/**/*",
      "!<rootDir>/src/**/dto/**/*",
      "!<rootDir>/src/**/model/**/*",
      "!<rootDir>/src/**/interface/**/*",
      "!<rootDir>/src/**/decorator/**/*",
      "!<rootDir>/src/**/doc/**/*",
      "!<rootDir>/src/**/env/**/*",
    ],

    // where to output coverage reports for unit tests
    coverageDirectory: "<rootDir>/test/coverage/unit",

    // minimum requirements for global unit testing to pass
    //   - functions >= 40%
    //   - lines >= 40%
    coverageThreshold: {
      global: {
        functions: 40,
        lines: 40,
      },
    },
  };

  export default unitConfig;
  ```

- `jest.e2e.config.ts`: jest configuration for e2e tests

  ```ts
  import { Config } from "jest";
  import baseConfig from "test/config/jest.base.config";

  const e2eConfig: Config = {
    // extend from `baseConfig`
    ...baseConfig,

    // where to look for e2e test files
    testMatch: ["<rootDir>/test/src/e2e/**/*.spec.e2e.ts"],

    // source files to collect coverage from for e2e tests
    collectCoverageFrom: ["<rootDir>/src/**/*.ts"],

    // where to output coverage reports for e2e tests
    coverageDirectory: "<rootDir>/test/coverage/e2e",

    // minimum requirements for global e2e testing to pass
    //   - functions >= 80%
    //   - lines >= 80%
    coverageThreshold: {
      global: {
        functions: 80,
        lines: 80,
      },
    },
  };

  export default e2eConfig;
  ```

# Source

## Unit

Place unit tests under `<root>/test/src/unit`.

```ts
// `mongo.service.spec.ts` - sample unit test file

import { getEnvFilePath } from "@inlaze_techlead/gannar-core";
import { MongoService } from "@app/shared/database/mongo/service/mongo.service";
import { mongoConfig } from "@app/shared/env";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule as NestConfigModule } from "@nestjs/config";

describe("Mongo Service", () => {
  let mongoService: MongoService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        NestConfigModule.forRoot({
          envFilePath: getEnvFilePath("env/"),
          load: [mongoConfig],
        }),
      ],
      providers: [MongoService],
      exports: [MongoService],
    }).compile();

    mongoService = moduleRef.get<MongoService>(MongoService);
  });

  test("Mongo connection", () => {
    expect(mongoService.gannarDbConfig).toEqual({
      maxPoolSize: 5,
      uri: "mongodb://admin:pass@localhost:27017",
      dbName: "gannar-admin",
    });
  });
});
```

## E2e

Place e2e tests under `<root>/test/src/e2e`.

```ts
// `app.spec.e2e.ts` - sample e2e test file

import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@app/app/app.module";
import { EnvironmentEnum } from "@inlaze_techlead/gannar-core";

describe("App Controller (e2e)", () => {
  let app: INestApplication;

  // set `NODE_ENV=test`; make sure you have the corresponding `.env` file present for the test environment

  process.env.NODE_ENV = EnvironmentEnum.TEST;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    app.close();
  });

  test("/health (GET)", async () => {
    expect((await request(app.getHttpServer()).get("/health")).status).toBe(
      200
    );
  });
});
```

# Run

## Scripts

Include the following scripts in the project's `package.json`:

```json
"scripts": {
  ...,
  // runs `jest` with the configuration for unit testing
  "test:unit": "jest --config ./test/config/jest.unit.config.ts",
  // runs `jest` with the configuration for e2e testing
  "test:e2e": "jest --config ./test/config/jest.e2e.config.ts",
  ...
}
```

Running the scripts above will produce the corresponding coverage reports under the corresponding `coverage` folder:

- `yarn test:unit`: will produce coverage reports for unit tests under `<root>/test/coverage/unit`
- `yarn test:e2e`: will produce coverage reports for e2e tests under `<root>/test/coverage/e2e`

You can access the reports in `HTML` format through a browser: `<root>/test/coverage/<unit|e2e>/index.html`.
