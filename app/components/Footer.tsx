export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="wrap">
        <span>© {year} Trần Văn Gia Bân</span>
        <a
          href="https://github.com/BanBannBannn/portfolio"
          className="a"
          target="_blank"
          rel="noreferrer"
        >
          Source of this site<span className="arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    </footer>
  );
}
