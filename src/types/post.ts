export type TPostView = 'gridView' | 'listView';

export interface IPost {
  id: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    dp?: string;
  };
  caption?: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  updatedAt: Date;
}
