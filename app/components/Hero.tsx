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
            <p className="role"><span>Backend Engineer</span> · <span>Ho Chi Minh City</span></p>
          </div>
        </div>

        <p className="intro">
          I build <strong>APIs, data models and the services behind them</strong>, in Spring Boot,
          ASP.NET Core, FastAPI and NestJS. Most recently at HANEXT Technology, where a lot of
          the work was retrieval: RAG pipelines on Qdrant and agent logic in Python.
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
