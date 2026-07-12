import { SvgIcon, type SvgIconProps } from "@mui/material";

/**
 * @mui/icons-material da rasmiy Google/Apple brand ikonalari yo'q
 * (litsenziya siyosati tufayli), shuning uchun rasmiy SVG lardan
 * qo'lda SvgIcon sifatida yaratildi.
 */

export function GoogleIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.65Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09C3.24 21.3 7.28 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.64H1.27A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.27 5.36l4-3.08Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.27 6.64l4 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"
      />
    </SvgIcon>
  );
}

export function AppleIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M16.36 1.43c0 1.14-.42 2.2-1.12 3.02-.85.98-2.16 1.72-3.36 1.63-.14-1.18.44-2.4 1.14-3.15C13.9.87 15.3.1 16.36 0c.02.14.02.28.02.43ZM20.4 17.53c-.51 1.18-.76 1.7-1.42 2.75-.92 1.46-2.22 3.28-3.83 3.3-1.43.01-1.8-.93-3.75-.93-1.94 0-2.36.9-3.79.94-1.6.05-2.82-1.58-3.75-3.03-2.05-3.19-2.26-6.94-1-8.93.9-1.42 2.32-2.26 3.65-2.26 1.36 0 2.21.94 3.34.94 1.09 0 1.75-.94 3.34-.94 1.19 0 2.45.65 3.34 1.77-2.94 1.6-2.47 5.78.87 6.4Z"
      />
    </SvgIcon>
  );
}
