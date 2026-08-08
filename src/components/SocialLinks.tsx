export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <path d="M16.5 7.5h.01" />
    </svg>
  );
}

export function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

type Social = {
  href: string;
  label: string;
  icon: (p: { className?: string }) => React.ReactElement;
  /** hover text + border + glow color */
  hover: string;
};

const links: Social[] = [
  {
    href: "https://www.instagram.com/promptcraft.web",
    label: "Instagram",
    icon: InstagramIcon,
    hover:
      "hover:text-[#E1306C] hover:border-[#E1306C]/60 hover:shadow-[0_0_18px_-2px_rgba(225,48,108,0.75)]",
  },
  {
    href: "https://www.youtube.com/@PromptCraft-web",
    label: "YouTube",
    icon: YouTubeIcon,
    hover:
      "hover:text-[#FF0033] hover:border-[#FF0033]/60 hover:shadow-[0_0_18px_-2px_rgba(255,0,51,0.75)]",
  },
  {
    href: "https://www.facebook.com/profile.php?id=61592167791120",
    label: "Facebook",
    icon: FacebookIcon,
    hover:
      "hover:text-[#1877F2] hover:border-[#1877F2]/60 hover:shadow-[0_0_18px_-2px_rgba(24,119,242,0.75)]",
  },
  {
    href: "https://www.tiktok.com/@promptcraft.web",
    label: "TikTok",
    icon: TikTokIcon,
    hover:
      "hover:text-[#25F4EE] hover:border-[#25F4EE]/60 hover:shadow-[0_0_18px_-2px_rgba(37,244,238,0.7)]",
  },
];

export function SocialLinks({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {links.map(({ href, label, icon: Icon, hover }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={`group inline-flex items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 ${sizeClasses[size]} ${hover}`}
        >
          <Icon className={`${iconSizes[size]} transition-transform duration-300 group-hover:scale-110`} />
        </a>
      ))}
    </div>
  );
}
