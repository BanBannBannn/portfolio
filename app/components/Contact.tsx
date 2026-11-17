const rows = [
  { k: 'Email', href: 'mailto:tranvangiaban@gmail.com', label: 'tranvangiaban@gmail.com' },
  { k: 'Phone', href: 'tel:+84967174978', label: '+84 967 174 978' },
  { k: 'GitHub', href: 'https://github.com/BanBannBannn', label: 'github.com/BanBannBannn' },
  { k: 'LinkedIn', href: 'https://www.linkedin.com/in/bantrandev/', label: 'linkedin.com/in/bantrandev' },
];

export default function Contact() {
  return (
    <section id="contact" className="section" aria-labelledby="contact-h">
      <div className="wrap section-inner">
        <h2 className="h2" id="contact-h">Contact</h2>

        <div>
          <div className="prose">
            <p>
              Looking for a full-time backend role, on-site in Ho Chi Minh City or remote (UTC+7).
              Email is the fastest way to reach me.
            </p>
          </div>

          <ul className="contact-list">
            {rows.map(({ k, href, label }) => {
              const external = href.startsWith('http');
              return (
                <li key={k}>
                  <span className="k">{k}</span>
                  <a
                    href={href}
                    className="a"
                    {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
