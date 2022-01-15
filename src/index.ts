import {
  Browser,
  BrowserContext,
  Page,
  Request,
  test as base,
  TestInfo,
  WorkerInfo
} from "@playwright/test";
import {
  FixtureCache,
  FixtureData,
  FixtureGetter,
  FixtureGraphRequester,
  FixtureIndexCounter,
  FixtureRequester
} from "fix-your-tortures";
import _ from "lodash";
import { FixtureDelightful } from "./FixtureDelightful";

export interface BuilderParams {
  fixtures: FixtureDelightful;
  browser: Browser;
  context: BrowserContext;
  page: Page;
  request: Request;
  baseURL: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function delight<T extends typeof base>(base: T) {
  const dump = _.memoize(async (id: string, testInfo: TestInfo) => {
    const { metadata } = testInfo.project;
    await metadata.dump(id, testInfo.workerIndex);
  });

  const allWorkerIndex = new Set();

  const test = base
    .extend<{}, { serverSetup: undefined }>({
      serverSetup: [
        async (
          {},
          use: (r: undefined) => Promise<void>,
          workerInfo: WorkerInfo
        ) => {
          allWorkerIndex.add(workerInfo.workerIndex);
          await workerInfo.project.metadata.serverSetup(workerInfo.workerIndex);
          await use(undefined);
        },
        { scope: "worker", auto: true },
      ],
      async baseURL(
        {},
        use: (r: string) => Promise<void>,
        workerInfo: WorkerInfo
      ) {
        await use(workerInfo.project.metadata.baseURL(workerInfo.workerIndex));
      },
    })
    .extend<{
      baseURL: string;
      fixtures: FixtureDelightful;
    }>({
      async fixtures(
        { browser, context, page, request, baseURL },
        use: (r: FixtureDelightful) => Promise<void>,
        testInfo: TestInfo
      ) {
        const args = { browser, context, page, request, baseURL };
        const { metadata } = testInfo.project;
        const fixtureCache = new FixtureCache();
        const fixtureGraphRequester = new FixtureGraphRequester();
        const fixtureRequester = new FixtureRequester(
          metadata.fixtureDictionary,
          new FixtureIndexCounter(),
          new FixtureIndexCounter(),
          fixtureCache,
          fixtureGraphRequester
        );
        const fixtureGetter = new FixtureGetter(
          metadata.fixtureDictionary,
          fixtureCache
        );
        const fixtures = new FixtureDelightful(
          fixtureRequester,
          fixtureGetter,
          fixtureGraphRequester,
          async (fixtureData: FixtureData) =>
            metadata.builders[fixtureData.name](
              fixtureData.data,
              args,
              testInfo
            ),
          async (id: string) => metadata.dumpExists(id, testInfo.workerIndex),
          async (id: string) => await dump(id, testInfo),
          async (id: string) => metadata.restore(id, testInfo.workerIndex)
        );
        Object.assign(args, { fixtures });
        await use(fixtures);
      },
    });

  test.beforeAll(async ({}, testInfo) => {
    if (!(await testInfo.project.metadata.dumpExists("0"))) {
      await dump("0", testInfo);
    }
  });

  test.afterAll(async ({}, { project }) => {
    await Promise.all(
      Array.from(allWorkerIndex).map((workerIndex) =>
        project.metadata.serverCleanUp(workerIndex)
      )
    );
  });

  return test;
}
