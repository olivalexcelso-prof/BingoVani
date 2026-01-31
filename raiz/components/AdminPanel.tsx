
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { engine } from '../services/GameEngine';
import { GameStatus } from '../types';

const AdminPanel: React.FC = () => {
  const { 
    logout, gameState, adminConfig, updateAdminConfig, 
    users, updateUserBalance, generateFakes, financials,
    autoSchedule, manualGames, updateAutoSchedule, addManualGame, removeManualGame,
    seriesConfigs, updateSeriesConfig, updateGameStatePrizes, transactions
  } = useGame();
  
  const [activeTab, setActiveTab] = useState('controle');

  const exportReport = () => window.print();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'controle':
        return (
          <div className="space-y-8 animate-pop no-print">
            <header className="flex justify-between items-center bg-white/5 p-8 rounded-[2rem] border border-white/10">
               <div>
                 <h2 className="text-3xl font-black text-white tracking-tighter">CONTROLE AO VIVO</h2>
                 <p className="text-[#00D084] font-black text-[10px] uppercase">Partida: {gameState.status} | Bolas: {gameState.ballCount} | Prêmio: {gameState.currentPrizeType}</p>
               </div>
               <div className="flex gap-4">
                 <button onClick={() => engine.startGame()} disabled={gameState.status === GameStatus.PLAYING} className="bg-[#00D084] text-white px-10 py-4 rounded-2xl font-black text-xs">INICIAR SORTEIO</button>
                 <button onClick={() => engine.stopGame()} className="bg-[#FF6B35] text-white px-10 py-4 rounded-2xl font-black text-xs">ENCERRAR JOGO</button>
               </div>
            </header>

            <section className="bg-black/40 p-8 rounded-[2rem] border border-white/10 space-y-6">
               <h3 className="text-white font-black text-lg">Prêmios Atuais</h3>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {['quadra', 'linha', 'bingo', 'acumulado'].map(p => (
                    <div key={p}>
                      <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">{p}</label>
                      <input 
                        type="number" 
                        value={(gameState.prizes as any)[p]} 
                        onChange={e => updateGameStatePrizes({ [p]: Number(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[#00D084] font-black outline-none"
                      />
                    </div>
                  ))}
               </div>
            </section>
          </div>
        );

      case 'agendamento':
        return (
          <div className="space-y-8 animate-pop no-print">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="bg-black/40 p-8 rounded-[2rem] border border-white/10 space-y-6">
                <h3 className="text-white font-black text-lg">Agendamento Automático</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase block mb-1">Primeiro Jogo</label>
                    <input type="time" value={autoSchedule.firstGameTime} onChange={e => updateAutoSchedule({...autoSchedule, firstGameTime: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase block mb-1">Intervalo (Min)</label>
                    <input type="number" value={autoSchedule.intervalMinutes} onChange={e => updateAutoSchedule({...autoSchedule, intervalMinutes: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white" />
                  </div>
                </div>
              </section>
              <section className="bg-black/40 p-8 rounded-[2rem] border border-white/10 space-y-6">
                <h3 className="text-white font-black text-lg">Configuração de Séries (A, B, C)</h3>
                {seriesConfigs.map(sc => (
                  <div key={sc.id} className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-[#00D084] font-black text-lg">{sc.id}</span>
                    <div className="flex-1">
                      <label className="text-[8px] text-gray-500 uppercase">Preço (R$)</label>
                      <input type="number" value={sc.price} onChange={e => updateSeriesConfig(sc.id, 'price', Number(e.target.value))} className="w-full bg-transparent text-white font-bold outline-none" />
                    </div>
                    <div className="w-24">
                      <label className="text-[8px] text-gray-500 uppercase">Cartelas</label>
                      <input type="number" value={sc.quantity} onChange={e => updateSeriesConfig(sc.id, 'quantity', Number(e.target.value))} className="w-full bg-transparent text-white font-bold outline-none" />
                    </div>
                  </div>
                ))}
              </section>
            </div>
          </div>
        );

      case 'usuarios':
        return (
          <div className="space-y-8 animate-pop no-print">
            <header className="flex justify-between items-center">
               <h2 className="text-3xl font-black text-white tracking-tighter">GESTÃO DE USUÁRIOS</h2>
               <button onClick={generateFakes} className="bg-[#00D084] text-white px-8 py-3 rounded-xl font-black text-xs">GERAR BOTS</button>
            </header>
            <div className="bg-black/40 rounded-[2rem] border border-white/10 overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] text-gray-500 uppercase font-black">
                     <tr>
                        <th className="p-6">Nome</th>
                        <th>WhatsApp</th>
                        <th>Saldo</th>
                        <th className="text-right p-6">Ações</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {users.map(u => (
                       <tr key={u.id} className="text-sm">
                          <td className="p-6 font-bold text-white">{u.username} {u.isFake && <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded ml-2">BOT</span>}</td>
                          <td className="text-gray-400">{u.whatsapp}</td>
                          <td className="text-[#00D084] font-black">R$ {u.balance.toFixed(2)}</td>
                          <td className="p-6 text-right">
                             <button onClick={() => updateUserBalance(u.id, u.balance + 10)} className="bg-white/5 p-2 rounded hover:bg-[#00D084] transition-colors">Add R$10</button>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        );

      case 'relatorios':
        return (
          <div className="space-y-8 animate-pop">
            <header className="flex justify-between items-center no-print">
               <h2 className="text-3xl font-black text-white tracking-tighter">FINANCEIRO E RELATÓRIOS</h2>
               <button onClick={exportReport} className="bg-[#9D4EDD] text-white px-8 py-3 rounded-xl font-black text-xs shadow-lg shadow-[#9D4EDD]/20">EXPORTAR PDF</button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
               {[
                 { label: 'Arrecadação Bruta', value: financials.bruto, color: 'text-white' },
                 { label: 'Prêmios Pagos', value: financials.pagos, color: 'text-red-400' },
                 { label: 'Saldo Acumulado', value: financials.acumulado, color: 'text-[#9D4EDD]' },
                 { label: 'Lucro Líquido', value: financials.lucro, color: 'text-[#00D084]' },
                 { label: 'Doações Bots', value: financials.doacoes, color: 'text-[#FF6B35]' }
               ].map((stat, i) => (
                 <div key={i} className="bg-black/40 p-6 rounded-[1.5rem] border border-white/10">
                    <p className="text-[9px] text-gray-500 font-black uppercase mb-1">{stat.label}</p>
                    <p className={`text-xl font-black ${stat.color}`}>R$ {stat.value.toFixed(2)}</p>
                 </div>
               ))}
            </div>
            
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
               <h3 className="text-white font-black mb-6">Últimas Transações</h3>
               <div className="space-y-4">
                  {transactions.slice(-10).reverse().map(t => (
                    <div key={t.id} className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5">
                       <div>
                          <p className="text-white font-bold text-xs">{t.description}</p>
                          <p className="text-[10px] text-gray-500">{new Date(t.date).toLocaleString()}</p>
                       </div>
                       <span className={`font-black text-xs ${t.type === 'PURCHASE' ? 'text-white' : 'text-[#00D084]'}`}>
                          {t.type === 'PURCHASE' ? '-' : '+'} R$ {t.amount.toFixed(2)}
                       </span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        );

      case 'config':
        return (
          <div className="space-y-8 animate-pop no-print">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <section className="bg-black/40 p-8 rounded-[2rem] border border-white/10 space-y-4">
                  <h3 className="text-white font-black text-lg">Configurações de Recebimento</h3>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-black block mb-1">Chave PIX Admin</label>
                    <input type="text" value={adminConfig.pixKey} onChange={e => updateAdminConfig('pixKey', e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-black block mb-1">WhatsApp Notificações</label>
                    <input type="text" value={adminConfig.withdrawWhatsapp} onChange={e => updateAdminConfig('withdrawWhatsapp', e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-black block mb-1">Bônus de Cadastro (R$)</label>
                    <input type="number" value={adminConfig.bonusAmount} onChange={e => updateAdminConfig('bonusAmount', Number(e.target.value))} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none" />
                  </div>
               </section>

               <section className="bg-black/40 p-8 rounded-[2rem] border border-white/10 space-y-4">
                  <h3 className="text-white font-black text-lg">Personalização Visual</h3>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-black block mb-1">Background Login (URL)</label>
                    <input type="text" value={adminConfig.bgLogin} onChange={e => updateAdminConfig('bgLogin', e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-black block mb-1">Background Sala (URL)</label>
                    <input type="text" value={adminConfig.bgRoom} onChange={e => updateAdminConfig('bgRoom', e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-black block mb-1">Opacidade ({adminConfig.bgOpacity})</label>
                    <input type="range" min="0" max="1" step="0.1" value={adminConfig.bgOpacity} onChange={e => updateAdminConfig('bgOpacity', Number(e.target.value))} className="w-full" />
                  </div>
               </section>
            </div>
            
            <section className="bg-black/40 p-8 rounded-[2rem] border border-white/10 space-y-4">
               <h3 className="text-white font-black text-lg">Instituição de Doação</h3>
               <input type="text" value={adminConfig.donationInstitution} onChange={e => updateAdminConfig('donationInstitution', e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none" />
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F1E] flex flex-col md:flex-row">
      <aside className="no-print w-full md:w-64 bg-black/40 border-r border-white/5 p-6 flex flex-col h-screen sticky top-0">
        <div className="mb-10 text-center">
           <h1 className="text-xl font-black text-white">BINGO MASTER</h1>
           <p className="text-[8px] text-[#00D084] font-black uppercase tracking-widest">Admin Console</p>
        </div>
        <nav className="space-y-2 flex-1">
          {[
            { id: 'controle', label: 'Controle', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { id: 'agendamento', label: 'Agendamento', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { id: 'usuarios', label: 'Usuários', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { id: 'relatorios', label: 'Relatórios', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2' },
            { id: 'config', label: 'Configurações', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === item.id ? 'bg-[#00D084] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
              {item.label}
            </button>
          ))}
        </nav>
        <button onClick={logout} className="mt-8 px-4 py-3 text-[10px] font-black text-red-400 uppercase border border-red-400/20 rounded-xl hover:bg-red-400/10 transition-colors">SAIR</button>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default AdminPanel;
