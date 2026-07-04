import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as api from "../app/lib/api";
import LoginPage from "../app/routes/login";
import NotFoundPage from "../app/routes/not-found";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("LoginPage", () => {
  it("renders email and password fields", async () => {
    vi.spyOn(api, "getMe").mockRejectedValue(new api.ApiError(401, "Unauthorized"));

    const router = createMemoryRouter(
      [{ path: "/login", Component: LoginPage }],
      { initialEntries: ["/login"] },
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("blocks logged-in users from the login form", async () => {
    vi.spyOn(api, "getMe").mockResolvedValue({
      id: 1,
      email: "test@example.com",
      verified: true,
    });

    const router = createMemoryRouter(
      [{ path: "/login", Component: LoginPage }],
      { initialEntries: ["/login"] },
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(api.getMe).toHaveBeenCalled();
    });
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
  });

  it("shows unverified login message", async () => {
    vi.spyOn(api, "getMe").mockRejectedValue(new api.ApiError(401, "Unauthorized"));
    vi.spyOn(api, "login").mockResolvedValue({
      id: 1,
      email: "test@example.com",
      verified: false,
      message: "You need to validate your email to access the portal",
    });

    const router = createMemoryRouter(
      [{ path: "/login", Component: LoginPage }],
      { initialEntries: ["/login"] },
    );

    const user = userEvent.setup();
    render(<RouterProvider router={router} />);

    await screen.findByLabelText("Email");
    await user.type(document.querySelector('input[name="email"]')!, "test@example.com");
    await user.type(document.querySelector('input[name="password"]')!, "SecurePass1");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(
      await screen.findByText("You need to validate your email to access the portal"),
    ).toBeInTheDocument();
  });
});

describe("NotFoundPage", () => {
  it("renders not found copy", () => {
    const router = createMemoryRouter(
      [{ path: "*", Component: NotFoundPage }],
      { initialEntries: ["/missing"] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });
});
