
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const Auth: React.FC = () => {
  const [authMode, setAuthMode] = useState<'PLAYER' | 'ADMIN'>('PLAYER');
  const [isLogin, setIsLogin] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    whatsapp: '',
    cpf: '',
    password: '',
    confirmPassword: ''
  });
  
  const { login, register, adminLogin, adminConfig } = useGame();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'ADMIN') {
      const ok = await adminLogin(adminPassword);
      if (!ok) alert('Senha Administrativa Incorreta!');
      return;
    }

    if (isLogin) {
      const ok = await login(formData.whatsapp, formData.password);
      if (!ok) {
        alert('Usuário não encontrado ou senha incorreta. Se você é novo, clique em "Cadastre-se".');
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert('As senhas não conferem');
        return;
      }
      const ok = await register(formData);
      if (ok) alert('Cadastro realizado com sucesso! Bem-vindo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 py-12 bg-[#0F0F1E]">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 pointer-events-none"
        style={{ backgroundImage: `url(${adminConfig.bgLogin})`, opacity: adminConfig.bgOpacity }}
      />
      
      <div className="z-10 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 border border-white/10 animate-pop">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#00D084] to-[#9D4EDD] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">BINGO MASTER</h1>
          <div className="h-1 w-12 bg-[#00D084] mx-auto rounded-full"></div>
        </div>

        <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/5">
          <button 
            onClick={() => setAuthMode('PLAYER')}
            className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all ${authMode === 'PLAYER' ? 'bg-[#00D084] text-white' : 'text-gray-500'}`}
          >
            JOGADOR
          </button>
          <button 
            onClick={() => setAuthMode('ADMIN')}
            className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all ${authMode === 'ADMIN' ? 'bg-[#FF6B35] text-white' : 'text-gray-500'}`}
          >
            ADMIN
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === 'PLAYER' ? (
            <>
              {!isLogin && (
                <div className="animate-pop">
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1 ml-1">Nome Completo</label>
                  <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-[#00D084] text-white text-sm" onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
              )}
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1 ml-1">WhatsApp</label>
                <input type="tel" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-[#00D084] text-white text-sm" placeholder="(00) 00000-0000" onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1 ml-1">Senha</label>
                <input type="password" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-[#00D084] text-white text-sm" onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              {!isLogin && (
                <div className="animate-pop">
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1 ml-1">Confirmar Senha</label>
                  <input type="password" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-[#00D084] text-white text-sm" onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                </div>
              )}
              
              <button type="submit" className={`w-full py-4 rounded-xl text-white font-black text-xs shadow-lg transform active:scale-95 transition-all mt-4 ${isLogin ? 'bg-[#00D084]' : 'bg-[#9D4EDD]'}`}>
                {isLogin ? 'ENTRAR AGORA' : 'CRIAR CONTA'}
              </button>

              <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-[9px] font-black text-gray-500 uppercase hover:text-white transition-colors">
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça Login'}
              </button>
            </>
          ) : (
            <div className="animate-pop space-y-4">
              <input 
                type="password" required autoFocus placeholder="Senha Admin"
                className="w-full bg-white/5 border border-white/10 py-4 rounded-xl text-white text-center outline-none focus:ring-1 focus:ring-[#FF6B35] font-black text-lg tracking-widest"
                onChange={e => setAdminPassword(e.target.value)}
              />
              <button type="submit" className="w-full bg-[#FF6B35] py-4 rounded-xl text-white font-black text-xs shadow-lg">
                ACESSAR PAINEL
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Auth;
