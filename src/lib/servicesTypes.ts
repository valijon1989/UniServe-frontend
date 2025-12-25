export type ServiceCategoryNode = {
  slug: string;
  name: string;
  children?: ServiceCategoryNode[];
};

export type ServiceProvider = {
  id: string;
  name: string;
  avatarUrl?: string;
  verified?: boolean;
};

export type ServiceStats = {
  views: number;
  likes: number;
  saves: number;
  rating: number;
  ratingCount: number;
};

export type ServiceListItem = {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  coverType?: "image" | "video";
  priceLabel: string;
  tags?: string[];
  certificates?: string[];
  provider: ServiceProvider;
  stats: ServiceStats;
  liked: boolean;
  saved: boolean;
  createdAt?: string;
  category?: string;
  subCategory?: string;
};
