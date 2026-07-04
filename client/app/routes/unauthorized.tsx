import { ErrorShell } from "../components/AdminShell";

export function meta() {
  return [{ title: "Unauthorized | Oppex" }];
}

export default function UnauthorizedPage() {
  return (
    <ErrorShell
      code="401"
      title="Not authorized"
      message="You need to log in with a verified email before accessing the portal."
      actionLabel="Go to login"
      actionTo="/login"
    />
  );
}
