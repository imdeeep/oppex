import { useRef } from "react";

type VerificationCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const CODE_LENGTH = 6;

export function VerificationCodeInput({
  value,
  onChange,
  disabled = false,
}: VerificationCodeInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: CODE_LENGTH }, (_, index) => value[index] ?? "");

  function updateDigit(index: number, digit: string) {
    const next = value.split("");
    next[index] = digit;
    onChange(next.join("").slice(0, CODE_LENGTH));
  }

  return (
    <div className="flex justify-between gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          className="h-12 w-11 rounded-lg border border-oppex-border text-center text-lg font-semibold text-oppex-heading outline-none focus:border-oppex-primary focus:ring-2 focus:ring-oppex-primary/20"
          onChange={(event) => {
            const nextDigit = event.target.value.replace(/\D/g, "").slice(-1);
            updateDigit(index, nextDigit);
            if (nextDigit && index < CODE_LENGTH - 1) {
              inputsRef.current[index + 1]?.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digit && index > 0) {
              inputsRef.current[index - 1]?.focus();
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, CODE_LENGTH);
            if (pasted) {
              onChange(pasted);
              const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
              inputsRef.current[focusIndex]?.focus();
            }
          }}
        />
      ))}
    </div>
  );
}
