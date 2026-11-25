/**
 * «Dame una patita»: an outlined paw (four round toes and a rounded pad), drawn like a Hugeicons
 * stroke icon so it sits well next to them. Own drawing (Hugeicons has no paw); uses
 * `currentColor`, so it takes the text color. Not the huellitas icon.
 */
export default function DonationIcon({
  size = 20,
  strokeWidth = 1.9,
  className,
  title,
}: {
  size?: number;
  /** In 24-unit space, like Hugeicons (1.5–2). */
  strokeWidth?: number;
  className?: string;
  /** Without it the icon is decorative (`aria-hidden`). */
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <circle cx="4.3" cy="10.6" r="2" />
      <circle cx="8.7" cy="5.3" r="2" />
      <circle cx="15.3" cy="5.3" r="2" />
      <circle cx="19.7" cy="10.6" r="2" />
      <path d="M12 11.6c1.4 0 2.3.9 3.3 2.3l2.6 3.8c1.4 2 .2 4.3-2.1 4.3-1.4 0-2.5-.6-3.8-.6s-2.4.6-3.8.6c-2.3 0-3.5-2.3-2.1-4.3l2.6-3.8c1-1.4 1.9-2.3 3.3-2.3Z" />
    </svg>
  );
}
