
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { engine } from '../services/GameEngine';
import { GameStatus } from '../types';

const AdminPanel: React.FC = () => {
  const { 
    logout, gameState, adminConfig, updateAdminConfig, users, financials, 
    seriesPrice, updateSeriesPrice, updateGameStatePrizes, transactions, autoSchedule, updateAutoSchedule, generateFakes 
  } = useGame();
  const [tab, setTab] = useState('dash');

  const menu = [
    { id: 'dash', label: 'Dashboard', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'series', label: 'Config Série', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'agenda', label: 'Agenda', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'users', label: 'Usuários', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'config', label: 'Sistema', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37' }
  ];

  return (
    <div className="min-h-screen bg-[#0F0F1E] flex flex-col md:flex-row font-poppins">
      <aside className="w-full md:w-72 bg-black/40 border-r border-white/5 p-8 flex flex-col no-print">
        <h1 className="text-2xl font-black text-white mb-10 text-center tracking-tighter">BINGO ADMIN</h1>
        <nav className="flex-1 space-y-2">
          {menu.map(m => (
            <button key={m.id} onClick={() => setTab(m.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase transition-all ${tab === m.id ? 'bg-[#00D084] text-white shadow-xl shadow-green-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={m.icon}></path></svg>
              {m.label}
            </button>
          ))}
        </nav>
        <button onClick={logout} className="mt-8 px-6 py-4 text-[10px] font-black text-red-400 border border-red-400/20 rounded-2xl hover:bg-red-400/10">SAIR DO SISTEMA</button>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        {tab === 'dash' && (
          <div className="space-y-8 animate-pop">
            <header className="flex justify-between items-center bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Painel de Controle</h2>
                <p className="text-[#00D084] font-black text-[10px] uppercase">Partida: {gameState.status} | Bolas: {gameState.ballCount}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => engine.startGame()} className="bg-[#00D084] text-white px-8 py-4 rounded-2xl font-black text-xs shadow-lg">INICIAR RODADA</button>
                <button onClick={() => engine.stopGame()} className="bg-[#FF6B35] text-white px-8 py-4 rounded-2xl font-black text-xs shadow-lg">FORÇAR TÉRMINO</button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {['quadra', 'linha', 'bingo', 'acumulado'].map(p => (
                <div key={p} className="bg-black/40 p-6 rounded-[2rem] border border-white/10">
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">Prêmio {p}</label>
                  <input type="number" value={(gameState.prizes as any)[p]} onChange={e => updateGameStatePrizes({[p]: Number(e.target.value)})} className="w-full bg-transparent text-white font-black text-2xl outline-none" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[ {l: 'Bruto', v: financials.bruto, c: 'text-white'}, {l: 'Pagos', v: financials.pagos, c: 'text-red-400'}, {l: 'Doação', v: financials.doacoes, c: 'text-purple-400'}, {l: 'Lucro Líquido', v: financials.lucro, c: 'text-[#00D084]'} ].map((s, i) => (
                <div key={i} className="bg-black/40 p-8 rounded-[2rem] border border-white/10">
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1">{s.l}</p>
                  <p className={`text-2xl font-black ${s.c}`}>R$ {s.v.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'series' && (
          <div className="max-w-xl mx-auto animate-pop">
            <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 space-y-8 text-center">
              <div className="w-20 h-20 bg-[#00D084]/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-[#00D084]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Configuração de Série</h3>
                <p className="text-gray-500 text-[10px] uppercase font-bold mt-2 tracking-widest">Defina o valor base da série de 6 cartelas</p>
              </div>
              
              <div className="bg-black/40 p-8 rounded-[2rem] border border-white/5">
                <label className="text-[10px] text-gray-500 uppercase font-black block mb-4">Preço por Série (R$)</label>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-3xl font-black text-white/40">R$</span>
                  <input 
                    type="number" 
                    value={seriesPrice} 
                    onChange={e => updateSeriesPrice(Number(e.target.value))} 
                    className="bg-transparent text-white font-black text-5xl outline-none w-40 text-center" 
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[10px] text-blue-400 font-bold uppercase">
                O usuário poderá escolher a quantidade (volume) baseado neste preço.
              </div>
            </div>
          </div>
        )}

        {tab === 'config' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-pop">
            <header className="mb-6">
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Configurações do Sistema</h2>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Ajuste visuais e financeiro</p>
            </header>

            <section className="bg-black/40 p-10 rounded-[3rem] border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h3 className="text-[#00D084] font-black text-xs uppercase tracking-widest">Financeiro</h3>
                <div className="space-y-2">
                   <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Chave PIX (Recebimentos)</label>
                   <input type="text" value={adminConfig.pixKey} onChange={e => updateAdminConfig('pixKey', e.target.value)} className="w-full bg-white/5 p-4 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#00D084]" placeholder="ex: pix@bingo.com" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] text-gray-500 uppercase font-black ml-1">WhatsApp para Saques</label>
                   <input type="text" value={adminConfig.withdrawWhatsapp} onChange={e => updateAdminConfig('withdrawWhatsapp', e.target.value)} className="w-full bg-white/5 p-4 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#00D084]" placeholder="ex: +5511999999999" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Bônus de Cadastro (R$)</label>
                   <input type="number" value={adminConfig.bonusAmount} onChange={e => updateAdminConfig('bonusAmount', Number(e.target.value))} className="w-full bg-white/5 p-4 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#00D084]" />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[#9D4EDD] font-black text-xs uppercase tracking-widest">Visual & Identidade</h3>
                <div className="space-y-2">
                   <label className="text-[10px] text-gray-500 uppercase font-black ml-1">URL Fundo (Login/Cadastro)</label>
                   <input type="text" value={adminConfig.bgLogin} onChange={e => updateAdminConfig('bgLogin', e.target.value)} className="w-full bg-white/5 p-4 rounded-xl text-white text-[10px] outline-none focus:ring-1 focus:ring-[#9D4EDD]" placeholder="Link da imagem..." />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] text-gray-500 uppercase font-black ml-1">URL Fundo (Sala de Jogo)</label>
                   <input type="text" value={adminConfig.bgRoom} onChange={e => updateAdminConfig('bgRoom', e.target.value)} className="w-full bg-white/5 p-4 rounded-xl text-white text-[10px] outline-none focus:ring-1 focus:ring-[#9D4EDD]" placeholder="Link da imagem..." />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] text-gray-500 uppercase font-black ml-1 block">Opacidade das Imagens: {Math.round(adminConfig.bgOpacity * 100)}%</label>
                   <input type="range" min="0" max="1" step="0.05" value={adminConfig.bgOpacity} onChange={e => updateAdminConfig('bgOpacity', Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#9D4EDD]" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Nomes para Bots (separados por vírgula)</label>
                   <textarea value={adminConfig.fakeNames} onChange={e => updateAdminConfig('fakeNames', e.target.value)} className="w-full bg-white/5 p-4 rounded-xl text-white text-[10px] outline-none focus:ring-1 focus:ring-[#9D4EDD] h-20" />
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-8 animate-pop">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Gestão de Usuários</h2>
               <button onClick={generateFakes} className="bg-[#00D084] text-white px-8 py-3 rounded-xl font-black text-xs shadow-lg shadow-green-500/20 uppercase tracking-widest">Gerar Jogadores Fake</button>
            </div>
            <div className="bg-black/40 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] text-gray-500 uppercase font-black tracking-widest"><tr><th className="p-8">Usuário</th><th>WhatsApp</th><th>Status</th><th>Saldo</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="text-white hover:bg-white/5 transition">
                      <td className="p-8">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-black text-[10px]">{u.username.charAt(0)}</div>
                           <span className="font-bold text-sm">{u.username}</span>
                        </div>
                      </td>
                      <td className="text-gray-400 text-xs">{u.whatsapp}</td>
                      <td>
                        {u.isFake ? (
                           <span className="text-[8px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-black uppercase">Sistema</span>
                        ) : (
                           <span className="text-[8px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-black uppercase">Real</span>
                        )}
                      </td>
                      <td className="text-[#00D084] font-black text-sm">R$ {u.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
