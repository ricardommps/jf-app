export type ProfileType = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  temporaryPassword: boolean;
  isYoungLife: boolean;
  phone: string;
  createdAt?: string | null;
};

export type UserType = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  temporaryPassword: boolean;
  isYoungLife: boolean;
  phone: string;
  createdAt?: string | null;
};
