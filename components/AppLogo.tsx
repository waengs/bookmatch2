import Image from 'next/image';
import Link from 'next/link';

interface AppLogoProps {
  className?: string;
  href?: string;
  priority?: boolean;
}

export default function AppLogo({ className = '', href = '/', priority = false }: AppLogoProps) {
  const img = (
    <Image
      src="/bookmatch2_logo.png"
      alt="BookMatch"
      width={280}
      height={80}
      className={`app-logo${className ? ` ${className}` : ''}`}
      priority={priority}
    />
  );

  if (href) {
    return (
      <Link href={href} className="app-logo-link" aria-label="BookMatch home">
        {img}
      </Link>
    );
  }

  return img;
}
