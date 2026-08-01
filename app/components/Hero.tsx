const LINKS = [
  { href: 'mailto:tranvangiaban@gmail.com', label: 'tranvangiaban@gmail.com' },
  { href: 'https://github.com/BanBannBannn', label: 'GitHub' },
  { href: 'https://www.linkedin.com/in/bantrandev/', label: 'LinkedIn' },
  { href: '/cv-TranVanGiaBan.pdf', label: 'CV (PDF)', download: true },
];

export default function Hero() {
  return (
    <header id="top" className="wrap hero">
      <p className="eyebrow" style={{ marginBottom: 28 }}>
        Software Engineer · Ho Chi Minh City
      </p>

      <h1>
        I build backend services — APIs, data models, and the <em>plumbing</em> behind them.
      </h1>

      <p className="lead">
        Two years of it, most recently at HANEXT Technology, where I ship REST and GraphQL
        APIs in Spring Boot, FastAPI and NestJS. I&apos;m looking for a fulltime backend role.
      </p>

      <div className="inline-links">
        {LINKS.map(({ href, label, download }) => (
          <a
            key={label}
            href={href}
            className="link"
            {...(download
              ? { download: 'cv-TranVanGiaBan.pdf' }
              : href.startsWith('http')
                ? { target: '_blank', rel: 'noreferrer' }
                : {})}
          >
            {label} ↗
          </a>
        ))}
      </div>
    </header>
  );
}
