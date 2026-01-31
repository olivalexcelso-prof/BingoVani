
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, GameState, GameStatus, Transaction, Card, ScheduledGame, AutoScheduleConfig, SeriesConfig } from '../types';
import { engine } from '../services/GameEngine';

interface GameContextType {
  user: User | null;
  users: User[];
  gameState: GameState;
  login: (whatsapp: string, pass: string) => Promise<boolean>;
  adminLogin: (pass: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  buySeries: (seriesId: string) => Promise<boolean>;
  deposit: (amount: number) => void;
  withdraw: (amount: number, pix: string) => Promise<boolean>;
  userCards: Card[];
  transactions: Transaction[];
  adminConfig: any;
  updateAdminConfig: (key: string, value: any) => void;
  ranking: any[];
  generateFakes: () => void;
  updateUserBalance: (userId: string, newBalance: number) => void;
  seriesConfigs: SeriesConfig[];
  updateSeriesConfig: (id: string, field: string, value: any) => void;
  autoSchedule: AutoScheduleConfig;
  manualGames: ScheduledGame[];
  updateAutoSchedule: (config: AutoScheduleConfig) => void;
  addManualGame: (game: { time: string; price: number }) => void;
  removeManualGame: (id: string) => void;
  fullSchedule: ScheduledGame[];
  updateGameStatePrizes: (prizes: any) => void;
  financials: {
    bruto: number;
    pagos: number;
    lucro: number;
    doacoes: number;
  };
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const KEYS = {
  USERS: 'bingo_pro_users',
  TRANS: 'bingo_pro_trans',
  CONFIG: 'bingo_pro_config',
  SERIES: 'bingo_pro_series'
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'));
  const [transactions, setTransactions] = useState<Transaction[]>(() => JSON.parse(localStorage.getItem(KEYS.TRANS) || '[]'));
  const [adminConfig, setAdminConfig] = useState(() => JSON.parse(localStorage.getItem(KEYS.CONFIG) || JSON.stringify({
    pixKey: 'financeiro@bingo.com',
    withdrawWhatsapp: '+5511999999999',
    bonusAmount: 20.0,
    bgLogin: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=80&w=1920',
    bgRoom: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe1?q=80&w=1920',
    bgOpacity: 0.5,
    donationInstitution: 'Lar dos Idosos Esperança',
    fakeNames: 'Enzo, Valentina, Ricardo, Maria, Joao, Betina, Carlos, Fernanda, Roberto, Aline'
  })));

  const [seriesConfigs, setSeriesConfigs] = useState<SeriesConfig[]>(() => JSON.parse(localStorage.getItem(KEYS.SERIES) || JSON.stringify([
    { id: 'A', name: 'Série Bronze', price: 3, quantity: 1 },
    { id: 'B', name: 'Série Prata', price: 12, quantity: 5 },
    { id: 'C', name: 'Série Ouro', price: 20, quantity: 10 },
  ])));

  const [user, setUser] = useState<User | null>(null);
  const [userCards, setUserCards] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>(() => engine.getState());
  const [autoSchedule, setAutoSchedule] = useState<AutoScheduleConfig>({
    firstGameTime: '08:00', intervalMinutes: 15, seriesPrice: 3.0, lastGameTime: '23:55', isEnabled: true
  });
  const [manualGames, setManualGames] = useState<ScheduledGame[]>([]);

  // Sync LocalStorage
  useEffect(() => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(KEYS.TRANS, JSON.stringify(transactions));
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(adminConfig));
    localStorage.setItem(KEYS.SERIES, JSON.stringify(seriesConfigs));
  }, [users, transactions, adminConfig, seriesConfigs]);

  useEffect(() => engine.subscribe(setGameState), []);

  const financials = useMemo(() => {
    const bruto = transactions.filter(t => t.type === 'PURCHASE').reduce((a, b) => a + b.amount, 0);
    const pagos = transactions.filter(t => t.type === 'PRIZE').reduce((a, b) => a + b.amount, 0);
    const doacoes = bruto * 0.05;
    return { bruto, pagos, doacoes, lucro: bruto - pagos - doacoes };
  }, [transactions]);

  const fullSchedule = useMemo(() => {
    let sched: ScheduledGame[] = [...manualGames];
    if (autoSchedule.isEnabled) {
      const start = new Date();
      const [sh, sm] = autoSchedule.firstGameTime.split(':').map(Number);
      start.setHours(sh, sm, 0, 0);
      const end = new Date();
      const [eh, em] = autoSchedule.lastGameTime.split(':').map(Number);
      end.setHours(eh, em, 0, 0);
      let curr = new Date(start);
      while (curr <= end) {
        const time = curr.getHours().toString().padStart(2, '0') + ':' + curr.getMinutes().toString().padStart(2, '0');
        sched.push({ id: `auto-${time}`, time, price: autoSchedule.seriesPrice, isManual: false });
        curr.setMinutes(curr.getMinutes() + autoSchedule.intervalMinutes);
      }
    }
    return sched.sort((a, b) => a.time.localeCompare(b.time));
  }, [autoSchedule, manualGames]);

  const register = async (data: any) => {
    if (users.find(u => u.whatsapp === data.whatsapp)) return false;
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: data.fullName,
      whatsapp: data.whatsapp,
      cpf: data.cpf,
      balance: adminConfig.bonusAmount,
      isAdmin: false,
      password: data.password
    };
    setUsers(p => [...p, newUser]);
    setTransactions(p => [...p, { id: Math.random().toString(), userId: newUser.id, type: 'BONUS', amount: adminConfig.bonusAmount, description: 'Bônus Cadastro', status: 'COMPLETED', date: new Date().toISOString() }]);
    setUser(newUser);
    return true;
  };

  const login = async (w: string, p: string) => {
    const found = users.find(u => u.whatsapp === w && u.password === p);
    if (found) { setUser(found); return true; }
    return false;
  };

  const adminLogin = async (p: string) => {
    if (p === 'admin123') {
      setUser({ id: 'admin', username: 'Diretoria', whatsapp: 'admin', cpf: '000', balance: 0, isAdmin: true });
      return true;
    }
    return false;
  };

  const deposit = (amount: number) => {
    if (!user) return;
    const newBal = user.balance + amount;
    const updatedUser = { ...user, balance: newBal };
    setUser(updatedUser);
    setUsers(p => p.map(u => u.id === user.id ? updatedUser : u));
    setTransactions(p => [...p, {
      id: Math.random().toString(),
      userId: user.id,
      type: 'DEPOSIT',
      amount: amount,
      description: 'Depósito via PIX',
      status: 'COMPLETED',
      date: new Date().toISOString()
    }]);
  };

  const buySeries = async (id: string) => {
    const cfg = seriesConfigs.find(c => c.id === id);
    if (!cfg || !user || user.balance < cfg.price) return false;
    
    const newBal = user.balance - cfg.price;
    const updatedUser = { ...user, balance: newBal };
    setUser(updatedUser);
    setUsers(p => p.map(u => u.id === user.id ? updatedUser : u));
    setTransactions(p => [...p, { 
      id: Math.random().toString(), 
      userId: user.id, 
      type: 'PURCHASE', 
      amount: cfg.price, 
      description: `Série ${id} (${cfg.quantity} cartelas)`, 
      status: 'COMPLETED', 
      date: new Date().toISOString() 
    }]);
    
    const newCards: Card[] = Array.from({ length: cfg.quantity }, () => ({
      id: Math.random().toString(36).substr(2, 5).toUpperCase(),
      userId: user.id,
      numbers: Array.from({ length: 3 }, () => {
          const row: number[] = [];
          const used = new Set<number>();
          while(row.length < 9) {
              const n = Math.floor(Math.random() * 90) + 1;
              if(!used.has(n)) {
                  row.push(n);
                  used.add(n);
              }
          }
          return row.sort((a,b) => a-b);
      }),
      marked: []
    }));
    setUserCards(p => [...p, ...newCards]);
    return true;
  };

  const generateFakes = () => {
    const names = adminConfig.fakeNames.split(',').map((n: string) => n.trim());
    const fakes = names.map((n, i) => ({ id: `bot-${i}`, username: n, whatsapp: 'Sistema', cpf: '000', balance: 1000, isAdmin: false, isFake: true }));
    setUsers(p => [...p.filter(u => !u.isFake), ...fakes]);
  };

  const value = {
    user, users, gameState, login, adminLogin, register, logout: () => setUser(null), buySeries, 
    deposit, withdraw: async () => true, userCards, transactions, adminConfig, ranking: [], 
    updateAdminConfig: (k: string, v: any) => setAdminConfig((p: any) => ({...p, [k]: v})),
    generateFakes, updateUserBalance: (id: string, b: number) => setUsers(p => p.map(u => u.id === id ? {...u, balance: b} : u)),
    seriesConfigs, updateSeriesConfig: (id: string, f: string, v: any) => setSeriesConfigs(p => p.map(c => c.id === id ? {...c, [f]: v} : c)),
    autoSchedule, manualGames, updateAutoSchedule: setAutoSchedule, addManualGame: (g: any) => setManualGames(p => [...p, {...g, id: Math.random().toString(), isManual: true}]),
    removeManualGame: (id: string) => setManualGames(p => p.filter(x => x.id !== id)),
    fullSchedule, updateGameStatePrizes: (prizes: any) => engine.updatePrizes(prizes),
    financials
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame error');
  return context;
};
