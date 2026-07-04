import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("verify", "routes/verify.tsx"),
  route("portal", "routes/portal.tsx"),
  route("unauthorized", "routes/unauthorized.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
