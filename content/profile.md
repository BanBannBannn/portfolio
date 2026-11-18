# Trần Văn Gia Bân — profile for the portfolio chat

This file is the only thing the chat assistant knows. Anything not written here,
it will say it doesn't know. Edit freely; plain Markdown is fine.
To set the pronouns the assistant uses, add a line such as "Pronouns: ..." under Basics.

## Basics

- Full name: Trần Văn Gia Bân (goes by Bân)
- Role: Software Engineer and AI Engineer (backend and AI work, plus Angular frontend)
- Location: Thủ Đức, Ho Chi Minh City, Vietnam (UTC+7)
- Currently: AI Engineer Trainee at VinSmart Future (full-time since 20 Jul 2026)
- Availability: open to full-time backend roles, on-site in Ho Chi Minh City or remote
- Email: tranvangiaban@gmail.com
- Phone: +84 967 174 978
- GitHub: https://github.com/BanBannBannn
- LinkedIn: https://www.linkedin.com/in/bantrandev/

## Experience

### AI Engineer Trainee — VinSmart Future (May 2026 – present)

- Joined as an AI engineer intern in May 2026 and moved to a full-time trainee role on 20 July 2026.
- Currently on an elder-care (nursing home) platform, where the core is built as .NET microservices in C#.
- Builds the Angular frontend for the same platform, so one person can follow a feature from the service to the screen.

### Software Engineer — HANEXT Technology (Sep 2025 – Apr 2026)

- Built and shipped REST and GraphQL APIs across several client projects in Spring Boot, FastAPI and NestJS.
- Wrote the AI backend services in Python: agent logic, plus Qdrant for retrieval-augmented generation.
- Chose and modelled the storage layer per project: PostgreSQL, SQL Server, MongoDB.
- Covered roughly a third of the frontend work in Angular and Next.js when the team needed it.
- Took part in code review and architecture discussions with the senior engineers.
- Client projects are not named because they are not Bân's to disclose.

### Software Engineer Intern — FPT Software (Jan 2024 – Apr 2024)

- Built and tested RESTful APIs in Java Spring Boot for internal projects.
- Worked inside a real team process: branches, reviews, standups, tickets.

## Learning

- Since March 2026, studying AI at VinUni.

## Projects

- **Bàn Tròn** (personal, live at https://bantron.vercel.app/): a realtime collaborative whiteboard with freehand drawing, shapes, rich text, tables, sticky notes and a chat, plus live cursors and presence. Chat, board content and profile data are encrypted with AES-256; no account is needed, a shared link is enough. Runs on Supabase Free and Vercel Hobby with CI/CD and Playwright tests. Next.js 16, Supabase (Postgres, Auth, Realtime, Storage), Tiptap, Tailwind 4. Source: https://github.com/BanBannBannn/ban-tron
- **GameHub** (personal, live at https://gamehub-board.vercel.app/): an offline-first PWA with six board games — chess against Stockfish, xiangqi, gomoku, sudoku, minesweeper, number guessing. Progress is saved to IndexedDB. Next.js, React 19, TypeScript, Zustand. Source: https://github.com/BanBannBannn/gamehub
- **SmartMenuVibe** (personal, live at https://smart-menu-vibe.vercel.app/): a multi-tenant restaurant SaaS with QR ordering, a realtime kitchen board, and dish recommendations based on time of day and weather. Next.js, React 19, Supabase Realtime, Azure Face. Source: https://github.com/BanBannBannn/SmartMenuVibe
- **DevToolBox AI** (personal, live at https://devtoolbox-ai-murex.vercel.app/): twelve in-browser developer tools (JSON formatter, JWT decoder, QR and UUID generators) and a small markdown blog. Next.js 16, React 19, TypeScript, Tailwind. Source: https://github.com/BanBannBannn/devtoolbox-ai
- **WareEase** (university capstone, 4 months, team project): a warehouse management API covering products and batches with expiry dates, stock levels, goods requests, receive/issue/internal transfer notes, stocktakes, adjustments and a dashboard. Layered ASP.NET Core 8 on EF Core and SQL Server, JWT access and refresh tokens in httpOnly cookies, group-based permissions, a Docker image, and GitHub Actions that build and redeploy it. Bân's part: the permission middleware and the endpoints it protects, quantity validation across the request and note flows, and the dashboard figures. Source: https://github.com/ware-ease/we-api
- **Smart Menu** (team project, 4 months): a restaurant menu system that reads a customer's age, gender and mood from a camera photo with AWS Rekognition, then recommends the menu configured for that segment and time of day. Brands subscribe to plans and pay through PayOS; a React admin portal and an Expo mobile app sit on the .NET API, hosted on Azure. Bân's part: menu recommendation, subscription limits and payment confirmation, and the brand dashboard API. SmartMenuVibe later grew out of it. Source: https://github.com/BanBannBannn/SmartMenu

## Skills

- Languages: Java, C#, Python, TypeScript
- Backend: Spring Boot, ASP.NET Core (including .NET microservices), FastAPI, NestJS, REST, GraphQL
- Data: PostgreSQL, SQL Server, MongoDB, Qdrant, EF Core
- AI: RAG pipelines, agent logic, vector search, LLM integration
- Cloud: Azure, AWS (S3, Rekognition), Supabase, Firebase
- Frontend: Angular (current project), Next.js, React
- Practice: API design, JWT auth, CI/CD, Git and code review

## Working style

- Picks the datastore to fit the problem: PostgreSQL or SQL Server when the data has shape, MongoDB when it doesn't, Qdrant when it needs to be searched by meaning.
- Started on ASP.NET Core with the WareEase capstone, which taught API design through real roles, permissions and a deploy pipeline. It is again the day-to-day stack on the current elder-care project at VinSmart Future.
- Believes code is meant to be shared and knowledge belongs to everyone, so open-sources personal projects wherever possible. Every project listed here, including this portfolio site and its AI chat, has public source code (this site: https://github.com/BanBannBannn/portfolio). Most of what Bân knows came from other people's docs, answered issues and open-source libraries; publishing Bân's own work is a way of giving back.
