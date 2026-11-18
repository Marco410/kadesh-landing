export type PawLevelInfo = {
  level: number;
  /** puppy | explorer | guardian | rescuer | hero | legend */
  key: string;
  label: string;
  /** Huellitas acumuladas donde empieza este nivel. */
  from: number;
  /** Donde empieza el siguiente; `null` en el último nivel. */
  nextAt: number | null;
};

export type PawHistoryEntry = {
  id: string;
  action: string;
  /** earn | reversal | adjust | spend */
  kind: string;
  /** Negativo cuando se quitaron o se gastaron. */
  amount: number;
  createdAt: string;
};

export type MyPaws = {
  /** `false` mientras el back tenga las huellitas apagadas. */
  enabled: boolean;
  balance: number;
  lifetimeEarned: number;
  level: PawLevelInfo;
  toNextLevel: number | null;
  streakWeeks: number;
  bestStreakWeeks: number;
  streakActiveThisWeek: boolean;
  rankingHidden: boolean;
  /** Posición en el ranking histórico si está entre los 50 primeros. */
  rank: number | null;
  history: PawHistoryEntry[];
};

export type MyPawsResponse = { myPaws: MyPaws | null };
export type MyPawHistoryResponse = { myPawHistory: PawHistoryEntry[] };
export type SetPawRankingVisibilityResponse = {
  setPawRankingVisibility: { success: boolean; message: string; rankingHidden: boolean | null };
};

export type MyPawsSummary = Pick<
  MyPaws,
  "enabled" | "balance" | "lifetimeEarned" | "level" | "toNextLevel" | "streakWeeks" | "streakActiveThisWeek"
>;
export type MyPawsSummaryResponse = { myPaws: MyPawsSummary | null };
