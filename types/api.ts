export interface ApiError extends Error {
  status?: number;
  customMessage?: string;
  customCode?: string;
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}
