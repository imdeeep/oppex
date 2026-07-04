import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { GuestGuard } from "../components/GuestGuard";
import { Input } from "../components/Input";
import { MessageBanner } from "../components/MessageBanner";
import { ApiError, signup } from "../lib/api";

export function meta() {
  return [{ title: "Sign up | Oppex" }];
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signup(email, password);
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        navigate(`/verify?email=${encodeURIComponent(email)}`, {
          state: {
            info: "This email is already registered. Click Resend code to get a new verification email.",
          },
        });
        return;
      }
      setError(err instanceof ApiError ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GuestGuard>
      <AuthLayout
        title="Create your account"
        subtitle="Sign up with your email and choose a secure password"
      >
      <form className="space-y-4" method="post" onSubmit={handleSubmit}>
        {error ? <MessageBanner message={error} variant="error" /> : null}

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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <Button type="submit" loading={loading}>
          Sign up
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-oppex-muted">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-oppex-primary hover:text-oppex-primary-hover"
        >
          Log in
        </Link>
      </p>
      </AuthLayout>
    </GuestGuard>
  );
}
