import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Trần Văn Gia Bân — Software & AI Engineer';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#fbfbfa',
          color: '#111113',
          padding: '96px',
        }}
      >
        <div style={{ display: 'flex', fontSize: 84, fontWeight: 700, letterSpacing: '-0.03em' }}>
          Trần Văn Gia Bân
        </div>
        <div style={{ display: 'flex', fontSize: 40, color: '#64646b', marginTop: 16 }}>
          Software &amp; AI Engineer · Ho Chi Minh City
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#34343a', marginTop: 56 }}>
          ASP.NET Core · Spring Boot · FastAPI · NestJS · RAG with Qdrant
        </div>
      </div>
    ),
    size
  );
}
