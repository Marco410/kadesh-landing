"use client";

export default function Logo({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="KADESH logo"
      className="block"
    >
      <rect width="20" height="20" rx="16" fill="#A8D5BA" />
      <path
        d="M22 48V16H30V32L42 16H51L36 34L51 48H42L30 34V48H22Z"
        fill="#3B2C23"
      />
    </svg>
  );
}
