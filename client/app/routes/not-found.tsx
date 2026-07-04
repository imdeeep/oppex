import { ErrorShell } from "../components/AdminShell";

export function meta() {
  return [{ title: "Page not found | Oppex" }];
}

export default function NotFoundPage() {
  return (
    <ErrorShell
      code="404"
      title="Page not found"
      message="The page you are looking for does not exist or may have been moved."
      actionLabel="Back to login"
      actionTo="/login"
    />
  );
}
