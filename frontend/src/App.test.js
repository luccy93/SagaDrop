import { render, screen } from "@testing-library/react";

test("basic smoke test", () => {
  render(<div>SagaDrop</div>);
  expect(screen.getByText("SagaDrop")).toBeTruthy();
});
