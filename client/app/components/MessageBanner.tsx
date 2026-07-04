type MessageBannerProps = {
  message: string;
  variant?: "error" | "success" | "info";
};

export function MessageBanner({
  message,
  variant = "info",
}: MessageBannerProps) {
  return (
    <p className={`form-message form-message--${variant}`} role="alert">
      {message}
    </p>
  );
}
