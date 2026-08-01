import Image from 'next/image';
import Reveal from './Reveal';

export default function About() {
  return (
    <section id="about" className="section">
      <div className="wrap cols">
        <p className="eyebrow">About</p>

        <Reveal>
          <figure className="about-figure">
            <Image
              src="/portrait.jpg"
              alt="Trần Văn Gia Bân"
              width={480}
              height={600}
              className="portrait"
              priority
            />
            <figcaption>Thủ Đức, Ho Chi Minh City</figcaption>
          </figure>

          <div className="prose">
            <p>
              I started on ASP.NET Core during my capstone — a warehouse management system that
              had to handle real roles, real permissions and a real deploy pipeline. That project
              taught me more about designing an API than any tutorial did.
            </p>
            <p>
              At <strong>HANEXT Technology</strong> I work with whatever the project needs: Spring
              Boot, FastAPI or NestJS on the backend, Angular or Next.js when the frontend is short
              a pair of hands. Lately a lot of it has been retrieval work — wiring Qdrant into RAG
              pipelines and writing agent logic in Python.
            </p>
            <p>
              I pick the database to fit the problem rather than the résumé: PostgreSQL and SQL
              Server when the data has shape, MongoDB when it doesn&apos;t, Qdrant when it needs to
              be searched by meaning.
            </p>
            <p>
              Outside work I keep a few side projects running — a games PWA, a restaurant SaaS, a
              set of browser dev tools — mostly as an excuse to try things I don&apos;t get to try
              at the office.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
