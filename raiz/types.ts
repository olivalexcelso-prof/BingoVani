
export enum GameStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  FINISHED = 'finished',
  CANCELLED = 'cancelled'
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  PURCHASE = 'purchase',
  PRIZE = 'prize',
  BONUS = 'bonus'
}

export enum PrizeType {
  QUADRA = 'Quadra',
  LINHA = 'Linha',
  BINGO = 'Bingo',
  ACUMULADO = 'Acumulado'
}

export interface User {
  id: string;
  username: string;
  cpf: string;
  whatsapp: string;
  balance: number;
  isAdmin: boolean;
  isFake: boolean;
  bonusClaimed: boolean;
}

export interface Game {
  id: string;
  gameNumber: number;
  scheduledTime: number;
  startTime?: number;
  endTime?: number;
  seriesPrice: number;
  status: GameStatus;
  drawnNumbers: number[];
  prizes: {
    [key in PrizeType]: number;
  };
  winners: {
    [key in PrizeType]?: string[];
  };
}

export interface Card {
  id: string;
  userId: string;
  gameId: string;
  numbers: number[][]; // 5x5 grid
  marked: boolean[][];
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: number;
}

export interface SystemConfig {
  pixKey: string;
  withdrawalWhatsapp: string;
  bonusValue: number;
  prices: {
    A: number;
    B: number;
    C: number;
  };
  prizesPercentage: {
    Quadra: number;
    Linha: number;
    Bingo: number;
    Acumulado: number;
  };
  drawInterval: number;
  bgImages: {
    login: string;
    bingo: string;
    profile: string;
    admin: string;
  };
}
