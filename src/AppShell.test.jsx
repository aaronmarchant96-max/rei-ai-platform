import { act } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AppShell from "./AppShell.jsx";

async function waitForLazySettle() {
  await act(async () => {});
}

describe("AppShell", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    document.title = "";
  });

  it("defaults to Tools landing and shows the brand header", async () => {
    render(<AppShell />);
    await waitForLazySettle();

    expect(screen.getByRole("heading", { name: /^tools$/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(document.title).toBe("PromptHound Labs | Tools");
    });
  });

  it("navigates back to Tools landing from a tool", async () => {
    window.history.replaceState({}, "", "/#storm-replay");
    render(<AppShell />);
    await waitForLazySettle();

    expect(screen.getByRole("button", { name: /PromptHound Labs/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /PromptHound Labs/i }));
    await waitForLazySettle();

    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
      expect(window.location.hash).toBe("");
    });
    await waitFor(() => {
      expect(document.title).toBe("PromptHound Labs | Tools");
    });
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /^tools$/i })).toBeInTheDocument();
    });
  });

  it("opens a tool from the Tools landing page", async () => {
    render(<AppShell />);
    await waitForLazySettle();

    expect(screen.getByRole("heading", { name: /^tools$/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Old sources into story blueprints/i }));
    await waitForLazySettle();

    await waitFor(() => {
      expect(window.location.hash).toBe("#story-forge");
    });
    await waitFor(() => {
      expect(document.title).toBe("PromptHound Labs | Story Forge");
    });
  });

  it("respects the initial hash on load", async () => {
    window.history.replaceState({}, "", "/#storm-replay");

    render(<AppShell />);
    await waitForLazySettle();

    expect(document.querySelector(".shell-tool-bar__current")?.textContent).toBe("Storm Replay");
    expect(document.title).toBe("PromptHound Labs | Storm Replay");
  });

  it("loads REI.ai Guard from the hash", async () => {
    window.history.replaceState({}, "", "/#cardo-guard");

    render(<AppShell />);
    await waitForLazySettle();

    expect(document.querySelector(".shell-tool-bar__current")?.textContent).toBe("REI.ai Guard");
    expect(document.title).toBe("PromptHound Labs | REI.ai Guard");
  });

  it("loads Tracepoint from the hash", async () => {
    window.history.replaceState({}, "", "/#tracepoint");

    render(<AppShell />);
    await waitForLazySettle();

    expect(document.querySelector(".shell-tool-bar__current")?.textContent).toBe("Tracepoint");
    expect(document.title).toBe("PromptHound Labs | Tracepoint");
  });

  it("loads Tools from the /tools pathname", async () => {
    window.history.replaceState({}, "", "/tools");

    render(<AppShell />);
    await waitForLazySettle();

    expect(screen.getByRole("heading", { name: /^tools$/i })).toBeInTheDocument();
    expect(document.title).toBe("PromptHound Labs | Tools");
  });
});
