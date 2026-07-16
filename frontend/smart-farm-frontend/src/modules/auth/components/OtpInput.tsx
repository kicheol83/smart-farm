import { useRef } from "react";
import { Box } from "@mui/material";

interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  error?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  error,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, digit: string) {
    if (!/^\d*$/.test(digit)) return;

    const next = [...value];
    next[index] = digit.slice(-1);
    onChange(next);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    const next = pasted.split("");
    while (next.length < length) next.push("");
    onChange(next);
    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  return (
    <Box sx={{ display: "flex", gap: "12px" }}>
      {Array.from({ length }).map((_, i) => (
        <Box
          key={i}
          component="input"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChange(i, e.target.value)
          }
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
            handleKeyDown(i, e)
          }
          onPaste={handlePaste}
          ref={(el: HTMLInputElement | null) => {
            inputRefs.current[i] = el;
          }}
          sx={{
            width: 72,
            height: 72,
            textAlign: "center",
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 28,
            color: "text.primary",
            bgcolor: "action.selected",
            border: "1.5px solid",
            borderColor: error
              ? "error.main"
              : value[i]
                ? "primary.main"
                : "action.hover",
            borderRadius: "12px",
            outline: "none",
            "&:focus": {
              borderColor: error ? "error.main" : "primary.main",
            },
          }}
        />
      ))}
    </Box>
  );
}
