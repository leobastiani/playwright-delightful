import { PlaywrightTestConfig } from "@playwright/test";
import { FixtureDictionary } from "fix-your-tortures";
import { BuilderParams } from "./src/index";

const fixtureDictionary = new FixtureDictionary();

interface User {
  username: string;
  password: string;
}
interface Message {
  from: User;
  to: User;
  content: string;
}

const userFactory = ({
  index = 0,
  username = `username${index}`,
  password = "123456",
}: Partial<User> & { index?: number } = {}): User => ({
  username,
  password,
});
const messageFactory = ({
  fixtures,
  from,
  to,
  content,
}: {
  fixtures?: any;
  from?: User;
  to?: User;
  content: string;
}): Message => ({
  from: fixtures.with("user", from),
  to: fixtures.with("user", to),
  content,
});
fixtureDictionary.define("user", {
  factory: userFactory,
  key: "username",
});
fixtureDictionary.define("message", {
  factory: messageFactory,
});

const config: PlaywrightTestConfig = {
  testMatch: /.*\.e2e\.ts/,
  metadata: {
    fixtureDictionary,
    storageDir: "tmp/storages",
    serverSetup(workerIndex: number) {
      // empty
    },
    baseURL(workerIndex: number) {
      return "http://localhost:8000";
    },
    serverCleanUp(workerIndex: number) {
      // empty
    },
    builders: {
      user: (data: User, args: BuilderParams, testInfo: any) => {
        Object.assign(data, { leo: 1 });
      },
      message: (data: any, args: BuilderParams, testInfo: any) => {},
    },
    dump(id: string, workerIndex: number) {
      console.log("dumping:", id);
    },
    restore(id: string, workerIndex: number) {
      console.log("restoring:", id);
    },
    dumpExists(id: string) {
      console.log("checking:", id);
      return false;
    },
  },
};

export default config;
