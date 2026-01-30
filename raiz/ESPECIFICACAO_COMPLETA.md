# 🎰 BINGO MASTER - ESPECIFICAÇÃO TÉCNICA COMPLETA

**Data:** 30 de Janeiro de 2026  
**Versão:** 1.0  
**Status:** Pronto para Implementação

---

## 📋 ÍNDICE EXECUTIVO

Este documento consolida TODA a especificação do Bingo Master em um único prompt à prova de erros, removendo duplicatas e organizando por módulos de implementação.

### Módulos Principais:
1. **Autenticação & Login** (Item 01)
2. **Sala de Bingo** (Item 02)
3. **Sistema Financeiro** (Itens 03-06)
4. **Motor de Sorteio** (Item 07)
5. **Premiação & Ranking** (Itens 08-10)
6. **Painel Administrativo** (Item 14)
7. **Configurações & Imagens** (Item 12)
8. **Programação de Partidas** (Item 13)
9. **Narração TTS** (Item 15)
10. **Usuários Fake & Doações** (Função especial)

---

## 🔐 MÓDULO 1: AUTENTICAÇÃO & LOGIN

### Layout
- **Fundo:** Imagem configurável pelo painel admin (50% transparência)
- **Container:** Balão branco semi-transparente com sombra
- **Abas:** "Login" (padrão) e "Cadastro"

### Aba Login
- Título: "LOGIN"
- Campo WhatsApp (formato telefone)
- Campo Senha (password)
- Link "Fazer Cadastro"
- Botão "Entrar" (verde, grande)

### Aba Cadastro
- Título: "CADASTRO"
- Campo Nome Completo
- Campo WhatsApp (formato telefone)
- Campo CPF (máscara 000.000.000-00)
- Campo Senha (password)
- Campo Confirmar Senha (password)
- Botão "Cadastrar" (azul, grande)
- Link "Já tenho conta"

### Botão Admin
- Localização: Canto inferior direito
- Aparência: Botão pequeno cinza "Admin"
- Ao clicar: Abre modal com:
  - Campo "Usuário" (preenchido com "admin" readonly)
  - Campo "Senha" (input password)
  - Botão "Acessar Painel"
- **Credenciais fixas:** admin / 132435B

### Backend
- Login: Valida WhatsApp + senha
- Cadastro: Valida CPF, senhas iguais, WhatsApp único
- Admin: Verifica senha fixa 132435B
- Redirecionamentos: Login/Cadastro → Sala Bingo | Admin → Painel Admin

---

## 🎮 MÓDULO 2: SALA DE BINGO

### Layout (Organização em Seções)
1. **Topo (20%):** Painel fixo, fundo escuro semi-transparente
2. **Central (25%):** Tubo de bolas horizontal
3. **Inferior (55%):** Cartelas (esquerda) + Ranking (direita)

### Painel Superior
- **Arrecadação:** Quadra, Linha, Bingo, Bingo Acumulado (valores)
- **Prêmio Atual:** "EM DISPUTA: [QUADRA/LINHA/BINGO]"
- **Contador:** "00/75" (verde 0-40, vermelho 41-75) com label "ACUMULADO"
- **Botão "COMPRAR":** Saldo ≥R$3 → Compra | Saldo <R$3 → Depósito PIX
- **Ícone Compra Séries:** Visível ao lado do botão COMPRAR

### Tubo de Bolas
- **Bola atual:** Grande (10% largura), número visível, cor vibrante
- **Tubo:** Vidro transparente, bolas menores (30%), movimento esquerda→direita
- **Acúmulo:** 10 bolas, depois sai pela direita

### Cartelas do Usuário
- Display: "SUAS SÉRIES: [número]"
- Grade 5x5 por cartela (15 números + 12 espaços)
- Marcas automáticas sincronizadas
- Ordenadas: Mais marcadas primeiro
- Scroll se necessário
- **Controle personalização:** Canto inferior esquerdo (ícone engrenagem)
  - Slider tamanho cartelas
  - Seletor cor bolas
  - Seletor cor fundo
  - Contraste automático garantido

### Ranking
- Título: "MAIS PRÓXIMOS DE GANHAR"
- Formato: "Nome: ⚫ 15 ⚫ 42" (bolas faltando)
- Ordenado: Menos bolas faltando primeiro
- Tempo real, até 6 linhas
- Mesmo jogador pode aparecer múltiplas vezes

### Funcionalidades Tempo Real
- Sincronização: Narração TTS + Marcação + Ranking
- Vitória: Para 3-4s, balão "Parabéns [Nome]! [Prêmio]", narração, crédito automático
- Transições: Quadra → Linha → Bingo automático

### Elementos
- Fundo: Imagem 50% transparência
- Ícone Perfil (superior direito) → Extrato/Saldo
- Ícone Saque (painel) → Modal Saque
- Ícone Admin (inferior direito) → Login Admin

### Conexões
- Botão COMPRAR → Item 03
- Sem saldo → Item 04
- Perfil → Item 05
- Saque → Item 06
- Admin → Item 01

---

## 💰 MÓDULO 3: SISTEMA FINANCEIRO

### Item 03: Modal Compra de Séries

**Quando Aparece:**
- Clique botão "COMPRAR" (Sala Bingo)
- Validação: Saldo ≥ R$3,00
- Se <R$3,00: Abre Modal PIX (Item 04)

**Layout:**
- Centralizado, 70% largura × 60% altura (responsivo)
- Overlay escuro semi-transparente

**Conteúdo:**

**Seção 1 - Saldo:**
- "SEU SALDO ATUAL: R$ [valor]"
- Botão "DEPOSITAR MAIS" → Modal PIX

**Seção 2 - Séries Disponíveis:**
- Título: "ESCOLHA SUA SÉRIE"
- Radio buttons (seleção única):
  - SÉRIE A - R$ [preço_admin]
  - SÉRIE B - R$ [preço_admin]
  - SÉRIE C - R$ [preço_admin]
- Preços em TEMPO REAL do admin

**Seção 3 - Resumo Dinâmico:**
- "SÉRIE SELECIONADA: [NOME]"
- "VALOR: R$ [PREÇO]"
- "NOVO SALDO: R$ [saldo - preço]"
- Se novo saldo < 0: Texto vermelho "SALDO INSUFICIENTE"

**Seção 4 - Botões:**
- "CANCELAR" (fecha modal)
- "COMPRAR AGORA" (verde, grande, só ativo se saldo suficiente + série selecionada)

**Processo de Compra:**
1. Verifica saldo ≥ R$3,00
2. Usuário seleciona série
3. Sistema calcula em tempo real
4. Clique "COMPRAR AGORA":
   - Deduz saldo
   - Adiciona cartela(s)
   - Fecha modal
   - Atualiza Sala tempo real

**Validações:**
- Saldo mínimo R$3,00 para abrir modal
- Pode usar TODO saldo para compra
- Depósito mínimo R$3,00 (Item 04)

**Backend:**
- GET `/api/series/prices` → Preços admin
- POST `/api/series/purchase` → Valida, processa, gera cartela
- WebSocket: Notifica atualização tempo real

---

### Item 04: Modal Depósito PIX

**Quando Aparece:**
- Botão "DEPOSITAR" (Item 03) quando saldo < R$3,00
- Botão "RECARREGAR SALDO" em outra interface
- Acesso direto do usuário

**Layout:**
- Centralizado, 80% largura × 70% altura
- Duas colunas: QR Code (esquerda) + Informações (direita)

**Coluna Esquerda:**
- QR Code grande (gerado dinamicamente)
- Legenda: "Escaneie com seu aplicativo de banco"

**Coluna Direita:**
- Título: "DEPÓSITO VIA PIX"
- "VALOR MÍNIMO: R$ 3,00"
- Campo Valor: Input numérico, validação ≥ R$3,00
- Chave PIX: Campo texto (não editável), Botão "COPIAR"
- Instruções: Escanear QR OU copiar chave → Enviar valor → Aguardar confirmação

**Botões:**
- "CANCELAR" (fecha modal)
- "JÁ ENVIEI O PIX" (inicia verificação manual)

**Processo:**
1. Usuário abre modal
2. Sistema mostra QR Code + chave do admin
3. Usuário escaneia/copia e faz pagamento
4. Dois fluxos:
   - **A) Automático:** Webhook confirma → saldo atualizado
   - **B) Manual:** "JÁ ENVIEI" → admin confirma depois

**Validações:**
- Valor mínimo R$3,00
- Chave PIX obrigatória (admin)
- QR Code inclui chave + valor (se preenchido)

**Resultado Pós-Confirmação:**
- Modal fecha automaticamente
- Saldo atualizado tempo real (Sala Bingo)
- Notificação: "Depósito de R$ [valor] confirmado!"
- Se vinha do Item 03: Reabre modal de compra

**Endpoints:**
- GET `/api/pix/config` → Chave admin
- POST `/api/pix/webhook` → Confirmação automática
- POST `/api/pix/deposit` → Depósito manual (admin confirma)
- Geração QR: `qrcode.generate(chave_pix + valor)`

---

### Item 05: Página Perfil/Extrato

**Como Acessar:**
- Ícone de perfil (Sala Bingo, canto superior direito) → Nova view/tab

**Layout:**
- Fundo: Imagem admin (transparência ajustável)
- Design: Minimalista, limpo
- Responsivo: Scroll vertical simples
- Cabeçalho: "MINHA CONTA" (fixo topo)

**Conteúdo (3 elementos principais):**

**1. Saldo Atual (Card Superior):**
- "SALDO DISPONÍVEL: R$ [valor]"
- Fundo verde claro
- Botão "SAQUE" → Modal Saque (Item 06)

**2. Botão "RETIRAR BÔNUS" (Card Especial):**
- Entre Saldo e Premiações
- Destacado (cor diferente)
- Ao clicar: Credita valor admin
- Valor do bônus: Configurável admin
- Limite: Uma vez por usuário

**3. Histórico de Premiações (Seção Meio):**
- Título: "PRÊMIOS GANHOS"
- Lista vertical (mais recente primeiro):
  - [DATA] - BINGO - R$ 150,00 ✅
  - [DATA] - LINHA - R$ 50,00 ✅
  - [DATA] - QUADRA - R$ 20,00 ✅
- Cada item: data, tipo, valor, ícone confirmado
- Scroll infinito se muitas

**4. Histórico de Saques (Seção Inferior):**
- Título: "SAQUES SOLICITADOS"
- Lista vertical:
  - [DATA] - R$ 100,00 ⏳ (pendente - amarelo)
  - [DATA] - R$ 50,00 ✅ (pago - verde)
  - [DATA] - R$ 30,00 ❌ (cancelado - vermelho)
- Status com ícones/cores

**Elementos QUE NÃO TEM:**
- ❌ Edição de perfil
- ❌ Alteração de senha
- ❌ Lista de cartelas/compras
- ❌ Filtros complexos
- ❌ Gráficos/estatísticas

**Endpoints:**
- GET `/api/user/balance-history` → Premiações + saques (data decrescente)
- POST `/api/bonus/claim` → Valida, credita, registra
- WebSocket: Atualização tempo real de prêmios

**Responsividade Mobile:**
- Uma coluna vertical
- Cards com padding adequado
- Fontes legíveis
- Botões ≥44×44 pixels
- Scroll suave

---

### Item 06: Modal Saque

**Layout:**
- Centralizado, 85% largura × 60% altura (mobile: 90% × 70%)
- Overlay escuro (#00000080)
- Card branco, bordas 12px, sombra média

**Cabeçalho:**
- Ícone: 💰 (superior esquerdo)
- Título: "SOLICITAR SAQUE"
- Sub-título: "O saque pode ser instantâneo ou demorar até 40 minutos"
- Botão Fechar: "X" (superior direito)

**Formulário (Vertical):**

**1. Nome no PIX:**
- Label: "Nome cadastrado no PIX*"
- Input texto, placeholder "Como aparece no seu app do banco"
- Validação: Mínimo 3 caracteres

**2. CPF:**
- Label: "CPF*"
- Máscara: 000.000.000-00
- Validação: CPF válido (mesmo do cadastro)

**3. WhatsApp:**
- Label: "WhatsApp para confirmação*"
- Máscara: (00) 00000-0000
- Validação: Número válido

**4. Senha do Usuário:**
- Label: "Sua senha*"
- Input password
- Validação: Confere com cadastro

**5. Valor do Saque:**
- Label: "Valor a sacar*"
- Input numérico, prefixo "R$ "
- Validação: ≤ saldo, > 0

**6. Saldo Informativo:**
- "Saldo disponível: R$ [valor]"
- "Saldo após saque: R$ [saldo - valor]" (tempo real)

**Botões (Rodapé):**
- "CANCELAR" (cinza, 40% largura) → Fecha modal
- "SOLICITAR SAQUE" (verde, 55% largura) → Ativo se tudo OK

**Processo "SOLICITAR SAQUE":**
1. Validação: CPF, senha, saldo
2. Se OK:
   - Deduz saldo IMEDIATAMENTE
   - Cria registro "SAQUE SOLICITADO"
   - Envia WhatsApp admin (template com dados)
3. Fecha modal (2s)
4. Notificação: "Saque solicitado! Aguarde processamento."

**Mensagem WhatsApp:**
```
NOVA SOLICITAÇÃO DE SAQUE
Nome: [Nome no PIX]
CPF: [CPF]
WhatsApp: [WhatsApp]
Valor: R$ [valor]
Data: [data/hora]
```

**Endpoint:**
- POST `/api/withdraw/request`
- Verifica: senha hash, CPF, saldo
- Ações: subtrai saldo, registra transação (PENDENTE), dispara WhatsApp

**Responsividade Mobile:**
- Uma coluna vertical
- Inputs ≥44px altura
- Labels acima inputs
- Botões full width
- Teclado numérico para valor

---

## 🎲 MÓDULO 4: MOTOR DE SORTEIO (Item 07)

### Responsável pelo Sorteio
- A PRÓPRIA APLICAÇÃO (backend Node.js/Express)
- ZERO CUSTO - Sem APIs externas
- Hardware próprio - Seu servidor executa

### Implementação Técnica (Backend)

**Algoritmo Sorteio Local:**
```javascript
class SorteioBingo {
  private numerosSorteados: number[] = [];
  private numerosDisponiveis: number[] = Array.from({length: 90}, (_, i) => i + 1);
  
  sortearProximaBola(): number {
    if (this.numerosDisponiveis.length === 0) {
      throw new Error('Todas as bolas já foram sorteadas');
    }
    
    const randomIndex = Math.floor(Math.random() * this.numerosDisponiveis.length);
    const numeroSorteado = this.numerosDisponiveis[randomIndex];
    
    this.numerosDisponiveis.splice(randomIndex, 1);
    this.numerosSorteados.push(numeroSorteado);
    
    return numeroSorteado;
  }
  
  reiniciarSorteio(): void {
    this.numerosSorteados = [];
    this.numerosDisponiveis = Array.from({length: 90}, (_, i) => i + 1);
  }
}
```

### Características
- Aleatoriedade verdadeira: Math.random()
- Sem repetição: Números únicos
- Faixa 01-90: Padrão bingo
- 75 bolas por partida

### Processo Completo

**A. Iniciação:**
1. Admin agenda partida
2. Sistema cria SorteioBingo
3. Timer inicia contagem

**B. Execução (ZERO CUSTO):**
1. Intervalo: 5-15s (admin)
2. Cada intervalo:
   - sortearProximaBola() (local)
   - Broadcast WebSocket
3. Processos acionados:
   - Marcação cartelas
   - Atualização ranking
   - Narração TTS
   - Verificação prêmios

**C. Pausas Inteligentes:**
- Para anúncios: 3 segundos
- Retomada automática
- Sincronização estado

### Infraestrutura 100% Local
- Node.js/Express (seu)
- Banco dados local
- WebSocket nativo (ws/socket.io)

### Endpoint Sorteio
```typescript
POST /api/game/:id/draw
- Apenas admin/automático
- Sorteio local (gratuito)
- Broadcast WebSocket
- Resposta sucesso
```

### Controles Admin
**Durante Partida:**
- Visualização tempo real
- Botão "Sortear Próxima" (testes)
- Pausa/Retomada
- Velocidade (5-15s)

**Configurações:**
- Intervalo padrão
- Quantidade bolas: 75 (configurável)
- Regras sorteio: Controláveis

### Vantagens Sorteio Local
1. Custo zero
2. Controle total
3. Independência
4. Performance (latência mínima)
5. Personalização

---

## 🏆 MÓDULO 5: PREMIAÇÃO & RANKING

### Item 08: Sistema de Premiação

**Layout Sala de Bingo (Painel Superior):**
- 4 colunas igualmente distribuídas
- Conteúdo por coluna:
  1. Nome prêmio (Quadra/Linha/Bingo/Acumulado)
  2. Valor monetário atual
  3. Status ("EM DISPUTA" ou "AGUARDANDO")
- Design: Limpo, sem cálculos/porcentagens visíveis

**Backend - Lógica Funcional:**

**1. Cálculo dos Prêmios:**
- Cada prêmio: porcentagem configurável admin
- Cálculo baseado em arrecadação total
- Tempo real durante vendas

**2. Bingo Acumulado:**
- Acumula se ninguém vence com ≤40 bolas
- Soma ao longo de múltiplas partidas
- Reseta quando alguém vence com ≤40 bolas
- Porcentagem separada (admin)

**3. Fluxo da Partida:**
- Sistema gerencia qual prêmio está em disputa
- Transições automáticas com validação de vencedor
- Valores atualizam conforme vendas

**4. Crédito Automático:**
- Prêmio creditado automaticamente ao validar vencedor
- Saldo ganhador atualizado tempo real
- Histórico registrado

**Configurações (Painel Admin):**
- Interface para 4 porcentagens (Quadra, Linha, Bingo, Acumulado)
- Aplicadas a todas partidas subsequentes
- Sem informação de cálculo no jogador

**Regras Importantes:**
1. Jogadores veem apenas valores finais
2. Porcentagens: configuração interna admin
3. Acumulado persiste entre partidas até resgate
4. Todos créditos automáticos e registrados

---

### Item 09: Sistema de Cartelas

**Controles de Personalização (Discretos):**
- Localização: Canto inferior esquerdo (ícone engrenagem pequeno)
- Menu flutuante:
  1. Slider "Tamanho das cartelas" (pequeno → grande)
  2. Seletor cor bolas (paleta básica)
  3. Seletor cor fundo (paleta básica)
- Garantia: Contraste automático para legibilidade

**Visualização das Cartelas:**
- Layout: Grid 3×9 (27 células)
- Conteúdo: 15 números + 12 espaços
- Organização: Colunas por faixa de dezenas
- Distribuição: Aleatória mas organizada
- Responsividade: Tamanho ajustável usuário

**Backend - Geração e Lógica:**

**1. Geração Cartelas Únicas:**
- Algoritmo: Combinações matemáticas únicas
- Garantia: Sem duplicação no sistema
- Distribuição: Respeita faixas por colunas

**2. Sistema de Marcação:**
- Sincronização: Perfeita com narração tempo real
- Feedback: Animação sutil ao marcar

**3. Ordenação Inteligente:**
- Ranking automático: Cartelas mais próximas primeiro
- Critério: Números marcados vs padrões vitória
- Atualização: Contínua durante sorteio

**4. Detecção Múltiplos Ganhadores:**
- Verificação: Simultânea todas cartelas
- Divisão: Equitativa entre ganhadores
- Anúncio: Coletivo com todos nomes

**5. Gerenciamento Anúncio:**
- Tempo: 3-4 segundos (conforme ganhadores)
- Apresentação: Lista vertical nomes no balão
- Narração: Adaptada para "múltiplos ganhadores"

**Funcionalidades:**

**Para Usuário:**
- Personalização visual discreta
- Visualização clara progresso
- Feedback imediato marcação
- Ranking intuitivo cartelas

**Para Sistema:**
- Geração cartelas únicas garantida
- Verificação eficiente padrões
- Suporte múltiplos ganhadores
- Sincronização com todos sistemas

---

### Item 10: Sistema de Ranking

**Posicionamento:**
- Abaixo do sistema de bolas cantadas
- Mesma largura que túbulo
- Altura: até 6 linhas

**Design Container:**
- Fundo semi-transparente escuro
- Bordas arredondadas suaves
- Padding adequado legibilidade

**Elementos por Linha:**
1. Indicador posição (medalha primeiros)
2. Nome jogador (truncado se necessário)
3. Visualização bolas faltando (círculos pequenos)
4. Números dentro círculos

**Backend - Lógica:**

**1. Coleta Dados:**
- Monitora cartelas ativas tempo real
- Rastreia progresso individual
- Identifica números faltando para padrões vencedores

**2. Critérios Ordenação:**
1. Primário: Menor quantidade números faltando
2. Secundário: Padrão mais avançado (bingo > linha > quadra)
3. Terciário: Tempo compra (desempate)

**3. Atualização Tempo Real:**
- Recalcula após cada bola
- WebSocket para todos jogadores
- Sincronia perfeita com marcação

**4. Regras Exibição:**
- Máximo 6 jogadores
- Mesmo jogador pode aparecer múltiplas vezes (múltiplas cartelas bem posicionadas)
- Nomes truncados para espaço

**5. Processo Cálculo:**
1. Para cada cartela: calcula faltantes
2. Agrupa por jogador (melhores posições)
3. Ordena pela lógica
4. Prepara exibição
5. Transmite interface

**Responsividade Mobile:**
- 4 linhas em telas pequenas
- Ajuste automático fonte
- Layout vertical simples
- Toque expandir detalhes (opcional)

---

## ⚙️ MÓDULO 6: PAINEL ADMINISTRATIVO (Item 14)

### Acesso e Layout Base
- Login obrigatório: admin / 132435B
- Layout: Dashboard menu lateral + área principal
- Menu categorizado: Controle Jogo, Financeiro, Configurações, Usuários

### Seção 1: Controle do Jogo

**A. Programação Partidas (Item 13):**
- Aba "Automática": Hora início, Intervalo, Hora término, Preço séries
- Botão "GERAR PROGRAMAÇÃO"
- Aba "Manuais": Data/Hora, Preço séries
- Botão "INSERIR NOVA PARTIDA"
- Regra: Substitui automática mesmo horário
- Lista com indicador substituição

**B. Configuração Prêmios (Item 08):**
- 4 campos porcentagem: Quadra, Linha, Bingo, Acumulado
- Validação: Soma 100%
- Botão "SALVAR PORCENTAGENS"

**C. Controle Sorteio Ativo:**
- Visualização tempo real: Bolas, próximo sorteio
- Controles: Pausar/Retomar, Velocidade (5-15s)
- Botão "SORTEAR PRÓXIMA" (manual)

### Seção 2: Financeiro

**A. Depósitos/PIX (Item 04):**
- Campo: "CHAVE PIX PARA DEPÓSITOS"
- Instrução: Aparece modal usuários
- Botão "SALVAR CHAVE PIX"

**B. Saques (Item 06):**
- Campo: "WHATSAPP NOTIFICAÇÕES SAQUE"
- Formato: (00) 00000-0000
- Lista saques pendentes: Nome, CPF, Valor, Data, Status
- Ações: "PAGO" ou "CANCELADO"

**C. Bônus (Item 05):**
- Campo: "VALOR BÔNUS CADASTRO"
- Valor monetário
- Botão "SALVAR VALOR"

### Seção 3: Configurações Sistema

**A. Imagens (Item 12):**
- Logo Principal: Upload + preview + tamanho
- Favicon: Upload + preview
- Fundos por página (4): Upload + slider transparência
  - Login/Cadastro
  - Sala Bingo
  - Perfil/Extrato
  - Painel Admin
- Propaganda Chat: Upload (futuro)
- Cada: Botão "ALTERAR" + preview

**B. Preços Séries (Item 03):**
- Tabela editável:
  - Série A: R$ [input]
  - Série B: R$ [input]
  - Série C: R$ [input]
- Botão "SALVAR PREÇOS"
- Nota: Aparecem modal compra

### Seção 4: Gerenciamento Usuários

**A. Crédito Manual (Item 03/05):**
- Dropdown usuários
- Input valor
- Botão "CREDITAR SALDO"
- Registro automático histórico

**B. Jogadores Fake:**
- Botão "CRIAR JOGADOR FAKE"
- Gera automaticamente:
  - Nome aleatório
  - WhatsApp fake
  - CPF válido fake
  - Senha padrão
  - Saldo: R$0,00
- Lista fake com opção excluir

**C. Venda Direta Séries (Item 03):**
- Passo 1: Selecionar usuário
- Passo 2: Tipo série (A, B, C)
- Passo 3: Confirmar preço
- Botão "VENDER SÉRIE"
- Efeito: Deduz saldo, adiciona cartelas

### Seção 5: Relatórios e Monitoramento

**A. Dashboard Inicial:**
- Métricas tempo real:
  - Usuários online
  - Partida atual: status, bolas, prêmios
  - Arrecadação dia
  - Saques pendentes

**B. Histórico Partidas:**
- Lista todas partidas
- Filtros: data, tipo (auto/manual)
- Detalhes: horário, ganhadores, arrecadação

**C. Transações Financeiras:**
- Depósitos confirmados
- Saques processados
- Prêmios pagos
- Filtro período

**D. Relatórios (Função Especial):**
- Filtros período: Diário, Semanal, Mensal
- Calendário personalizado
- Tabela:
  - PARTIDA Nº (sequencial 001+)
  - ARREC. BRUTA
  - ARREC. LÍQUIDA
  - PRÊMIOS PAGOS (tipo: valor - ganhador)
  - ACUMULADO
- Rodapé:
  - TOTAL BRUTO
  - TOTAL LÍQUIDO
  - TOTAL PRÊMIOS PAGOS
  - TOTAL ACUMULADO
  - LUCRO LÍQUIDO
- Botão impressão (uma página)
- Exportação simples

### Seção 6: Narração (Item 15)
- Slider volume global (0-100%)
- Botão "TESTAR NARRAÇÃO"
- Indicador "TTS Ativo/Inativo"

### Seção 7: Segurança

**A. Log Ações Admin:**
- Registro automático alterações
- Colunas: Data/Hora, Admin, Ação, Detalhes
- Apenas visualização

**B. Bloqueio Usuários:**
- Opção "BLOQUEAR" lista
- Bloqueado: sem login
- Motivo registrado

### Responsividade
- Menu colapsável mobile
- Grid adaptativo
- Botões touch-friendly
- Confirmações modais (críticas)

### Validações
- Frontend: Porcentagens 100%, horários válidos, preços >0, formatos
- Backend: Auth admin, auditoria, rate limiting

---

## 🎤 MÓDULO 7: NARRAÇÃO TTS (Item 15)

### Características Voz
- Gênero: Feminina
- Tom: Vibrante (não escandalosa)
- Entonações:
  - Sorteio: Neutra/clara
  - Premiação: Alegre/entusiasmada
  - Alertas: Preocupada/urgente
  - Início partida: Empolgada

### Eventos Narrados

**1. Sorteio:**
- Disparo: Cada bola sorteada
- Mensagem: "Bola número [XX]"
- Frequência: Sincronizada com intervalo
- Prioridade: Alta

**2. Premiação:**
- Disparo: Detecta vencedor(es)
- Mensagens:
  - Quadra/Linha: "Parabéns [Nome], você ganhou a [quadra/linha]!"
  - Bingo: "Bingo! Parabéns [Nome]!"
  - Múltiplos: "Temos múltiplos ganhadores! Parabéns a todos!"
- Entonação: Alegre, comemorativa

**3. Alertas Partida:**
- Disparo: 180, 120, 60s antes início
- Mensagem: "Compre suas séries, já vai começar!"
- Entonação: Preocupada/urgente

**4. Outros Eventos:**
- Início: "A partida está começando!"
- Fim: "Partida encerrada!"
- Erros: "Aguarde, reconectando..."

### Sincronização Técnica

**Com Sorteio:**
- WebSocket: "ball_drawn" → Narração imediata
- Latência máxima: <500ms
- Buffer pequeno: Ordem correta

**Com Premiação:**
- Evento: "winner_detected" → Narração após confirmação
- Delay: 0.5s para impacto dramático

**Com Alertas:**
- Timer preciso: 180, 120, 60s exatos
- Respeita preferência usuário

### Sistema TTS Gratuito

**Opção 1: Web Speech API:**
- Nativo, sem custo
- Vozes: SO dependente
- Implementação: `SpeechSynthesisUtterance`

**Opção 2: Open Source:**
- ResponsiveVoice, TTS.js
- Controle maior
- Offline possível

### Controles Usuário

**Interface Sala Bingo:**
- Ícone: 🔊 (ao lado alertas)
- Modal:
  1. Slider Volume (0-100%)
  2. Toggle Ativar/Desativar
  3. Botão Teste
  4. Botão Salvar

**Configurações:**
- Por usuário: Banco dados
- Persistentes: Entre sessões
- Padrão: Ativada, 70%

### Sistema Fila

**Gerenciamento:**
1. Fila prioritária:
   - Prêmios (alta)
   - Bolas (média)
   - Alertas (baixa)
2. Cancelamento: Mensagem importante cancela baixa prioridade
3. Pausa: Durante prêmio, pausa sorteio

**Prevenção Sobreposição:**
- Espera término antes próxima
- Timeout: Máximo 10s fala contínua

---

## 👥 MÓDULO 8: USUÁRIOS FAKE & DOAÇÕES

### Funcionalidade
- Sistema automático insere fakes em partidas
- Gatilho: 60s antes início + <10 participantes reais
- Resultado: Completa 20-23 usuários ativos

### Configuração Painel Admin

**Campos:**
1. Nome base fakes: Input texto
2. Quantidade séries/fake: Input numérico (1-10)
3. Total fakes disponíveis: Input numérico (fixo 20)
4. Toggle: "Ativar fakes automaticamente"
5. **Novo:** "Instituição para doações de fakes"

### Lógica Inserção Automática
- Gatilho: 60s antes partida
- Condição: <10 participantes reais
- Ação: Insere fakes aleatoriamente (20-23 total)
- Aleatoriedade: Seleciona quais 20 fakes entram

### Comportamento Fakes

**Durante Partida:**
- Aparecem ranking como normais
- Cartelas marcadas automaticamente
- Podem ser ganhadores
- **EXCEÇÃO:** NÃO contabilizam arrecadação

**Saldo dos Fakes:**
- Todos têm saldo fictício (aparência)
- Exibido normalmente interface
- NÃO pode saques reais

**Restrições:**
- Sem depósitos/saques
- Não aparecem lista crédito manual
- Excluídos automaticamente pós-partida

### Sistema Doação

**Quando Fake Vence:**
- Prêmio é convertido em doação
- Instituição: Configurada admin
- Processo: Automático
- Divulgação: NENHUMA pública

**Privacidade Total:**
- ❌ Não aparece extrato usuários
- ❌ Não anunciado durante prêmio
- ❌ Sem menção narração
- ✅ Apenas registro interno admin

**Registro Interno (Admin):**
- Tabela `doacoes_fakes`:
  - Data/hora
  - Partida ID
  - Fake ganhador
  - Valor prêmio
  - Instituição destinada
  - Status: "Aguardando repasse"

**Fluxo Fake Ganha:**
1. Sistema detecta vitória fake
2. Prêmio creditado saldo fake (aparentemente normal)
3. Internamente: Valor → "fundo doações"
4. Anúncio: Aparece ganhador normal
5. Pós-partida: Sistema registra doação pendente

**Interface Admin - Relatório Doações:**
- Seção "Doações de Fakes"
- Lista doações pendentes/realizadas
- Total acumulado doação
- Botão "Marcar como Repassado"

---

## 🗄️ BANCO DE DADOS: SQLite

### Tabelas Principais

**1. users**
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    whatsapp TEXT NOT NULL,
    balance REAL DEFAULT 0.00,
    is_admin BOOLEAN DEFAULT FALSE,
    is_fake BOOLEAN DEFAULT FALSE,
    bonus_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

**2. games**
```sql
CREATE TABLE games (
    id TEXT PRIMARY KEY,
    game_number INTEGER UNIQUE NOT NULL,
    game_type TEXT CHECK(game_type IN ('auto', 'manual')) NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    series_price REAL NOT NULL,
    status TEXT CHECK(status IN ('scheduled', 'active', 'finished', 'cancelled')) DEFAULT 'scheduled',
    replaces_auto_id TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**3. game_results**
```sql
CREATE TABLE game_results (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    drawn_numbers TEXT NOT NULL,
    quadra_winner TEXT NULL,
    linha_winner TEXT NULL,
    bingo_winner TEXT NULL,
    bingo_acumulado_winner TEXT NULL,
    quadra_prize REAL,
    linha_prize REAL,
    bingo_prize REAL,
    acumulado_prize REAL,
    total_collected REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id)
);
```

**4. user_cards**
```sql
CREATE TABLE user_cards (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    card_numbers TEXT NOT NULL,
    marked_numbers TEXT NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);
```

**5. transactions**
```sql
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('deposit', 'withdrawal', 'purchase', 'prize', 'bonus')) NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    pix_key TEXT NULL,
    pix_transaction_id TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**6. system_config**
```sql
CREATE TABLE system_config (
    id TEXT PRIMARY KEY,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**7. fake_users_pool**
```sql
CREATE TABLE fake_users_pool (
    id TEXT PRIMARY KEY,
    base_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    whatsapp TEXT NOT NULL,
    series_count INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**8. fake_donations**
```sql
CREATE TABLE fake_donations (
    id TEXT PRIMARY KEY,
    fake_user_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    prize_amount REAL NOT NULL,
    charity_institution TEXT NOT NULL,
    donation_status TEXT CHECK(donation_status IN ('pending', 'donated')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fake_user_id) REFERENCES fake_users_pool(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);
```

**9. scheduled_tasks**
```sql
CREATE TABLE scheduled_tasks (
    id TEXT PRIMARY KEY,
    task_type TEXT NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    game_id TEXT NULL,
    status TEXT CHECK(status IN ('pending', 'executed', 'failed')) DEFAULT 'pending',
    executed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id)
);
```

### Índices para Performance
```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_scheduled ON games(scheduled_time);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_user_cards_game ON user_cards(game_id);
CREATE INDEX idx_scheduled_tasks_time ON scheduled_tasks(scheduled_time);
```

---

## 🚀 LÓGICA DE CONSTRUÇÃO (Ordem de Implementação)

### FASE 1: Infraestrutura Base
1. Criar banco de dados SQLite com todas as tabelas
2. Configurar servidor Express com rotas básicas
3. Implementar autenticação (login/cadastro/admin)
4. Criar contexto de usuário autenticado

### FASE 2: Interface de Autenticação
1. Página Login/Cadastro (Item 01)
2. Validações frontend e backend
3. Redirecionamentos pós-login

### FASE 3: Painel Administrativo Base
1. Layout base com menu lateral
2. Seção Configurações (PIX, WhatsApp, Preços)
3. Seção Imagens (upload, preview)
4. Seção Programação (automática + manual)

### FASE 4: Sistema Financeiro
1. Modal Compra Séries (Item 03)
2. Modal Depósito PIX (Item 04)
3. Página Perfil (Item 05)
4. Modal Saque (Item 06)

### FASE 5: Motor de Sorteio
1. Implementar SorteioBingo (algoritmo local)
2. Criar endpoints de sorteio
3. Configurar WebSocket para broadcast

### FASE 6: Sala de Bingo
1. Layout principal (painel + tubo + cartelas + ranking)
2. Integrar sorteio com marcação de cartelas
3. Implementar ranking dinâmico
4. Controles de personalização (cores, tamanho)

### FASE 7: Sistema de Premiação
1. Cálculo de prêmios baseado em porcentagens
2. Detecção de ganhadores (Quadra, Linha, Bingo)
3. Crédito automático de prêmios
4. Bingo Acumulado

### FASE 8: Narração TTS
1. Integrar Web Speech API
2. Implementar fila de mensagens
3. Sincronizar com sorteio e premiação
4. Controles de volume/ativação

### FASE 9: Usuários Fake & Doações
1. Criar pool de 20 usuários fake
2. Lógica de inserção automática (60s + <10 reais)
3. Sistema de doações silenciosas
4. Relatório de doações no admin

### FASE 10: Relatórios & Monitoramento
1. Dashboard inicial com métricas
2. Histórico de partidas
3. Transações financeiras
4. Relatórios (Diário/Semanal/Mensal)

### FASE 11: Testes & Refinamento
1. Testes de sincronização WebSocket
2. Testes de cálculo de prêmios
3. Testes de múltiplos ganhadores
4. Testes de responsividade mobile

### FASE 12: Deploy & Publicação
1. Otimização de performance
2. Segurança (rate limiting, validações)
3. Documentação final
4. Publicação

---

## 🎨 DESIGN & LAYOUT

### Paleta de Cores (Divertida)
- **Primária:** Verde vibrante (#00D084)
- **Secundária:** Roxo neon (#9D4EDD)
- **Destaque:** Laranja quente (#FF6B35)
- **Fundo:** Azul profundo (#1F1F3D)
- **Texto:** Branco/Cinza claro

### Tipografia
- **Títulos:** Fonte bold, sans-serif (ex: Poppins)
- **Corpo:** Fonte regular, legível (ex: Inter)
- **Destaque:** Fonte monospace para números

### Componentes Divertidos
- Botões com hover animations
- Cartelas com efeito glassmorphism
- Bolas com sombra e glow
- Transições suaves entre estados
- Ícones expressivos e coloridos

### Responsividade
- Mobile-first approach
- Breakpoints: 320px, 768px, 1024px, 1440px
- Touch-friendly buttons (≥44×44px)
- Scroll suave e natural

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Banco de dados SQLite criado
- [ ] Autenticação funcional
- [ ] Painel Admin base
- [ ] Sistema Financeiro completo
- [ ] Motor de Sorteio
- [ ] Sala de Bingo
- [ ] Sistema de Premiação
- [ ] Narração TTS
- [ ] Usuários Fake & Doações
- [ ] Relatórios
- [ ] Testes
- [ ] Deploy

---

## 📞 SUPORTE & PRÓXIMOS PASSOS

Este documento é a especificação técnica completa do Bingo Master. Cada módulo está pronto para implementação seguindo a ordem de construção recomendada.

**Próximo passo:** Implementar FASE 1 (Infraestrutura Base)

---

**Documento criado em:** 30 de Janeiro de 2026  
**Versão:** 1.0  
**Status:** Pronto para Implementação
