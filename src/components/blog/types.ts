export interface Image {
  url: string;
}

export interface Author {
  name: string;
  profileImage?: {
    url: string;
  } | null;
}

export interface Category {
  name: string;
}

export interface Tag {
  name: string;
}

export interface Content {
  document: any;
}

export interface BlogPost {
  id: string;
  image: Image;
  author: Author;
  category: Category;
  commentsCount: number;
  content: Content;
  createdAt: string;
  excerpt: string;
  post_favoritesCount: number;
  post_likesCount: number;
  publishedAt: string | null;
  tags: Tag[];
  title: string;
  url: string;
}

export interface PostWhereInput {
  [key: string]: any;
}

export interface PostOrderByInput {
  updatedAt?: 'asc' | 'desc' | null;
  publishedAt?: 'asc' | 'desc' | null;
  createdAt?: 'asc' | 'desc' | null;
}

export interface PostsQueryVariables {
  take?: number | null;
  skip?: number | null;
  where?: PostWhereInput | null;
  orderBy?: PostOrderByInput[] | null;
}

export interface PostsQueryResponse {
  posts: BlogPost[];
  postsCount: number;
}

