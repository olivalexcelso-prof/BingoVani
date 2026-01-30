
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  User, Game, Card, Transaction, SystemConfig, 
  GameStatus, TransactionType, PrizeType 
} from './types';
import { INITIAL_CONFIG, ADMIN_CREDENTIALS } from './constants';
import { BingoEngine } from './services/bingoEngine';
import { TTSService } from './services/ttsService';
import { 
  Layout, 
  Trophy, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  DollarSign, 
  Play, 
  Plus, 
  Clock, 
  AlertCircle,
  TrendingUp,
  X,
  CreditCard,
  Copy,
  ChevronRight,
  ChevronLeft,
  Settings2,
  Volume2,
  VolumeX,
  Award
} from 'lucide-react';

// --- MAIN APP COMPONENT ---

export default function App() {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [config, setConfig] = useState<SystemConfig>(INITIAL_CONFIG);
  const [games, setGames] = useState<Game[]>([]);
  const [userCards, setUserCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]); // Simulation of all users
  const [activeTab, setActiveTab] = useState<'bingo' | 'profile' | 'admin'>('bingo');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  // Modals
  const [showPixModal, setShowPixModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Settings
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [cardSize, setCardSize] = useState(1);
  const [ballColor, setBallColor] = useState('#00D084');

  // --- INITIALIZATION ---
  useEffect(() => {
    // Load persisted state or generate mock
    const savedUsers = localStorage.getItem('bingo_users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    else {
      const initialUsers: User[] = [
        { id: '1', username: 'João Silva', cpf: '123.456.789-01', whatsapp: '11999999999', balance: 100, isAdmin: false, isFake: false, bonusClaimed: false },
        { id: 'fake1', username: 'Maria_92', cpf: '000.000.000-00', whatsapp: '00000', balance: 0, isAdmin: false, isFake: true, bonusClaimed: false },
        { id: 'fake2', username: 'BetoBingo', cpf: '000.000.000-00', whatsapp: '00000', balance: 0, isAdmin: false, isFake: true, bonusClaimed: false },
      ];
      setUsers(initialUsers);
      localStorage.setItem('bingo_users', JSON.stringify(initialUsers));
    }
    
    // Create initial game
    const initialGame: Game = {
      id: 'g1',
      gameNumber: 1,
      scheduledTime: Date.now() + 600000, // 10 mins from now
      status: GameStatus.SCHEDULED,
      seriesPrice: 10,
      drawnNumbers: [],
      prizes: { Quadra: 0, Linha: 0, Bingo: 0, Acumulado: 1000 },
      winners: {}
    };
    setGames([initialGame]);
  }, []);

  // Sync users to localStorage
  useEffect(() => {
    if (users.length > 0) localStorage.setItem('bingo_users', JSON.stringify(users));
  }, [users]);

  // --- ACTIONS ---
  
  const handleLogin = (whatsapp: string, pass: string) => {
    const user = users.find(u => u.whatsapp === whatsapp);
    if (user) {
      setCurrentUser(user);
    } else {
      alert("Usuário não encontrado!");
    }
  };

  const handleRegister = (name: string, whatsapp: string, cpf: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: name,
      whatsapp,
      cpf,
      balance: 0,
      isAdmin: false,
      isFake: false,
      bonusClaimed: false
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };

  const handleBonusClaim = () => {
    if (currentUser && !currentUser.bonusClaimed) {
      const updatedUser = { ...currentUser, balance: currentUser.balance + config.bonusValue, bonusClaimed: true };
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setTransactions([{
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        type: TransactionType.BONUS,
        amount: config.bonusValue,
        description: 'Bônus de Boas-vindas',
        status: 'completed',
        createdAt: Date.now()
      }, ...transactions]);
    }
  };

  const buySeries = (series: 'A' | 'B' | 'C') => {
    const price = config.prices[series];
    if (currentUser && currentUser.balance >= price) {
      const updatedUser = { ...currentUser, balance: currentUser.balance - price };
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      
      const game = games.find(g => g.status === GameStatus.SCHEDULED);
      if (game) {
        const newCard = BingoEngine.generateCard(currentUser.id, game.id);
        setUserCards([...userCards, newCard]);
        
        // Update game pool
        const prizePoolInc = price * 0.7; // 70% goes to pool
        setGames(games.map(g => g.id === game.id ? {
          ...g,
          prizes: {
            ...g.prizes,
            Quadra: g.prizes.Quadra + (prizePoolInc * (config.prizesPercentage.Quadra / 100)),
            Linha: g.prizes.Linha + (prizePoolInc * (config.prizesPercentage.Linha / 100)),
            Bingo: g.prizes.Bingo + (prizePoolInc * (config.prizesPercentage.Bingo / 100)),
            Acumulado: g.prizes.Acumulado + (prizePoolInc * (config.prizesPercentage.Acumulado / 100)),
          }
        } : g));
      }
      setShowPurchaseModal(false);
    } else {
      setShowPixModal(true);
    }
  };

  // --- GAME ENGINE ---
  const activeGame = useMemo(() => games.find(g => g.status === GameStatus.ACTIVE || g.status === GameStatus.SCHEDULED), [games]);

  useEffect(() => {
    if (activeGame?.status === GameStatus.ACTIVE) {
      const interval = setInterval(() => {
        setGames(prevGames => {
          const game = prevGames.find(g => g.id === activeGame.id);
          if (!game || game.drawnNumbers.length >= 75) {
            clearInterval(interval);
            return prevGames;
          }

          const nextNum = BingoEngine.drawNumber(game.drawnNumbers);
          TTSService.announceBall(nextNum);
          
          const newDrawn = [...game.drawnNumbers, nextNum];
          
          // Win Detection
          const currentWinners = { ...game.winners };
          const potentialWinners: { [key: string]: string[] } = {};

          // Quadra check
          if (!currentWinners.Quadra) {
            const winners = userCards.filter(c => BingoEngine.checkQuadra(c, newDrawn)).map(c => users.find(u => u.id === c.userId)?.username || 'Unknown');
            if (winners.length > 0) {
              potentialWinners.Quadra = winners;
              TTSService.announceWinner(winners[0], 'Quadra');
            }
          }

          // Linha check
          if (!currentWinners.Linha) {
            const winners = userCards.filter(c => BingoEngine.checkLinha(c, newDrawn)).map(c => users.find(u => u.id === c.userId)?.username || 'Unknown');
            if (winners.length > 0) {
              potentialWinners.Linha = winners;
              TTSService.announceWinner(winners[0], 'Linha');
            }
          }

          // Bingo check
          if (!currentWinners.Bingo) {
            const winners = userCards.filter(c => BingoEngine.checkBingo(c, newDrawn)).map(c => users.find(u => u.id === c.userId)?.username || 'Unknown');
            if (winners.length > 0) {
              potentialWinners.Bingo = winners;
              TTSService.announceWinner(winners[0], 'Bingo');
            }
          }

          return prevGames.map(g => g.id === game.id ? {
            ...g,
            drawnNumbers: newDrawn,
            winners: { ...g.winners, ...potentialWinners },
            status: potentialWinners.Bingo ? GameStatus.FINISHED : g.status
          } : g);
        });
      }, config.drawInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [activeGame?.status, userCards, users, config.drawInterval]);

  // Start Game logic
  const startGame = (id: string) => {
    setGames(games.map(g => g.id === id ? { ...g, status: GameStatus.ACTIVE, startTime: Date.now() } : g));
    TTSService.announceAlert("A partida está começando! Boa sorte a todos.");
  };

  // --- VIEWS ---

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center relative p-4">
        <div className="absolute inset-0 z-0">
          <img src={config.bgImages.login} className="w-full h-full object-cover opacity-50" alt="bg" />
        </div>
        
        <div className="relative z-10 glass w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-emerald-400 mb-2 drop-shadow-md">BINGO MASTER</h1>
            <p className="text-slate-300 text-sm">{authView === 'login' ? 'Entre e comece a ganhar!' : 'Crie sua conta e ganhe bônus!'}</p>
          </div>

          <div className="flex mb-8 bg-slate-800/50 p-1 rounded-xl">
            <button 
              onClick={() => setAuthView('login')}
              className={`flex-1 py-2 rounded-lg transition-all ${authView === 'login' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setAuthView('register')}
              className={`flex-1 py-2 rounded-lg transition-all ${authView === 'register' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Cadastro
            </button>
          </div>

          {authView === 'login' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1 uppercase">WhatsApp</label>
                <input 
                  type="text" 
                  placeholder="(00) 00000-0000"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  onBlur={(e) => handleLogin(e.target.value, '')}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1 uppercase">Senha</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <button 
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  handleLogin(input.value, '');
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95"
              >
                ENTRAR AGORA
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input type="text" placeholder="Nome Completo" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" id="reg-name" />
              <input type="text" placeholder="WhatsApp" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" id="reg-wa" />
              <input type="text" placeholder="CPF" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" id="reg-cpf" />
              <input type="password" placeholder="Senha" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <button 
                onClick={() => {
                  const n = (document.getElementById('reg-name') as HTMLInputElement).value;
                  const w = (document.getElementById('reg-wa') as HTMLInputElement).value;
                  const c = (document.getElementById('reg-cpf') as HTMLInputElement).value;
                  handleRegister(n, w, c);
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
              >
                CADASTRAR
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-xs text-slate-500">
             <span>V 1.0.0</span>
             <button onClick={() => setShowAdminLogin(true)} className="hover:text-slate-300">Admin Panel</button>
          </div>
        </div>

        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-sm border border-slate-700">
               <h2 className="text-2xl font-bold mb-6 text-center">Admin Access</h2>
               <div className="space-y-4">
                  <input type="text" value="admin" readOnly className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 opacity-50" />
                  <input type="password" placeholder="Senha Admin" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3" id="admin-pass" />
                  <button 
                    onClick={() => {
                      const p = (document.getElementById('admin-pass') as HTMLInputElement).value;
                      if (p === ADMIN_CREDENTIALS.pass) {
                        setIsAdminMode(true);
                        setCurrentUser({ id: 'admin', username: 'Administrator', balance: 99999, isAdmin: true, isFake: false, cpf: '000', whatsapp: '000', bonusClaimed: true });
                        setShowAdminLogin(false);
                        setActiveTab('admin');
                      } else alert("Senha incorreta");
                    }}
                    className="w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-xl transition-all"
                  >
                    Acessar Painel
                  </button>
                  <button onClick={() => setShowAdminLogin(false)} className="w-full text-slate-500 py-2">Cancelar</button>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <img src={config.bgImages.bingo} className="w-full h-full object-cover" alt="bg" />
      </div>

      {/* --- HEADER --- */}
      <header className="relative z-20 h-16 glass px-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-1.5 rounded-lg shadow-lg shadow-emerald-500/20">
             <Trophy size={20} className="text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight poppins">BINGO MASTER</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Saldo Atual</span>
            <span className="text-emerald-400 font-bold poppins">R$ {currentUser.balance.toFixed(2)}</span>
          </div>
          
          <div className="h-8 w-[1px] bg-white/10" />

          <button 
            onClick={() => setActiveTab('profile')}
            className={`p-2 rounded-full transition-all ${activeTab === 'profile' ? 'bg-emerald-500 text-white' : 'hover:bg-white/10 text-slate-400'}`}
          >
            <UserIcon size={22} />
          </button>
          
          {currentUser.isAdmin && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`p-2 rounded-full transition-all ${activeTab === 'admin' ? 'bg-purple-500 text-white' : 'hover:bg-white/10 text-slate-400'}`}
            >
              <Settings size={22} />
            </button>
          )}

          <button onClick={() => setCurrentUser(null)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-all">
            <LogOut size={22} />
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto relative z-10">
        {activeTab === 'bingo' && (
          <div className="p-4 space-y-4 max-w-7xl mx-auto">
            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Fix: Explicitly cast val as number for toFixed call */}
              {Object.entries(activeGame?.prizes || {}).map(([type, val]) => (
                <div key={type} className="glass p-3 rounded-2xl border-l-4 border-emerald-500">
                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">{type}</div>
                  <div className="text-lg font-bold poppins">R$ {(val as number).toFixed(2)}</div>
                  <div className="text-[10px] text-emerald-500 font-bold mt-1">EM DISPUTA</div>
                </div>
              ))}
            </div>

            {/* Ball Tube */}
            <div className="glass p-4 rounded-3xl flex items-center gap-4 overflow-hidden relative">
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-slate-800 border-4 border-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 to-transparent" />
                <span className="text-3xl font-black text-white poppins z-10">
                   {activeGame?.drawnNumbers[activeGame.drawnNumbers.length - 1] || '--'}
                </span>
              </div>
              
              <div className="flex gap-2 items-center overflow-x-auto pb-2 scroll-hide flex-1">
                 {activeGame?.drawnNumbers.slice(-10).reverse().map((n, i) => (
                   <div key={i} className="w-10 h-10 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-xs font-bold opacity-60">
                      {n}
                   </div>
                 ))}
                 {(!activeGame || activeGame.drawnNumbers.length === 0) && (
                   <div className="text-slate-600 text-sm font-medium italic">Aguardando sorteio...</div>
                 )}
              </div>

              <div className="flex-shrink-0 flex flex-col items-center justify-center bg-slate-900 px-4 rounded-2xl border border-white/5">
                 <span className="text-[10px] text-slate-500 font-bold uppercase">Bolas</span>
                 <span className="text-xl font-bold poppins">
                   {activeGame?.drawnNumbers.length || 0}/75
                 </span>
              </div>
            </div>

            {/* Split View: Cards & Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Cards Section */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold poppins flex items-center gap-2">
                    <CreditCard className="text-emerald-400" size={20} />
                    Suas Cartelas ({userCards.filter(c => c.gameId === activeGame?.id).length})
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={() => setCardSize(Math.max(0.8, cardSize - 0.1))} className="p-1.5 glass rounded-lg"><ChevronLeft size={16}/></button>
                    <button onClick={() => setCardSize(Math.min(1.5, cardSize + 0.1))} className="p-1.5 glass rounded-lg"><ChevronRight size={16}/></button>
                  </div>
                </div>

                {userCards.filter(c => c.gameId === activeGame?.id).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ transform: `scale(${cardSize})`, transformOrigin: 'top left' }}>
                    {userCards.filter(c => c.gameId === activeGame?.id).map((card, idx) => (
                      <div key={card.id} className="glass rounded-2xl p-4 border border-white/10 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-2 text-[8px] text-white/20 font-mono">#{card.id}</div>
                         <div className="grid grid-cols-5 gap-1">
                            {card.numbers.map((row, r) => row.map((num, c) => (
                              <div 
                                key={`${r}-${c}`} 
                                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold transition-all duration-300 ${
                                  num === 0 ? 'bg-transparent' : 
                                  activeGame?.drawnNumbers.includes(num) ? 'bg-emerald-500 text-white scale-105 shadow-lg shadow-emerald-500/40' : 'bg-slate-800/50 text-slate-400'
                                }`}
                              >
                                {num !== 0 ? num : ''}
                              </div>
                            )))}
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 glass rounded-3xl flex flex-col items-center justify-center border-dashed border-2 border-white/10">
                     <Plus className="text-slate-600 mb-2" size={48} />
                     <p className="text-slate-500 font-medium">Você ainda não comprou séries para esta partida.</p>
                     <button 
                      onClick={() => setShowPurchaseModal(true)}
                      className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
                     >
                       COMPRAR AGORA
                     </button>
                  </div>
                )}
              </div>

              {/* Ranking Section */}
              <div className="lg:col-span-4 space-y-4">
                <div className="glass rounded-3xl p-6 border border-white/10 h-full">
                   <h2 className="text-xl font-bold poppins mb-6 flex items-center gap-2">
                     <Award className="text-yellow-400" size={24} />
                     Próximos de Ganhar
                   </h2>
                   <div className="space-y-3">
                      {users.filter(u => !u.isAdmin).slice(0, 6).map((user, i) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                           <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 text-slate-500'}`}>
                                {i + 1}
                              </span>
                              <span className="font-semibold text-slate-200">{user.username}</span>
                           </div>
                           <div className="flex gap-1">
                              {/* Simulate missing balls */}
                              {Array.from({ length: 2 }).map((_, j) => (
                                <div key={j} className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                   {Math.floor(Math.random() * 75) + 1}
                                </div>
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="mt-8 p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-xs text-slate-500 font-bold uppercase">Chat de Alertas</span>
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="space-y-2 text-xs text-slate-300 italic">
                         <p><span className="text-emerald-400 font-bold">Bot:</span> Boa sorte a todos os participantes!</p>
                         <p><span className="text-slate-500">Sistema:</span> Faltam {Math.floor((activeGame?.scheduledTime || 0 - Date.now()) / 60000)} minutos para o início.</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-4 max-w-4xl mx-auto space-y-6">
            <div className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <UserIcon size={120} />
               </div>
               
               <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                     <UserIcon size={40} className="text-white" />
                  </div>
                  <div>
                     <h2 className="text-3xl font-bold poppins">{currentUser.username}</h2>
                     <p className="text-slate-400 font-medium">WhatsApp: {currentUser.whatsapp}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
                     <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Saldo Disponível</span>
                     <div className="text-3xl font-black text-emerald-400 poppins my-1">R$ {currentUser.balance.toFixed(2)}</div>
                     <button onClick={() => setShowWithdrawModal(true)} className="mt-4 w-full bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/20">SOLICITAR SAQUE</button>
                  </div>
                  
                  <div className={`border p-6 rounded-2xl transition-all ${!currentUser.bonusClaimed ? 'bg-purple-500/10 border-purple-500/20 cursor-pointer hover:bg-purple-500/20' : 'bg-slate-800/50 border-white/5 opacity-50'}`} onClick={handleBonusClaim}>
                     <span className="text-xs text-purple-400 font-bold uppercase tracking-widest">Bônus Exclusivo</span>
                     <div className="text-3xl font-black text-purple-400 poppins my-1">R$ {config.bonusValue.toFixed(2)}</div>
                     <button disabled={currentUser.bonusClaimed} className="mt-4 w-full bg-purple-500 text-white font-bold py-3 rounded-xl">{currentUser.bonusClaimed ? 'BÔNUS RESGATADO' : 'RESGATAR AGORA'}</button>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="glass p-6 rounded-3xl border border-white/10">
                  <h3 className="text-lg font-bold poppins mb-4 flex items-center gap-2">
                     <Award className="text-yellow-400" size={20} />
                     Prêmios Ganhos
                  </h3>
                  <div className="space-y-3">
                     {transactions.filter(t => t.type === TransactionType.PRIZE).length > 0 ? (
                       transactions.filter(t => t.type === TransactionType.PRIZE).map(t => (
                         <div key={t.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <div>
                               <div className="text-sm font-bold text-white">{t.description}</div>
                               <div className="text-[10px] text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div className="text-emerald-400 font-bold">+ R$ {t.amount.toFixed(2)}</div>
                         </div>
                       ))
                     ) : (
                       <p className="text-slate-500 text-sm italic text-center py-4">Nenhum prêmio ainda.</p>
                     )}
                  </div>
               </div>

               <div className="glass p-6 rounded-3xl border border-white/10">
                  <h3 className="text-lg font-bold poppins mb-4 flex items-center gap-2">
                     <Clock className="text-blue-400" size={20} />
                     Histórico de Saques
                  </h3>
                  <div className="space-y-3">
                     {transactions.filter(t => t.type === TransactionType.WITHDRAWAL).length > 0 ? (
                       transactions.filter(t => t.type === TransactionType.WITHDRAWAL).map(t => (
                         <div key={t.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <div>
                               <div className="text-sm font-bold text-white">Solicitação de Saque</div>
                               <div className="text-[10px] text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div className="flex flex-col items-end">
                               <div className="text-red-400 font-bold">- R$ {t.amount.toFixed(2)}</div>
                               <div className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold ${t.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                  {t.status === 'completed' ? 'Pago' : 'Pendente'}
                               </div>
                            </div>
                         </div>
                       ))
                     ) : (
                       <p className="text-slate-500 text-sm italic text-center py-4">Nenhum saque solicitado.</p>
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && isAdminMode && (
          <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar Admin Nav */}
            <div className="lg:col-span-3 space-y-2">
               <h2 className="text-sm font-bold text-slate-500 uppercase px-4 mb-2 tracking-widest">Gestão</h2>
               <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-bold transition-all"><Play size={18}/> Controle Jogo</button>
               <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-slate-400 rounded-xl transition-all"><DollarSign size={18}/> Financeiro</button>
               <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-slate-400 rounded-xl transition-all"><Settings2 size={18}/> Configurações</button>
               <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-slate-400 rounded-xl transition-all"><TrendingUp size={18}/> Relatórios</button>
            </div>

            {/* Main Admin Area */}
            <div className="lg:col-span-9 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass p-5 rounded-2xl border border-white/10">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">Usuários Online</span>
                     <div className="text-3xl font-black text-white poppins">23</div>
                  </div>
                  <div className="glass p-5 rounded-2xl border border-white/10">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">Arrecadação Dia</span>
                     <div className="text-3xl font-black text-emerald-400 poppins">R$ 1.250,00</div>
                  </div>
                  <div className="glass p-5 rounded-2xl border border-white/10">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">Saques Pendentes</span>
                     <div className="text-3xl font-black text-red-400 poppins">05</div>
                  </div>
               </div>

               <div className="glass p-8 rounded-3xl border border-white/10">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-bold poppins flex items-center gap-2">
                        <Clock className="text-emerald-400" size={24} />
                        Próximas Partidas
                     </h3>
                     <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
                        <Plus size={18}/> NOVA PARTIDA
                     </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-500 text-xs font-bold uppercase border-b border-white/5">
                          <th className="pb-4 px-4">Jogo Nº</th>
                          <th className="pb-4 px-4">Horário</th>
                          <th className="pb-4 px-4">Preço Série</th>
                          <th className="pb-4 px-4">Status</th>
                          <th className="pb-4 px-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {games.map(g => (
                          <tr key={g.id} className="text-sm">
                            <td className="py-4 px-4 font-bold">#{g.gameNumber}</td>
                            <td className="py-4 px-4">{new Date(g.scheduledTime).toLocaleTimeString()}</td>
                            <td className="py-4 px-4">R$ {g.seriesPrice.toFixed(2)}</td>
                            <td className="py-4 px-4">
                               <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${g.status === GameStatus.SCHEDULED ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                  {g.status}
                               </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                               <button 
                                onClick={() => startGame(g.id)}
                                disabled={g.status !== GameStatus.SCHEDULED}
                                className="bg-slate-800 hover:bg-emerald-500 hover:text-white p-2 rounded-lg transition-all disabled:opacity-30"
                               >
                                  <Play size={16}/>
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass p-6 rounded-3xl border border-white/10">
                     <h3 className="text-lg font-bold poppins mb-4">Configuração PIX</h3>
                     <div className="space-y-4">
                        <div>
                           <label className="text-xs text-slate-500 font-bold mb-1 block">Chave PIX (Admin)</label>
                           <input type="text" value={config.pixKey} onChange={(e) => setConfig({...config, pixKey: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                        <button className="w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-xl font-bold transition-all">SALVAR CHAVE</button>
                     </div>
                  </div>
                  
                  <div className="glass p-6 rounded-3xl border border-white/10">
                     <h3 className="text-lg font-bold poppins mb-4">Configuração Narração</h3>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-sm font-medium">Status TTS</span>
                           <button onClick={() => { setTtsEnabled(!ttsEnabled); TTSService.setEnabled(!ttsEnabled); }} className={`w-12 h-6 rounded-full transition-all relative ${ttsEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${ttsEnabled ? 'left-7' : 'left-1'}`} />
                           </button>
                        </div>
                        <div>
                           <label className="text-xs text-slate-500 font-bold mb-1 block">Volume Global</label>
                           <input type="range" className="w-full accent-emerald-500" onChange={(e) => TTSService.setVolume(parseInt(e.target.value)/100)} />
                        </div>
                        <button onClick={() => TTSService.speak("Teste de narração ativo. Bingo Master!")} className="w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-xl font-bold transition-all">TESTAR VOZ</button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* --- FOOTER CONTROLS --- */}
      {activeTab === 'bingo' && (
        <div className="h-20 glass border-t border-white/10 px-4 flex items-center justify-between relative z-30">
          <div className="flex gap-4">
             <button 
              onClick={() => setShowPurchaseModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-white h-12 px-8 rounded-2xl font-black poppins text-sm tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
             >
               COMPRAR SÉRIES
             </button>
             <button onClick={() => setShowPixModal(true)} className="glass border-emerald-500/30 text-emerald-400 h-12 px-6 rounded-2xl font-bold flex items-center gap-2">
                <DollarSign size={18}/> DEPOSITAR
             </button>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex flex-col items-center">
                <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Narração</span>
                <button onClick={() => { setTtsEnabled(!ttsEnabled); TTSService.setEnabled(!ttsEnabled); }} className={`p-2 rounded-full transition-all ${ttsEnabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-600 bg-slate-800'}`}>
                   {ttsEnabled ? <Volume2 size={20}/> : <VolumeX size={20}/>}
                </button>
             </div>
             
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 font-bold">PRÓXIMA PARTIDA</span>
                <div className="text-white font-black text-xl poppins">
                   {activeGame ? new Date(activeGame.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
           <div className="glass border-white/20 p-8 rounded-[40px] w-full max-w-lg relative overflow-hidden">
              <button onClick={() => setShowPurchaseModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-all"><X size={24}/></button>
              
              <div className="text-center mb-8">
                 <h2 className="text-3xl font-black poppins mb-2">ESCOLHA SUA SÉRIE</h2>
                 <p className="text-slate-400">Quanto maior a série, maior o prêmio!</p>
              </div>

              <div className="space-y-4 mb-8">
                 {(['A', 'B', 'C'] as const).map(type => (
                   <div 
                    key={type} 
                    onClick={() => buySeries(type)}
                    className="group bg-slate-900/50 border border-white/5 p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:bg-emerald-500 transition-all hover:scale-[1.02] shadow-xl"
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-2xl group-hover:bg-white/20">
                            {type}
                         </div>
                         <div>
                            <div className="text-lg font-black group-hover:text-white">SÉRIE {type}</div>
                            <div className="text-xs text-slate-500 group-hover:text-emerald-100 uppercase font-bold tracking-widest">Até 15 cartelas extras</div>
                         </div>
                      </div>
                      <div className="text-2xl font-black poppins group-hover:text-white">R$ {config.prices[type].toFixed(2)}</div>
                   </div>
                 ))}
              </div>

              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                 <span className="text-xs text-slate-400 font-bold mr-2 uppercase">Seu Saldo:</span>
                 <span className="text-emerald-400 font-black poppins text-lg">R$ {currentUser.balance.toFixed(2)}</span>
              </div>
           </div>
        </div>
      )}

      {/* Pix Deposit Modal */}
      {showPixModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
           <div className="glass border-white/20 p-8 rounded-[40px] w-full max-w-2xl flex flex-col md:flex-row gap-8 relative overflow-hidden">
              <button onClick={() => setShowPixModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-all"><X size={24}/></button>

              <div className="flex-1 flex flex-col items-center justify-center bg-white p-6 rounded-3xl shadow-2xl">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${config.pixKey}`} className="w-48 h-48 mb-4" alt="PIX QR" />
                 <span className="text-slate-400 text-[10px] font-bold uppercase mb-1">Copiar Chave</span>
                 <div className="flex items-center gap-2 w-full">
                    <input readOnly value={config.pixKey} className="flex-1 bg-slate-100 text-slate-900 p-2 rounded-lg text-xs font-mono border-none focus:ring-0" />
                    <button onClick={() => { navigator.clipboard.writeText(config.pixKey); alert("Chave copiada!"); }} className="p-2 bg-emerald-500 text-white rounded-lg"><Copy size={16}/></button>
                 </div>
              </div>

              <div className="flex-1 space-y-6">
                 <div>
                    <h2 className="text-3xl font-black poppins mb-2">DEPÓSITO PIX</h2>
                    <p className="text-slate-400 text-sm">Escaneie o código ou copie a chave para depositar. Valor mínimo R$ 3,00.</p>
                 </div>

                 <div className="space-y-4">
                    <div>
                       <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Valor a Depositar</label>
                       <input type="number" placeholder="0,00" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-2xl font-black text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none" id="pix-amount" />
                    </div>
                    
                    <button 
                      onClick={() => {
                        const amt = parseFloat((document.getElementById('pix-amount') as HTMLInputElement).value);
                        if (amt >= 3) {
                          const updatedUser = { ...currentUser, balance: currentUser.balance + amt };
                          setCurrentUser(updatedUser);
                          setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
                          setTransactions([{
                            id: Math.random().toString(36).substr(2, 9),
                            userId: currentUser.id,
                            type: TransactionType.DEPOSIT,
                            amount: amt,
                            description: 'Depósito PIX',
                            status: 'completed',
                            createdAt: Date.now()
                          }, ...transactions]);
                          setShowPixModal(false);
                          alert("Depósito confirmado!");
                        } else alert("Valor mínimo R$ 3,00");
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      JÁ ENVIEI O PIX
                    </button>
                    <button onClick={() => setShowPixModal(false)} className="w-full text-slate-500 font-bold text-sm">CANCELAR</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
           <div className="glass border-white/20 p-8 rounded-[40px] w-full max-w-md relative overflow-hidden">
              <button onClick={() => setShowWithdrawModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-all"><X size={24}/></button>
              
              <div className="text-center mb-8">
                 <h2 className="text-3xl font-black poppins mb-2">SOLICITAR SAQUE</h2>
                 <p className="text-slate-400 text-sm italic">O processamento pode levar até 40 minutos.</p>
              </div>

              <div className="space-y-4">
                 <input type="text" placeholder="Nome completo cadastrado no PIX" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500" />
                 <input type="text" placeholder="CPF" value={currentUser.cpf} readOnly className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 opacity-50" />
                 <input type="number" placeholder="R$ 0,00" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-2xl font-black text-red-400" id="withdraw-amt" />
                 <input type="password" placeholder="Sua Senha" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none" id="withdraw-pass" />
                 
                 <div className="p-4 bg-slate-900 rounded-2xl text-center">
                    <span className="text-[10px] text-slate-500 font-black uppercase">Saldo Atual:</span>
                    <span className="text-emerald-400 font-bold ml-2">R$ {currentUser.balance.toFixed(2)}</span>
                 </div>

                 <button 
                  onClick={() => {
                    const amt = parseFloat((document.getElementById('withdraw-amt') as HTMLInputElement).value);
                    if (amt > 0 && amt <= currentUser.balance) {
                      const updatedUser = { ...currentUser, balance: currentUser.balance - amt };
                      setCurrentUser(updatedUser);
                      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
                      setTransactions([{
                        id: Math.random().toString(36).substr(2, 9),
                        userId: currentUser.id,
                        type: TransactionType.WITHDRAWAL,
                        amount: amt,
                        description: 'Solicitação de Saque',
                        status: 'pending',
                        createdAt: Date.now()
                      }, ...transactions]);
                      setShowWithdrawModal(false);
                      alert("Solicitação enviada! Aguarde o processamento.");
                    } else alert("Saldo insuficiente ou valor inválido.");
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-2xl shadow-xl transition-all"
                 >
                    SOLICITAR SAQUE
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Settings Modal (Overlay button) */}
      <button 
        onClick={() => setCardSize(1)} 
        className="fixed bottom-24 left-6 z-50 p-3 bg-slate-900/80 backdrop-blur rounded-2xl border border-white/10 text-slate-400 hover:text-emerald-400 shadow-2xl md:hidden"
      >
        <Settings2 size={24}/>
      </button>

    </div>
  );
}
