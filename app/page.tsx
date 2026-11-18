import Hero       from './components/Hero';
import About      from './components/About';
import Experience from './components/Experience';
import Projects   from './components/Projects';
import Skills     from './components/Skills';
import Contact    from './components/Contact';
import Footer     from './components/Footer';
import Chat       from './components/Chat';

// Re-render every hour so the project "Live" labels follow real health
// checks (lib/health.ts). Must be a literal; keep it equal to HEALTH_REVALIDATE.
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Hero />
      <main id="main">
        <Experience />
        <Projects />
        <Skills />
        <About />
        <Contact />
      </main>
      <Footer />
      <Chat />
    </>
  );
}
