import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { MessageBanner } from "../components/MessageBanner";
import { VerificationCodeInput } from "../components/VerificationCodeInput";
import { ApiError, resendCode, verifyOtp } from "../lib/api";

export function meta() {
  return [{ title: "Verify email | Oppex" }];
}

export default function VerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [info, setInfo] = useState<string | null>(
    (location.state as { info?: string } | null)?.info ?? null,
  );
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    if (!email) {
      setError("Missing email. Please sign up again.");
      return;
    }

    setResending(true);
    setError(null);
    setInfo(null);

    try {
      const result = await resendCode(email);
      setInfo(result.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not resend code");
    } finally {
      setResending(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email) {
      setError("Missing email. Please sign up again.");
      return;
    }

    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyOtp(email, code);
      navigate("/login?verified=true");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  const statusMessage = error ?? info;
  const statusVariant = error ? "error" : info ? "success" : undefined;

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={
        email
          ? `Enter the 6-digit code sent to ${email}`
          : "Enter the verification code from your email"
      }
    >
      {!email ? (
        <MessageBanner
          message="We could not find your email. Please sign up again."
          variant="error"
        />
      ) : (
        <form className="space-y-4" method="post" onSubmit={handleSubmit}>
          {statusMessage && statusVariant ? (
            <MessageBanner message={statusMessage} variant={statusVariant} />
          ) : null}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-oppex-heading">
              Verification code
            </label>
            <VerificationCodeInput value={code} onChange={setCode} disabled={loading} />
          </div>

          <Button type="submit" loading={loading}>
            Verify email
          </Button>

          <Button
            type="button"
            className="bg-white text-oppex-primary ring-1 ring-oppex-primary/30 hover:bg-oppex-primary/5"
            loading={resending}
            onClick={handleResend}
          >
            Resend code
          </Button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-oppex-muted">
        <Link
          to="/signup"
          className="font-medium text-oppex-primary hover:text-oppex-primary-hover"
        >
          Back to sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
