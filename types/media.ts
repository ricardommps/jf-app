export type Media = {
  id: string;
  mediaId: string;
  userId: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
  instrucctions: string | null;
  blocked: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};
