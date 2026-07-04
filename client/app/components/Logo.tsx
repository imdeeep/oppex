import { LOGO_URL } from "../lib/brand";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "h-8 w-auto" }: LogoProps) {
  return (
    <img
      src={LOGO_URL}
      alt="Oppex"
      className={className}
      width={120}
      height={32}
    />
  );
}
