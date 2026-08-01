import Reveal from './Reveal';

const elsewhere = [
  { href: 'tel:+84967174978', label: '+84 967 174 978' },
  { href: 'https://github.com/BanBannBannn', label: 'GitHub' },
  { href: 'https://www.linkedin.com/in/bantrandev/', label: 'LinkedIn' },
];

export default function Contact() {
  return (
    <section id="contact" className="section">
      <div className="wrap cols">
        <p className="eyebrow">Contact</p>

        <Reveal>
          <div>
            <a href="mailto:tranvangiaban@gmail.com" className="mailto">
              tranvangiaban@gmail.com
            </a>

            <div className="prose">
              <p>
                I&apos;m looking for a fulltime backend role. If you have one — or a project, or
                just a question about something on this page — email is the fastest way to reach
                me. I read everything.
              </p>
            </div>

            <div className="inline-links" style={{ marginTop: 24 }}>
              {elsewhere.map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="link"
                  {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {label} ↗
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
