export type ProfileType = {
  user: UserType;
};

export type UserType = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  temporaryPassword: boolean;
  isYoungLife: boolean;
  phone: string;
};
