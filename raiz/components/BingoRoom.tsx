
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
    gameState, user, userCards, ranking, buySeries, adminConfig, logout
  } = useGame();
  
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [countdown, setCountdown] = useState('');

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
          <div className="flex flex-col items-end">
             <button onClick={() => setShowProfile(true)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#00D084] transition border border-white/10 mb-1">
               <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
             </button>
             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo</div>
             <div className="text-xl font-black text-[#00D084]">R$ {user?.balance.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          {gameState.status === GameStatus.SCHEDULED ? (
            <div className="flex items-center gap-4">
               <div className="bg-[#9D4EDD] px-4 py-1 rounded-full text-white font-black text-xs animate-pulse">PRÓXIMO JOGO: {gameState.nextGameTime}</div>
               <div className="text-white font-black text-sm">INICIA EM: {countdown}</div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="bg-black/50 px-3 py-1 rounded text-[10px] font-black border border-white/10 text-white">DISPUTA: <span className="text-[#00D084]">{gameState.currentPrizeType}</span></div>
              <div className="bg-black/50 px-3 py-1 rounded text-[10px] font-black border border-white/10 text-white">BOLAS: <span className="text-[#00D084]">{gameState.ballCount}</span></div>
            </div>
          )}
          <button 
            onClick={() => setShowBuyModal(true)}
            className="bg-[#00D084] text-white px-8 py-2 rounded-full font-black text-xs shadow-lg shadow-[#00D084]/20"
          >
            SÉRIE: R$ {gameState.currentSeriesPrice.toFixed(2)}
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
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-[#1F1F3D] text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap shadow-xl">BOLA ATUAL</div>
          </div>
          <div className="flex gap-4 ml-6 overflow-hidden max-w-[500px]">
            {gameState.drawnNumbers.slice(-10, -1).reverse().map((num, i) => (
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
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-black/40 py-2 backdrop-blur-md rounded-xl px-4 border border-white/5">
            <h3 className="text-sm font-black text-white/60 uppercase tracking-widest">SUAS CARTELAS ({userCards.length})</h3>
            <div className="text-[10px] font-black text-[#00D084]">MARCAÇÃO AUTOMÁTICA</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {userCards.map(card => (
              <CardDisplay key={card.id} card={card} drawnNumbers={gameState.drawnNumbers} />
            ))}
          </div>
        </div>

        {/* Sidebar Ranking */}
        <div className="w-full md:w-80 bg-black/60 backdrop-blur-lg rounded-2xl border border-white/10 flex flex-col h-full">
          <div className="p-4 border-b border-white/10 flex justify-between items-center text-white">
             <h3 className="text-[10px] font-black text-[#9D4EDD] uppercase tracking-widest">RANKING PROXIMIDADE</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {ranking.map((r, i) => (
              <div key={i} className="bg-white/5 p-3 rounded-xl flex items-center justify-between border border-white/10">
                <div className="text-sm font-bold text-white/80">{r.username}</div>
                <div className="text-xl font-black text-[#FF6B35]">{r.missing} <span className="text-[8px] uppercase">Faltam</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showBuyModal && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-pop">
            <div className="bg-[#1F1F3D] p-6 text-center">
              <h2 className="text-[#00D084] font-black text-2xl uppercase">Comprar Série</h2>
              <div className="text-gray-400 text-xs font-bold mt-1">Saldo: R$ {user?.balance.toFixed(2)}</div>
            </div>
            <div className="p-6 space-y-3">
              <button 
                onClick={() => { buySeries('A'); setShowBuyModal(false); }}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200"
              >
                <div className="text-left font-black text-gray-800">SÉRIE AVULSA</div>
                <div className="text-[#00D084] font-black">R$ {gameState.currentSeriesPrice.toFixed(2)}</div>
              </button>
            </div>
            <button onClick={() => setShowBuyModal(false)} className="w-full bg-gray-100 py-4 text-gray-500 font-bold text-[10px] uppercase">Fechar</button>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-[#1F1F3D] p-6 text-center text-white">
              <h2 className="font-black text-xl">{user?.username}</h2>
              <p className="text-xs text-gray-400 font-bold">Saldo: R$ {user?.balance.toFixed(2)}</p>
            </div>
            <div className="p-4">
              <button onClick={logout} className="w-full py-3 text-red-500 font-bold text-sm">SAIR DA CONTA</button>
            </div>
            <button onClick={() => setShowProfile(false)} className="w-full bg-gray-100 py-4 text-gray-500 font-bold text-[10px] uppercase">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BingoRoom;
