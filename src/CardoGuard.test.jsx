import { fireEvent, render, screen } from "@testing-library/react";
import CardoGuard from "./CardoGuard.jsx";

describe("CardoGuard", () => {
  it("runs a synthetic guard check from the default scenario", () => {
    render(<CardoGuard />);

    expect(screen.getByText(/synthetic decision validator/i)).toBeInTheDocument();
    expect(screen.getByText(/synthetic only/i)).toBeInTheDocument();
    expect(
      screen.getByText(/route disruption threatens a fuel delivery/i, { selector: ".cardo-guard__hint" })
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/model confidence/i), {
      target: { value: "95" }
    });
    fireEvent.change(screen.getByLabelText(/cost to act/i), {
      target: { value: "5000" }
    });
    fireEvent.change(screen.getByLabelText(/cost of missing/i), {
      target: { value: "10000" }
    });
    fireEvent.click(screen.getByRole("button", { name: /run guard check/i }));

    expect(screen.getByText(/^ACT$/i)).toBeInTheDocument();
    expect(screen.getByText(/expected miss loss \$9,100 is higher than expected action waste \$450\./i)).toBeInTheDocument();
    expect(
      screen.getByText(/calibrated event likelihood/i, { selector: ".card-label" })
    ).toBeInTheDocument();
    expect(screen.getByText(/what would change the verdict/i)).toBeInTheDocument();
    expect(screen.getByText(/not a prediction model/i)).toBeInTheDocument();
  });

  it("resets to the selected synthetic example", () => {
    render(<CardoGuard />);

    fireEvent.change(screen.getByLabelText(/scenario/i), {
      target: { value: "routine-inspection-nudge" }
    });
    fireEvent.change(screen.getByLabelText(/model confidence/i), {
      target: { value: "95" }
    });
    fireEvent.change(screen.getByLabelText(/cost to act/i), {
      target: { value: "5000" }
    });
    fireEvent.change(screen.getByLabelText(/cost of missing/i), {
      target: { value: "10000" }
    });
    fireEvent.click(screen.getByRole("button", { name: /run guard check/i }));

    expect(screen.getByText(/^ACT$/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reset synthetic example/i }));

    expect(screen.getByText(/expected miss loss \$50,400 is higher than expected action waste \$35,200\./i)).toBeInTheDocument();
  });

  it("coerces invalid numeric input to zero", () => {
    render(<CardoGuard />);

    fireEvent.change(screen.getByLabelText(/cost to act/i), {
      target: { value: "" }
    });
    fireEvent.click(screen.getByRole("button", { name: /run guard check/i }));

    expect(screen.getByText(/expected action waste/i, { selector: ".card-label" })).toBeInTheDocument();
    expect(screen.getByText(/\$0/, { selector: ".cardo-guard__metric-value" })).toBeInTheDocument();
  });
});
