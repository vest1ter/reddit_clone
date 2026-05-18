import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Login } from "./components/Login";

describe("routing", () => {
  it("renders login route at /login", () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route
              path="/login"
              element={
                <Login
                  onSwitchToRegister={() => {}}
                  onLoginSuccess={() => {}}
                  onRequireEmailVerification={() => {}}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(screen.getByRole("heading", { name: /^sign in$/i })).toBeInTheDocument();
  });
});
