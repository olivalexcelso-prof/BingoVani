
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const Auth: React.FC = () => {
  const [authMode, setAuthMode] = useState<'PLAYER' | 'ADMIN'>('PLAYER');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [formData, setFormData] = useState({ fullName: '', whatsapp: '', cpf: '', password: '', confirmPassword: '' });
  
  const { login, register, adminLogin, adminConfig } = useGame();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'ADMIN') {
        if (await adminLogin(adminPass)) return;
        alert('Senha Admin Incorreta!');
      } else if (isLogin) {
        if (await login(formData.whatsapp, formData.password)) return;
        alert('Dados inválidos ou usuário não cadastrado!');
      } else {
        if (formData.password !== formData.confirmPassword) { alert('As senhas não coincidem!'); return; }
        if (await register(formData)) { alert('Cadastrado com sucesso!'); } else { alert('WhatsApp já cadastrado!'); }
      }
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, val: string) => setFormData(p => ({ ...p, [field]: val }));

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6 bg-[#0F0F1E]">
      <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000" style={{ backgroundImage: `url(${adminConfig.bgLogin})`, opacity: adminConfig.bgOpacity }} />
      
      <div className="z-10 bg-white/10 backdrop-blur-3xl rounded-[3rem] w-full max-w-md p-10 border border-white/20 shadow-2xl animate-pop">
        <header className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00D084] to-[#9D4EDD] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">BINGO MASTER</h1>
          <p className="text-[10px] text-[#00D084] font-black uppercase tracking-widest mt-1">Versão Professional v2.0</p>
        </header>

        <div className="flex bg-black/40 p-1 rounded-2xl mb-8 border border-white/5">
          <button onClick={() => setAuthMode('PLAYER')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${authMode === 'PLAYER' ? 'bg-[#00D084] text-white shadow-lg' : 'text-gray-500'}`}>PLAYER</button>
          <button onClick={() => setAuthMode('ADMIN')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${authMode === 'ADMIN' ? 'bg-[#FF6B35] text-white shadow-lg' : 'text-gray-500'}`}>ADMIN</button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === 'PLAYER' ? (
            <>
              {!isLogin && (
                <div className="animate-pop">
                  <label className="text-[9px] text-gray-500 font-black uppercase mb-1 ml-1 block">Nome Completo</label>
                  <input type="text" required value={formData.fullName} onChange={e => update('fullName', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:ring-1 focus:ring-[#00D084]" />
                </div>
              )}
              <div>
                <label className="text-[9px] text-gray-500 font-black uppercase mb-1 ml-1 block">WhatsApp</label>
                <input type="tel" required value={formData.whatsapp} onChange={e => update('whatsapp', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:ring-1 focus:ring-[#00D084]" placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 font-black uppercase mb-1 ml-1 block">Senha</label>
                <input type="password" required value={formData.password} onChange={e => update('password', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:ring-1 focus:ring-[#00D084]" />
              </div>
              {!isLogin && (
                <div className="animate-pop">
                  <label className="text-[9px] text-gray-500 font-black uppercase mb-1 ml-1 block">Confirmar Senha</label>
                  <input type="password" required value={formData.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:ring-1 focus:ring-[#00D084]" />
                </div>
              )}
              
              <button disabled={loading} type="submit" className={`w-full py-4 rounded-xl text-white font-black text-xs shadow-xl transition-all mt-4 ${isLogin ? 'bg-[#00D084]' : 'bg-[#9D4EDD]'}`}>
                {loading ? 'Aguarde...' : isLogin ? 'ENTRAR NO BINGO' : 'CRIAR MINHA CONTA'}
              </button>
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-[9px] font-black text-gray-500 uppercase hover:text-white transition-colors py-2">{isLogin ? 'Novo por aqui? Cadastre-se' : 'Já tem conta? Login'}</button>
            </>
          ) : (
            <div className="space-y-4 animate-pop">
              <input type="password" required autoFocus value={adminPass} onChange={e => setAdminPass(e.target.value)} className="w-full bg-white/5 border border-white/10 py-5 rounded-xl text-white text-center text-2xl font-black tracking-widest outline-none" placeholder="SENHA ADMIN" />
              <button disabled={loading} type="submit" className="w-full bg-[#FF6B35] py-4 rounded-xl text-white font-black text-xs shadow-xl">ACESSAR PAINEL</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Auth;
