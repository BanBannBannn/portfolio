import Image from 'next/image';

const links = [
  { href: 'https://github.com/BanBannBannn', label: 'GitHub' },
  { href: 'https://www.linkedin.com/in/bantrandev/', label: 'LinkedIn' },
];

export default function Hero() {
  return (
    <header id="top" className="top">
      <div className="wrap">
        <div className="id">
          <Image
            src="/portrait.jpg"
            alt=""
            width={144}
            height={144}
            className="avatar"
            priority
          />
          <div>
            <h1 className="name">Trần Văn Gia Bân</h1>
            <p className="role"><span>Software &amp; AI Engineer</span> · <span>Ho Chi Minh City</span></p>
          </div>
        </div>

        <p className="intro">
          I&apos;m a software engineer and an AI engineer. I build{' '}
          <strong>APIs, data models and the services behind them</strong>, in ASP.NET Core, Spring
          Boot, FastAPI and NestJS, and the AI that sits on top: RAG pipelines on Qdrant, agent
          logic in Python. Now an AI engineer trainee at VinSmart Future, working on .NET
          microservices and an Angular frontend.
        </p>

        <p className="status">
          <span className="dot" aria-hidden="true" />
          Open to full-time backend roles, on-site in Ho Chi Minh City or remote.
        </p>

        <div className="actions">
          <a href="mailto:tranvangiaban@gmail.com" className="btn">Email me</a>
          <a href="/cv-TranVanGiaBan.pdf" download="cv-TranVanGiaBan.pdf" className="a">
            Download CV
          </a>
          {links.map(({ href, label }) => (
            <a key={label} href={href} className="a" target="_blank" rel="noreferrer">
              {label}<span className="arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
