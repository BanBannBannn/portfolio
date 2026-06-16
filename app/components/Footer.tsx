export default function Footer() {
  return (
    <footer style={{
      padding: '30px clamp(20px,6vw,120px)',
      borderTop: '1px solid var(--border)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: '.82rem', color: 'var(--muted)', flexWrap: 'wrap', gap: 12,
    }}>
      <span>© 2026 <strong style={{ color: 'var(--navy)' }}>Trần Văn Gia Bân</strong>. Built with Next.js.</span>
      <span>Thu Duc, Ho Chi Minh City · Vietnam 🇻🇳</span>
    </footer>
  );
}
