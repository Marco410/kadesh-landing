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
  | "enabled"
  | "balance"
  | "lifetimeEarned"
  | "level"
  | "toNextLevel"
  | "streakWeeks"
  | "streakActiveThisWeek"
  | "rankingHidden"
  | "rank"
>;
export type MyPawsSummaryResponse = { myPaws: MyPawsSummary | null };

export type PawLeaderboardPeriod = "month" | "all_time";

/** Una fila del ranking público. Nombre con inicial, foto y enlace al perfil: nunca contacto ni id de la cuenta. */
export type PawLeaderboardEntry = {
  rank: number;
  /** Nombre e inicial del apellido («Marco C.»). */
  name: string;
  /** Para el enlace a `/u/<username>`; `null` si la persona apagó su perfil público. */
  username: string | null;
  avatarUrl: string | null;
  /** Huellitas del periodo (del mes o de siempre). */
  points: number;
  streakWeeks: number;
  level: Pick<PawLevelInfo, "level" | "key" | "label">;
};
