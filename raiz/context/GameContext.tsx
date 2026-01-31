
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
    acumulado: number;
    lucro: number;
    doacoes: number;
  };
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado de Usuários
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userCards, setUserCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Estado do Motor
  const [gameState, setGameState] = useState<GameState>(() => engine.getState());

  // Configurações Administrativas
  const [adminConfig, setAdminConfig] = useState({
    pixKey: 'admin@pix.com',
    withdrawWhatsapp: '+5511999999999',
    bonusAmount: 10.0,
    bgLogin: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=80&w=1920',
    bgRoom: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe1?q=80&w=1920',
    bgOpacity: 0.4,
    donationInstitution: 'APAE Brasil',
    fakeNames: 'Ricardo, Betina, Enzo, Valentina, Carlos, Maria, Joao, Fernanda, Roberto, Aline'
  });

  const [seriesConfigs, setSeriesConfigs] = useState<SeriesConfig[]>([
    { id: 'A', name: 'Série Bronze', price: 3, quantity: 1 },
    { id: 'B', name: 'Série Prata', price: 12, quantity: 5 },
    { id: 'C', name: 'Série Ouro', price: 20, quantity: 10 },
  ]);

  const [autoSchedule, setAutoSchedule] = useState<AutoScheduleConfig>({
    firstGameTime: '08:00',
    intervalMinutes: 15,
    seriesPrice: 3.0,
    lastGameTime: '23:55',
    isEnabled: true
  });
  
  const [manualGames, setManualGames] = useState<ScheduledGame[]>([]);

  // Monitoramento Financeiro (Calculado dinamicamente das transações)
  const financials = useMemo(() => {
    const bruto = transactions.filter(t => t.type === 'PURCHASE').reduce((acc, t) => acc + t.amount, 0);
    const pagos = transactions.filter(t => t.type === 'PRIZE').reduce((acc, t) => acc + t.amount, 0);
    const bonus = transactions.filter(t => t.type === 'BONUS').reduce((acc, t) => acc + t.amount, 0);
    const doacoes = bruto * 0.05; // 5% fixo para doações de bots/fakes
    const lucro = bruto - pagos - bonus - doacoes;
    
    return { bruto, pagos, acumulado: bruto * 0.2, lucro, doacoes };
  }, [transactions]);

  // Efeitos do Motor
  useEffect(() => {
    const unsub = engine.subscribe(setGameState);
    return unsub;
  }, []);

  // Agenda
  const fullSchedule = useMemo(() => {
    let schedule: ScheduledGame[] = [...manualGames];
    if (autoSchedule.isEnabled) {
      const start = new Date();
      const [sh, sm] = autoSchedule.firstGameTime.split(':').map(Number);
      start.setHours(sh, sm, 0, 0);
      const end = new Date();
      const [eh, em] = autoSchedule.lastGameTime.split(':').map(Number);
      end.setHours(eh, em, 0, 0);
      let current = new Date(start);
      while (current <= end) {
        const timeStr = current.getHours().toString().padStart(2, '0') + ':' + current.getMinutes().toString().padStart(2, '0');
        if (!manualGames.some(m => m.time === timeStr)) {
          schedule.push({ id: `auto-${timeStr}`, time: timeStr, price: autoSchedule.seriesPrice, isManual: false });
        }
        current.setMinutes(current.getMinutes() + autoSchedule.intervalMinutes);
      }
    }
    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  }, [autoSchedule, manualGames]);

  // Autenticação
  const register = async (data: any) => {
    // Fixed: the password property is now correctly handled in the User interface definition in types.ts
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: data.fullName,
      whatsapp: data.whatsapp,
      cpf: data.cpf,
      balance: adminConfig.bonusAmount,
      isAdmin: false,
      password: data.password // Em app real, não salvar texto puro
    };
    setUsers(prev => [...prev, newUser]);
    setTransactions(prev => [...prev, {
      id: Math.random().toString(),
      userId: newUser.id,
      type: 'BONUS',
      amount: adminConfig.bonusAmount,
      description: 'Bônus de Cadastro',
      status: 'COMPLETED',
      date: new Date().toISOString()
    }]);
    setUser(newUser);
    return true;
  };

  const login = async (whatsapp: string, pass: string) => {
    const found = users.find(u => u.whatsapp === whatsapp && u.password === pass);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const adminLogin = async (pass: string) => {
    if (pass === 'admin123') {
      setUser({ id: 'admin', username: 'Super Admin', whatsapp: 'admin', cpf: '000', balance: 0, isAdmin: true });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setUserCards([]);
  };

  const buySeries = async (seriesId: string) => {
    const config = seriesConfigs.find(c => c.id === seriesId);
    if (!config || !user || user.balance < config.price) return false;

    const newBalance = user.balance - config.price;
    setUser({ ...user, balance: newBalance });
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, balance: newBalance } : u));
    
    setTransactions(prev => [...prev, {
      id: Math.random().toString(),
      userId: user.id,
      type: 'PURCHASE',
      amount: config.price,
      description: `Compra Série ${seriesId}`,
      status: 'COMPLETED',
      date: new Date().toISOString()
    }]);

    const newCards: Card[] = Array.from({ length: config.quantity }, (_, i) => ({
      id: Math.random().toString(36).substr(2, 5).toUpperCase(),
      userId: user.id,
      numbers: Array.from({ length: 3 }, () => Array.from({ length: 9 }, () => Math.floor(Math.random() * 90) + 1)),
      marked: []
    }));
    setUserCards(prev => [...prev, ...newCards]);
    return true;
  };

  const generateFakes = () => {
    const names = adminConfig.fakeNames.split(',').map(n => n.trim());
    const fakes = names.map((n, i) => ({
      id: `bot-${i}`,
      username: n,
      whatsapp: 'Bot System',
      cpf: '000',
      balance: 1000,
      isAdmin: false,
      isFake: true
    }));
    setUsers(prev => [...prev.filter(u => !u.isFake), ...fakes]);
  };

  const value = {
    user, users, gameState, login, adminLogin, register, logout, buySeries, deposit: () => {}, withdraw: async () => true,
    userCards, transactions, adminConfig, ranking: [], updateAdminConfig: (k: string, v: any) => setAdminConfig(p => ({...p, [k]: v})),
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
