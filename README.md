# Personal Portfolio

A modern, responsive personal portfolio website built with [Next.js](https://nextjs.org/) and deployed on Vercel. This project showcases my projects, skills, and professional experience with a clean and interactive user interface.

## 🚀 Features

- **Next.js App Router**: Utilizing the latest Next.js features for optimized routing and server components.
- **Responsive Design**: Flawless experience across all devices (Desktop, Tablet, Mobile).
- **Modern UI/UX**: Clean aesthetic, smooth animations, and interactive elements.
- **SEO Optimized**: Fully optimized for search engines to ensure maximum visibility.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: Custom CSS / Tailwind CSS (Optional based on configuration)
- **Deployment**: [Vercel](https://vercel.com/)

## 💻 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js 22 or later (CI runs on Node 24)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   # or yarn install
   # or pnpm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or yarn dev
   # or pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ✅ Tests and CI

```bash
npm test        # Vitest: rate limiter + the /api/chat route against a local stand-in for the OpenRouter API
npm run lint
npm run build   # also type-checks
```

The route tests need no API key or network: they start a small fake chat
completions API and point the real client (`lib/chat/openrouter.ts`) at it.

GitHub Actions (`.github/workflows/ci.yml`) runs lint, tests and build on every pull
request and every push to `main`. Deploys are done by Vercel's Git integration.

## 📂 Project Structure

- `/app`: Contains the main pages and routing logic (Next.js App Router).
- `/app/api/chat`: the "Ask AI about me" endpoint (setup guide: `docs/chat-setup.md`).
- `/lib`: server helpers such as the rate limiter.
- `/content/profile.md`: the only source the chat answers from.
- `/public`: Static assets such as images and icons.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
