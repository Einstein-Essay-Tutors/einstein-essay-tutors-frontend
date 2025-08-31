import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Einstein Essay Tutors';
    const description = searchParams.get('description') || 'Professional Academic Writing Services';
    const type = searchParams.get('type') || 'default';

    // Define color scheme
    const primaryColor = '#3b82f6';
    const secondaryColor = '#1e40af';
    const backgroundColor = '#f8fafc';
    const textColor = '#1f2937';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: backgroundColor,
            backgroundImage: `linear-gradient(135deg, ${backgroundColor} 0%, #e0f2fe 50%, #f1f5f9 100%)`,
            padding: '60px',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `radial-gradient(circle at 25% 25%, ${primaryColor}20 0%, transparent 50%), radial-gradient(circle at 75% 75%, ${secondaryColor}15 0%, transparent 50%)`,
            }}
          />

          {/* Main Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '1000px',
              textAlign: 'center',
              zIndex: 10,
            }}
          >
            {/* Logo/Brand Section */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '40px',
                backgroundColor: 'white',
                padding: '20px 40px',
                borderRadius: '20px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: `3px solid ${primaryColor}20`,
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: primaryColor,
                  borderRadius: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                }}
              >
                <span
                  style={{
                    color: 'white',
                    fontSize: '28px',
                    fontWeight: 'bold',
                  }}
                >
                  E
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: textColor,
                    lineHeight: 1.2,
                  }}
                >
                  Einstein Essay Tutors
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    fontWeight: '500',
                  }}
                >
                  Professional Academic Writing
                </span>
              </div>
            </div>

            {/* Main Title */}
            <h1
              style={{
                fontSize: title.length > 50 ? '48px' : '64px',
                fontWeight: 'bold',
                color: textColor,
                lineHeight: 1.1,
                marginBottom: '30px',
                maxWidth: '900px',
                textAlign: 'center',
                background: `linear-gradient(135deg, ${textColor} 0%, ${primaryColor} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {title}
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: '24px',
                color: '#6b7280',
                lineHeight: 1.4,
                maxWidth: '800px',
                marginBottom: '40px',
                textAlign: 'center',
              }}
            >
              {description}
            </p>

            {/* Feature badges based on page type */}
            <div
              style={{
                display: 'flex',
                gap: '15px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {type === 'home' && (
                <>
                  <Badge text="24/7 Support" />
                  <Badge text="Expert Writers" />
                  <Badge text="On-Time Delivery" />
                </>
              )}
              {type === 'services' && (
                <>
                  <Badge text="All Subjects" />
                  <Badge text="Quality Guarantee" />
                  <Badge text="Plagiarism-Free" />
                </>
              )}
              {type === 'about' && (
                <>
                  <Badge text="10,000+ Students" />
                  <Badge text="PhD Writers" />
                  <Badge text="98% Success Rate" />
                </>
              )}
              {type === 'contact' && (
                <>
                  <Badge text="24/7 Available" />
                  <Badge text="Fast Response" />
                  <Badge text="Worldwide" />
                </>
              )}
              {(type === 'default' || type === '404') && (
                <>
                  <Badge text="Academic Excellence" />
                  <Badge text="Trusted Service" />
                </>
              )}
            </div>
          </div>

          {/* Bottom branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              right: '40px',
              display: 'flex',
              alignItems: 'center',
              color: '#9ca3af',
              fontSize: '14px',
            }}
          >
            einsteinessaytutors.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

// Helper component for feature badges
function Badge({ text }: { text: string }) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        color: '#3b82f6',
        padding: '8px 20px',
        borderRadius: '25px',
        fontSize: '16px',
        fontWeight: '600',
        border: '2px solid #3b82f620',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
      }}
    >
      {text}
    </div>
  );
}
