import assert from "assert";
import _ from "lodash";
import hash from "object-hash";

export class State<T> {
  constructor(private readonly state: T[]) {}

  isInitial(): boolean {
    return this.state.length === 0;
  }

  last(): T {
    const ret = _.last(this.state);
    assert.ok(ret);
    return ret;
  }

  hash: () => string = _.memoize(() => {
    if (this.state.length === 0) {
      return "0";
    }
    return hash(this.state);
  });

  previous(): State<T> {
    return new State(_.initial(this.state));
  }
}
