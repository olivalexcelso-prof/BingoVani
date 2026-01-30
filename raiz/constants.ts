
import { SystemConfig } from './types';

export const ADMIN_CREDENTIALS = {
  user: 'admin',
  pass: '132435B'
};

export const INITIAL_CONFIG: SystemConfig = {
  pixKey: '000.000.000-00',
  withdrawalWhatsapp: '(00) 00000-0000',
  bonusValue: 5.00,
  prices: {
    A: 10.00,
    B: 20.00,
    C: 50.00
  },
  prizesPercentage: {
    Quadra: 10,
    Linha: 20,
    Bingo: 50,
    Acumulado: 20
  },
  drawInterval: 10, // seconds
  bgImages: {
    login: 'https://picsum.photos/1920/1080?random=1',
    bingo: 'https://picsum.photos/1920/1080?random=2',
    profile: 'https://picsum.photos/1920/1080?random=3',
    admin: 'https://picsum.photos/1920/1080?random=4'
  }
};

export const BINGO_RANGE = 75;
