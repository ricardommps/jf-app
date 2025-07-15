export type Media = {
  id: number;
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
