export type ExtrapolationEntry = {
  VO2: string;
  "800 m": string;
  "1000 m": string;
  "1500 m": string;
  "2km": string;
  "3 km": string;
  "5 km": string;
  "10 km": string;
  "15 km": string;
  "20 km": string;
  "30 km": string;
  "42.1 km": string;
};

export type ExtrapolationMap = {
  [key: number | string]: ExtrapolationEntry;
};
