
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Card, GameStatus } from '../types';

const PrizeBox: React.FC<{ label: string; value: number; active?: boolean; special?: boolean }> = ({ label, value, active, special }) => (
  <div className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${active ? 'bg-[#00D084] border-[#00D084] scale-105 shadow-lg shadow-[#00D084]/20' : special ? 'bg-[#9D4EDD]/20 border-[#9D4EDD]/40' : 'bg-black/40 border-white/5'}`}>
    <span className={`text-[8px] font-black uppercase tracking-tighter ${active ? 'text-white' : 'text-gray-400'}`}>{label}</span>
    <span className={`text-sm font-black ${active ? 'text-white' : special ? 'text-[#9D4EDD]' : 'text-[#00D084]'}`}>R$ {value.toFixed(2)}</span>
  </div>
);

const CardDisplay: React.FC<{ card: Card; drawnNumbers: number[] }> = ({ card, drawnNumbers }) => {
  const isMarked = (num: number) => drawnNumbers.includes(num);
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-white/20 transform hover:scale-[1.02] transition-all">
      <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-1">
        <span className="text-[10px] font-black text-[#1F1F3D]">CARD #{card.id.slice(-4)}</span>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00D084]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#9D4EDD]"></div>
        </div>
      </div>
      <div className="grid grid-cols-9 gap-1">
        {card.numbers.map((row, ri) => (
          row.map((num, ci) => (
            <div 
              key={`${ri}-${ci}`}
              className={`aspect-square flex items-center justify-center text-[10px] font-bold rounded-lg transition-all ${num === 0 ? 'bg-transparent' : isMarked(num) ? 'bg-[#00D084] text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}
            >
              {num !== 0 ? num : ''}
            </div>
          ))
        ))}
      </div>
    </div>
  );
};

const BingoRoom: React.FC = () => {
  const { 
    gameState, user, userCards, ranking, buySeries, adminConfig, logout, seriesConfigs, deposit
  } = useGame();
  
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [depositAmount, setDepositAmount] = useState('20.00');

  useEffect(() => {
    if (gameState.status === GameStatus.SCHEDULED && gameState.nextGameTime) {
      const timer = setInterval(() => {
        const now = new Date();
        const [h, m] = gameState.nextGameTime!.split(':').map(Number);
        const target = new Date();
        target.setHours(h, m, 0, 0);
        
        const diff = target.getTime() - now.getTime();
        if (diff > 0) {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setCountdown(`${mins}:${secs.toString().padStart(2, '0')}`);
        } else {
          setCountdown('Começando...');
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState.nextGameTime, gameState.status]);

  const handleBuy = async (id: string) => {
    const success = await buySeries(id);
    if (success) {
      alert('Série adquirida com sucesso! Suas cartelas já estão no grid.');
    } else {
      alert('Saldo insuficiente! Por favor, faça um depósito.');
    }
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;
    deposit(amount);
    setShowDepositModal(false);
    alert(`Depósito de R$ ${amount.toFixed(2)} confirmado!`);
  };

  const getBallColor = (num: number) => num <= 40 ? 'bg-[#00D084]' : 'bg-[#FF6B35]';

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#1F1F3D] overflow-hidden relative">
      <div 
        className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${adminConfig.bgRoom})`, opacity: adminConfig.bgOpacity }}
      />

      {/* Header Info */}
      <div className="h-[20%] flex-none relative z-10 bg-black/60 backdrop-blur-md border-b border-white/10 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1">
            <PrizeBox label="QUADRA" value={gameState.prizes.quadra} active={gameState.currentPrizeType === 'QUADRA'} />
            <PrizeBox label="LINHA" value={gameState.prizes.linha} active={gameState.currentPrizeType === 'LINHA'} />
            <PrizeBox label="BINGO" value={gameState.prizes.bingo} active={gameState.currentPrizeType === 'BINGO'} />
            <PrizeBox label="ACUMULADO" value={gameState.prizes.acumulado} special />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seu Saldo</div>
               <div className="flex items-center gap-2">
                 <div className="text-xl font-black text-[#00D084]">R$ {user?.balance.toFixed(2)}</div>
                 <button 
                  onClick={() => setShowDepositModal(true)}
                  className="w-6 h-6 bg-[#00D084] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-110 transition-transform"
                 >
                   +
                 </button>
               </div>
            </div>
            <button onClick={() => setShowProfile(true)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#00D084] transition border border-white/10">
               <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          {gameState.status === GameStatus.SCHEDULED ? (
            <div className="flex items-center gap-4">
               <div className="bg-[#9D4EDD] px-4 py-1 rounded-full text-white font-black text-xs animate-pulse">PRÓXIMO JOGO: {gameState.nextGameTime}</div>
               <div className="text-white font-black text-sm uppercase tracking-tighter">Início em: <span className="text-[#00D084]">{countdown}</span></div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="bg-black/50 px-3 py-1 rounded text-[10px] font-black border border-white/10 text-white uppercase tracking-widest">Foco: <span className="text-[#00D084]">{gameState.currentPrizeType}</span></div>
              <div className="bg-black/50 px-3 py-1 rounded text-[10px] font-black border border-white/10 text-white uppercase tracking-widest">Bolas: <span className="text-[#00D084]">{gameState.ballCount}</span></div>
            </div>
          )}
          <button 
            onClick={() => setShowBuyModal(true)}
            className="bg-[#00D084] text-white px-8 py-2 rounded-full font-black text-xs shadow-lg shadow-[#00D084]/20 uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Comprar Cartelas
          </button>
        </div>
      </div>

      {/* Ball Display Area */}
      <div className="h-[25%] flex-none relative z-10 flex items-center justify-center overflow-hidden">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-black text-slate-900 ${gameState.currentBall ? getBallColor(gameState.currentBall) : 'bg-gray-700/80'} ball-gradient transition-all duration-500`}>
              {gameState.currentBall || '--'}
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-[#1F1F3D] text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap shadow-xl">SORTEADA</div>
          </div>
          <div className="hidden md:flex gap-4 ml-6 overflow-hidden max-w-[500px]">
            {gameState.drawnNumbers.slice(-6, -1).reverse().map((num, i) => (
              <div key={i} className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-slate-800 ${getBallColor(num)} ball-gradient opacity-60 transform scale-90`}>
                {num}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Area */}
      <div className="h-[55%] flex-none relative z-10 p-4 flex flex-col md:flex-row gap-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-8">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-black/40 py-2 backdrop-blur-md rounded-xl px-4 border border-white/5 z-20">
            <h3 className="text-sm font-black text-white/60 uppercase tracking-widest">Sua Mesa ({userCards.length})</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse"></span>
              <div className="text-[10px] font-black text-[#00D084] uppercase">Live Tracking Ativo</div>
            </div>
          </div>
          {userCards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {userCards.map(card => (
                <CardDisplay key={card.id} card={card} drawnNumbers={gameState.drawnNumbers} />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <p className="font-black text-sm uppercase tracking-widest">Nenhuma cartela ativa</p>
              <button onClick={() => setShowBuyModal(true)} className="mt-4 text-[#00D084] font-black text-[10px] uppercase underline">Comprar Agora</button>
            </div>
          )}
        </div>

        {/* Sidebar Ranking */}
        <div className="w-full md:w-80 bg-black/60 backdrop-blur-lg rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center text-white bg-white/5">
             <h3 className="text-[10px] font-black text-[#9D4EDD] uppercase tracking-widest">QUASE LÁ</h3>
             <span className="text-[8px] font-bold text-gray-500">REALTIME</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {ranking.length > 0 ? ranking.map((r, i) => (
              <div key={i} className="bg-white/5 p-3 rounded-xl flex items-center justify-between border border-white/5 hover:bg-white/10 transition">
                <div className="text-sm font-bold text-white/80">{r.username}</div>
                <div className="text-xl font-black text-[#FF6B35]">{r.missing} <span className="text-[8px] uppercase font-bold text-gray-500">FALTA</span></div>
              </div>
            )) : (
              <div className="text-center p-10 opacity-20">
                <p className="text-[10px] font-bold uppercase">Aguardando início...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Compra de Cartelas */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1F1F3D] rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/10 animate-pop">
            <div className="p-8 text-center border-b border-white/5">
              <h2 className="text-[#00D084] font-black text-2xl uppercase tracking-tighter">Loja de Cartelas</h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase mt-2">Escolha sua série da sorte</p>
            </div>
            <div className="p-6 space-y-4">
              {seriesConfigs.map(sc => (
                <button 
                  key={sc.id}
                  onClick={() => handleBuy(sc.id)}
                  className="w-full flex justify-between items-center p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 transition-all group"
                >
                  <div className="text-left">
                    <div className="text-white font-black text-sm uppercase tracking-widest group-hover:text-[#00D084]">{sc.name}</div>
                    <div className="text-gray-500 text-[9px] font-bold uppercase">{sc.quantity} Cartelas p/ jogo</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#00D084] font-black text-lg">R$ {sc.price.toFixed(2)}</div>
                    <div className="text-[8px] text-gray-500 font-bold uppercase">Adquirir</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-6 pt-0 flex flex-col items-center">
               <div className="text-[10px] font-black text-gray-500 uppercase mb-4">Seu Saldo: <span className="text-white">R$ {user?.balance.toFixed(2)}</span></div>
               <button onClick={() => setShowBuyModal(false)} className="w-full bg-white/5 py-4 rounded-2xl text-gray-400 font-black text-[10px] uppercase hover:bg-red-500/10 hover:text-red-400 transition">Fechar Loja</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Depósito */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/80 z-[65] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1F1F3D] rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-white/10 animate-pop">
            <div className="p-8 text-center bg-gradient-to-br from-[#00D084]/20 to-transparent">
              <div className="w-16 h-16 bg-[#00D084] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h2 className="text-white font-black text-xl uppercase">Inserir Saldo</h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase mt-1">Recarga rápida via PIX</p>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase mb-2 block ml-1">Valor do Depósito (R$)</label>
                <input 
                  type="number" 
                  value={depositAmount} 
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white font-black text-xl outline-none focus:ring-2 focus:ring-[#00D084] transition"
                />
              </div>
              <div className="bg-black/20 p-4 rounded-2xl border border-dashed border-white/10">
                <label className="text-[9px] font-black text-gray-500 uppercase mb-1 block">Chave PIX Central</label>
                <div className="text-white font-bold text-xs break-all">{adminConfig.pixKey}</div>
              </div>
              <button 
                onClick={handleDeposit}
                className="w-full bg-[#00D084] py-5 rounded-2xl text-white font-black text-xs shadow-xl shadow-[#00D084]/20 hover:scale-[1.02] transition"
              >
                CONFIRMAR PAGAMENTO
              </button>
              <button onClick={() => setShowDepositModal(false)} className="w-full text-gray-500 font-black text-[9px] uppercase">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Perfil */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1F1F3D] rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-white/10">
            <div className="p-10 text-center bg-white/5">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00D084] to-[#9D4EDD] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white/10">
                <span className="text-white font-black text-3xl uppercase">{user?.username.charAt(0)}</span>
              </div>
              <h2 className="text-white font-black text-2xl uppercase tracking-tighter">{user?.username}</h2>
              <p className="text-[#00D084] text-[10px] font-black uppercase mt-1 tracking-widest">Membro Diamond</p>
            </div>
            <div className="p-8 space-y-3">
              <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl">
                <span className="text-[10px] font-black text-gray-500 uppercase">WhatsApp</span>
                <span className="text-white font-bold text-xs">{user?.whatsapp}</span>
              </div>
              <button onClick={logout} className="w-full py-4 text-red-400 font-black text-[10px] uppercase border border-red-400/20 rounded-2xl hover:bg-red-400/10 transition">Sair da Conta</button>
            </div>
            <button onClick={() => setShowProfile(false)} className="w-full bg-white/5 py-4 text-gray-500 font-black text-[10px] uppercase border-t border-white/5">Fechar Janela</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BingoRoom;
