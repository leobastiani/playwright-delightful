import assert from "assert";
import {
  FixtureData,
  FixtureGetter,
  FixtureGraphRequester,
  FixtureRequester,
} from "fix-your-tortures";
import { State } from "./State";

export class FixtureDelightful {
  constructor(
    private readonly fixtureRequester: FixtureRequester,
    private readonly fixtureGetter: FixtureGetter,
    private readonly fixtureGraphRequester: FixtureGraphRequester,
    private readonly builder: (fixtureData: FixtureData) => unknown,
    private readonly dumpExists: (id: string) => Promise<boolean>,
    private readonly dump: (id: string) => Promise<void>,
    private readonly restore: (id: string) => Promise<void>
  ) {}

  async setup(): Promise<void> {
    await this.dumpOrRestore(new State(this.fixtureGraphRequester.toBuild));
  }

  private async dumpOrRestore(state: State<FixtureData>): Promise<void> {
    const id = state.hash();
    const dumpExists = await this.dumpExists(id);
    if (state.isInitial()) {
      assert.ok(
        dumpExists,
        '"dumpExists" should return true for initial state'
      );
    }
    if (dumpExists) {
      await this.restore(id);
      return;
    }
    await this.dumpOrRestore(state.previous());
    await this.builder(state.last());
    await this.dump(id);
  }

  get(
    ...args: Parameters<FixtureGetter["get"]>
  ): ReturnType<FixtureGetter["get"]> {
    return this.fixtureGetter.get(...args);
  }

  with(
    ...args: Parameters<FixtureRequester["with"]>
  ): ReturnType<FixtureRequester["with"]> {
    return this.fixtureRequester.with(...args);
  }

  create(
    ...args: Parameters<FixtureRequester["create"]>
  ): ReturnType<FixtureRequester["create"]> {
    return this.fixtureRequester.create(...args);
  }
}
