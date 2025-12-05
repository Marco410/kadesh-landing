import { Metadata } from 'next';
import { Routes } from 'kadesh/core/routes';

interface PostData {
  title: string;
  url: string;
  excerpt?: string | null;
  image?: {
    url: string;
  } | null;
  publishedAt?: string | null;
  author?: {
    name: string;
  } | null;
  category?: {
    name: string;
  } | null;
  tags?: Array<{
    name: string;
  }> | null;
}

async function getPostByUrl(url: string): Promise<PostData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return null;
    }

    const query = `
      query GetPostByUrl($url: String!) {
        posts(where: { url: { equals: $url } }, take: 1) {
          id
          title
          url
          excerpt
          image {
            url
          }
          publishedAt
          author {
            name
          }
          category {
            name
          }
          tags {
            name
          }
        }
      }
    `;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { url },
      }),
      next: { revalidate: 60 }, // Revalidar cada 60 segundos
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.data?.posts?.[0] || null;
  } catch (error) {
    console.error('Error fetching post for metadata:', error);
    return null;
  }
}

function getImageUrl(imageUrl: string | null | undefined): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kadesh.com.mx';
  
  if (!imageUrl) {
    return `${baseUrl}/og-image.png`;
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    return `${baseUrl}${imageUrl}`;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    const apiBase = apiUrl.replace('/api/graphql', '');
    return `${apiBase}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  return `${baseUrl}/${imageUrl}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ url: string }>;
}): Promise<Metadata> {
  const { url } = await params;
  const post = await getPostByUrl(url);

  if (!post) {
    return {
      title: 'Post no encontrado | KADESH Blog',
      description: 'El post que buscas no existe o ha sido eliminado.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kadesh.com.mx';
  const postUrl = `${baseUrl}${Routes.blog.post(post.url)}`;
  const imageUrl = getImageUrl(post.image?.url);
  const description = post.excerpt || `Lee este artículo en el blog de KADESH: ${post.title}`;

  const openGraph: Metadata['openGraph'] = {
    title: post.title,
    description,
    url: postUrl,
    siteName: 'KADESH',
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: post.title,
      },
    ],
    locale: 'es_MX',
    type: 'article',
    ...(post.publishedAt && { publishedTime: post.publishedAt }),
  };

  const metadata: Metadata = {
    title: `${post.title} | KADESH Blog`,
    description,
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [imageUrl],
    },
  };

  if (post.author?.name) {
    metadata.authors = [{ name: post.author.name }];
  }

  if (post.category?.name) {
    metadata.category = post.category.name;
  }

  if (post.tags && post.tags.length > 0) {
    metadata.keywords = post.tags.map((tag) => tag.name);
  }

  return metadata;
}
