import { composeReducer, initialStateReducer } from "./index";
describe("Index", () => {
  it("should export the correct functions", () => {
    expect(composeReducer).toBeTruthy();
    expect(initialStateReducer).toBeTruthy();
  });
});
