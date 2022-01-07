import { test } from ".";

test.beforeEach(({ fixtures }) => {
  fixtures.with("message", { content: "Hi" });
});

// eslint-disable-next-line jest/expect-expect
test("leo", async ({ fixtures }) => {
  await fixtures.setup();
});
