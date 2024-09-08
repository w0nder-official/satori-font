import { ImageResponse } from '@vercel/og';
import { load } from 'cheerio';

export const config = {
  runtime: 'edge',
};


const scale = (value: number) => value * 3;

let regularFontData: ArrayBuffer | undefined = undefined;
let boldFontData: ArrayBuffer | undefined = undefined;

const getMetaData = (html: string) => {
  const $ = load(html);

  const headTitle = $('head title').text();
  const metaDescription = $('meta[name="description"]').attr('content');

  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDescription = $('meta[property="og:description"]').attr('content');

  const bodyText = $('body').text();
  const articleText = $('body article').text();

  return {
    title: ogTitle || headTitle,
    description: ogDescription || metaDescription || articleText || bodyText,
  };
};

export default async function () {
  const ogImageWidth = scale(400);
  const ogImageHeight = scale(209);

  if (!regularFontData || !boldFontData) {
    const [regularFont, boldFont] = await Promise.all([
      fetch(
        'http://127.0.0.1:3000/fonts/Pretendard/Pretendard-Regular.subset.woff',
      ).then((res) => res.arrayBuffer()),
      fetch(
        'http://127.0.0.1:3000/fonts/Pretendard/Pretendard-Bold.subset.woff',
      ).then((res) => res.arrayBuffer()),
    ]);

    regularFontData = regularFont;
    boldFontData = boldFont;
  }

  const url = 'https://w0nder.land/s/epilogue';
  const htmlRes = await fetch(new URL(url, import.meta.url));
  if (!htmlRes.ok) {
    return new Response(JSON.stringify({ message: `html data is not exist - url - ${url}` }), { status: 404 });
  }

  const html = await htmlRes.text();
  const { title, description } = getMetaData(html);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundColor: '#FFFFFF',
          backgroundImage: 'linear-gradient(to bottom, rgba(219, 203, 255, 0.00) 0%, rgba(219, 203, 255, 0.50) 100%)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: scale(8),
            width: '100%',
            height: '100%',
            padding: scale(16),
          }}
        >
          <div
            style={{
              display: '-webkit-box',
              textAlign: 'left',
              fontSize: scale(14),
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: `${scale(21)}px`,
              width: '100%',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              fontFamily: '"Pretendard"',
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: '-webkit-box',
              textAlign: 'left',
              fontSize: scale(14),
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: `${scale(21)}px`,
              width: '100%',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              fontFamily: '"Pretendard"',
            }}
          >
            {description}
          </div>
        </div>
      </div>
    ),
    {
      width: ogImageWidth,
      height: ogImageHeight,
      headers: {
        'cache-control':
          'public, s-maxage=31536000, stale-if-error=86400, stale-while-revalidate=31536000',
      },
      fonts: [
        {
          name: 'Pretendard',
          data: regularFontData,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Pretendard',
          data: boldFontData,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );
}
