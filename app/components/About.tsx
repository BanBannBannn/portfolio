export default function About() {
  return (
    <section id="about" className="section" aria-labelledby="about-h">
      <div className="wrap section-inner">
        <h2 className="h2" id="about-h">About</h2>

        <div className="prose">
          <p>
            I started on ASP.NET Core with my capstone, a warehouse system that had to handle real
            roles, real permissions and a real deploy pipeline. It taught me more about API design
            than any tutorial did.
          </p>
          <p>
            Since then I&apos;ve worked across whatever the project needed: Spring Boot, FastAPI or
            NestJS on the backend, Angular or Next.js when the frontend was short a pair of hands.
            I pick the datastore to fit the problem: PostgreSQL or SQL Server when the data has
            shape, MongoDB when it doesn&apos;t, Qdrant when it needs to be searched by meaning.
          </p>
        </div>
      </div>
    </section>
  );
}
