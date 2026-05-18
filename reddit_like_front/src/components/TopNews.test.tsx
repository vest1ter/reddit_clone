import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TopNews } from "./TopNews";
import { apiClient, ApiError } from "../api/client";

describe("TopNews", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading then headlines", async () => {
    vi.spyOn(apiClient, "getTopNews").mockResolvedValue({
      items: [
        {
          title: "Unit test headline",
          url: "https://example.com/a",
          source: "Example",
          publishedAt: "2025-01-01T00:00:00Z",
        },
      ],
      total: 1,
    });

    render(<TopNews />);

    expect(screen.getByText(/loading headlines/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Unit test headline")).toBeInTheDocument();
    });
    expect(screen.getByText("Example")).toBeInTheDocument();
  });

  it("shows error state on failed request", async () => {
    vi.spyOn(apiClient, "getTopNews").mockRejectedValue(new ApiError("bad", 500));

    render(<TopNews />);

    await waitFor(() => {
      expect(screen.getByText("bad")).toBeInTheDocument();
    });
  });
});
