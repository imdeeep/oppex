import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { GuestGuard } from "../components/GuestGuard";
import { Input } from "../components/Input";
import { MessageBanner } from "../components/MessageBanner";
import { ApiError, login } from "../lib/api";

export function meta() {
  return [{ title: "Login | Oppex" }];
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    searchParams.get("verified") === "true"
      ? "Email verified successfully. You can log in now."
      : null,
  );
  const [messageVariant, setMessageVariant] = useState<"success" | "info" | "error">(
    searchParams.get("verified") === "true" ? "success" : "info",
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await login(email, password);
      setMessage(result.message);
      setMessageVariant(result.verified ? "success" : "info");

      if (result.verified) {
        navigate("/portal");
      }
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Login failed");
      setMessageVariant("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GuestGuard>
      <AuthLayout
        title="Login to Oppex"
        subtitle="Enter your email and password to access the portal"
      >
      <form className="space-y-4" method="post" onSubmit={handleSubmit}>
        {message ? <MessageBanner message={message} variant={messageVariant} /> : null}

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <Button type="submit" loading={loading}>
          Login
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-oppex-muted">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="font-medium text-oppex-primary hover:text-oppex-primary-hover"
        >
          Sign up
        </Link>
      </p>
      </AuthLayout>
    </GuestGuard>
  );
}
