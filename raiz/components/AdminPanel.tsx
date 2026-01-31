
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { engine } from '../services/GameEngine';
import { GameStatus } from '../types';

const AdminPanel: React.FC = () => {
  const { logout, gameState, adminConfig, updateAdminConfig, users, financials, seriesConfigs, updateSeriesConfig, updateGameStatePrizes, transactions, autoSchedule, updateAutoSchedule, generateFakes } = useGame();
  const [tab, setTab] = useState('dash');

  const menu = [
    { id: 'dash', label: 'Dashboard', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'series', label: 'Séries A/B/C', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'agenda', label: 'Agenda', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'users', label: 'Usuários', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'config', label: 'Configurações', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37' }
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pop">
            {seriesConfigs.map(sc => (
              <div key={sc.id} className="bg-white/5 p-10 rounded-[3rem] border border-white/10 space-y-6">
                <h3 className="text-2xl font-black text-white">{sc.name}</h3>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black block mb-1">Preço (R$)</label>
                  <input type="number" value={sc.price} onChange={e => updateSeriesConfig(sc.id, 'price', Number(e.target.value))} className="w-full bg-black/20 p-4 rounded-xl text-white font-black" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black block mb-1">Qtd Cartelas</label>
                  <input type="number" value={sc.quantity} onChange={e => updateSeriesConfig(sc.id, 'quantity', Number(e.target.value))} className="w-full bg-black/20 p-4 rounded-xl text-white font-black" />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'config' && (
          <div className="max-w-4xl space-y-8 animate-pop">
            <section className="bg-black/40 p-10 rounded-[3rem] border border-white/10 grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-white font-black">Financeiro</h3>
                <input type="text" value={adminConfig.pixKey} onChange={e => updateAdminConfig('pixKey', e.target.value)} className="w-full bg-white/5 p-4 rounded-xl text-white" placeholder="Chave PIX" />
                <input type="text" value={adminConfig.withdrawWhatsapp} onChange={e => updateAdminConfig('withdrawWhatsapp', e.target.value)} className="w-full bg-white/5 p-4 rounded-xl text-white" placeholder="Whats Saques" />
              </div>
              <div className="space-y-4">
                <h3 className="text-white font-black">Visual</h3>
                <input type="text" value={adminConfig.bgLogin} onChange={e => updateAdminConfig('bgLogin', e.target.value)} className="w-full bg-white/5 p-4 rounded-xl text-white text-[10px]" placeholder="URL BG Login" />
                <input type="range" min="0" max="1" step="0.1" value={adminConfig.bgOpacity} onChange={e => updateAdminConfig('bgOpacity', Number(e.target.value))} className="w-full" />
              </div>
            </section>
            <section className="bg-black/40 p-10 rounded-[3rem] border border-white/10">
              <h3 className="text-white font-black mb-4">Social/Doação</h3>
              <input type="text" value={adminConfig.donationInstitution} onChange={e => updateAdminConfig('donationInstitution', e.target.value)} className="w-full bg-white/5 p-4 rounded-xl text-white" placeholder="Instituição Beneficiada" />
            </section>
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-8 animate-pop">
            <button onClick={generateFakes} className="bg-[#00D084] text-white px-8 py-3 rounded-xl font-black text-xs">GERAR BOTS</button>
            <div className="bg-black/40 rounded-[2rem] border border-white/10 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] text-gray-500 uppercase font-black"><tr><th className="p-6">Usuário</th><th>WhatsApp</th><th>Saldo</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="text-white text-sm">
                      <td className="p-6 font-bold">{u.username} {u.isFake && <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded ml-2">BOT</span>}</td>
                      <td className="text-gray-400">{u.whatsapp}</td>
                      <td className="text-[#00D084] font-black">R$ {u.balance.toFixed(2)}</td>
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
