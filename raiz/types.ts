
export interface User {
  id: string;
  username: string;
  fullName?: string;
  whatsapp: string;
  cpf: string;
  balance: number;
  isAdmin: boolean;
  isFake?: boolean;
  bonusClaimed?: boolean;
  // password property is required for the prototype's local authentication flow
  password?: string;
}

export interface Card {
  id: string;
  userId: string;
  numbers: number[][]; // 3x9 grid
  marked: number[];
}

export enum GameStatus {
  SCHEDULED = 'SCHEDULED',
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export interface ScheduledGame {
  id: string;
  time: string; // HH:mm
  price: number;
  isManual: boolean;
}

export interface AutoScheduleConfig {
  firstGameTime: string;
  intervalMinutes: number;
  seriesPrice: number;
  lastGameTime: string;
  isEnabled: boolean;
}

export interface GameState {
  status: GameStatus;
  drawnNumbers: number[];
  currentBall: number | null;
  prizes: {
    quadra: number;
    linha: number;
    bingo: number;
    acumulado: number;
  };
  currentPrizeType: 'QUADRA' | 'LINHA' | 'BINGO' | 'ACUMULADO';
  ballCount: number;
  nextGameTime: string | null;
  currentSeriesPrice: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'PURCHASE' | 'PRIZE' | 'BONUS';
  amount: number;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  date: string;
}

export interface SeriesConfig {
  id: 'A' | 'B' | 'C';
  name: string;
  price: number;
  quantity: number;
}
