/**
 * @jest-environment node
 * @jest-skip-mongodb true
 */

// No longer need to mock MongoDB setup since we're handling it in jest.setup.js
// jest.mock('./__tests__/helpers/mongodb.setup.js', () => {});

describe("Basic test", () => {
  it("adds numbers correctly", () => {
    expect(1 + 2).toBe(3);
  });

  it("concatenates strings", () => {
    expect("hello" + " " + "world").toBe("hello world");
  });
});
