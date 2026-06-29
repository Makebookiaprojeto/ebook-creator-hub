// Upgrade EXCLUSIVO dos Templates 2, 3 e 4 de cada nicho.
// Substitui apenas: title (ebook), chapters[].title, cover_url, chapters[].image_url.
// NÃO toca: variant_index 1, subtitle, chapters[].content, schema, lógica de rotação.
//
// Uso: bun run scripts/upgrade-template-variants.ts [slug ...]

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY!;
const BUCKET = "ebook-images";
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Variant = {
  title: string;
  chapterTitles: [string, string, string, string, string];
  coverQuery: string;
  chapterQueries: [string, string, string, string, string];
};
type Entry = { slug: string; niche: string; v2: Variant; v3: Variant; v4: Variant };

const ENTRIES: Entry[] = [
  {
    slug: "emagrecimento", niche: "Emagrecimento",
    v2: {
      title: "Jejum Intermitente Inteligente: o Protocolo das Janelas que Aceleram a Queima de Gordura",
      coverQuery: "woman healthy breakfast clock window kitchen morning light intermittent fasting lifestyle",
      chapterTitles: [
        "A Ciência por Trás da Janela 16/8 e Como o Corpo Reage à Privação Alimentar",
        "Mapeando Sua Rotina: Qual Protocolo Combina com Sua Agenda Real",
        "O Cardápio Inteligente: O Que Comer na Quebra do Jejum para Saciedade Prolongada",
        "Fome Falsa, Tontura e Insônia: Como Atravessar a Adaptação dos Primeiros 14 Dias",
        "Manutenção em Longo Prazo: Ciclos de Jejum, Refeed e Vida Social sem Culpa",
      ],
      chapterQueries: [
        "woman drinking water glass morning kitchen clock window sunlight",
        "woman planning weekly meals notebook calendar healthy kitchen table",
        "healthy bowl avocado eggs vegetables breakfast plate top view natural light",
        "tired woman headache kitchen morning glass water adaptation",
        "happy couple healthy dinner restaurant friends table balance lifestyle",
      ],
    },
    v3: {
      title: "Queima em Casa: 30 Minutos por Dia que Derretem Gordura sem Academia",
      coverQuery: "woman home workout living room exercise mat sweat fit lean body sportswear",
      chapterTitles: [
        "HIIT Doméstico: A Lógica do Intervalado para Acelerar o Metabolismo",
        "Os 8 Movimentos Compostos que Substituem Qualquer Equipamento de Academia",
        "Montando Seu Circuito Semanal: Frequência, Intensidade e Descanso Ativo",
        "Pequenos Espaços, Grandes Resultados: Treinando em 2m² sem Incomodar Vizinhos",
        "Progressão Inteligente: Como Aumentar a Dificuldade sem Risco de Lesão",
      ],
      chapterQueries: [
        "woman jumping jacks living room high intensity workout sweat home",
        "woman push ups squats living room bodyweight strength training home",
        "woman planning workout schedule notebook yoga mat living room",
        "woman exercising small apartment living room mat quiet bodyweight",
        "woman planking advanced variation living room strong core focus",
      ],
    },
    v4: {
      title: "Comer com Consciência: o Método para Vencer a Fome Emocional e Emagrecer sem Dieta",
      coverQuery: "woman eating mindfully bowl table calm peaceful quiet kitchen window soft light",
      chapterTitles: [
        "Fome Física x Fome Emocional: Como Identificar o Que Realmente Te Move à Geladeira",
        "Gatilhos Invisíveis: Tédio, Estresse e Solidão Disfarçados de Apetite",
        "A Pausa de 90 Segundos: a Técnica que Interrompe o Ciclo do Compulsão",
        "Mastigação Lenta, Saciedade Real: Reeducando o Cérebro a Reconhecer o Basta",
        "Vida Sem Restrição: Construindo Liberdade Alimentar sem Recair na Compulsão",
      ],
      chapterQueries: [
        "woman thoughtful kitchen looking fridge night reflection emotional",
        "stressed woman office desk snack chocolate work tired emotional eating",
        "woman closing eyes deep breath kitchen pause moment calm",
        "woman eating slowly fork salad table quiet mindful chewing",
        "woman enjoying dessert cafe smile relaxed balanced lifestyle calm",
      ],
    },
  },
  {
    slug: "fitness", niche: "Fitness e musculação",
    v2: {
      title: "Iniciante na Sala de Pesos: o Manual da Técnica Perfeita para Crescer sem Lesão",
      coverQuery: "young man learning barbell squat gym coach technique posture form spotter",
      chapterTitles: [
        "Os 6 Padrões de Movimento que Sustentam Toda Hipertrofia",
        "Postura, Respiração e Bracing: o ABC que Ninguém Te Ensina no Primeiro Dia",
        "Agachamento, Supino e Levantamento Terra: Decompondo as Big Three",
        "Carga, Repetição e Cadência: Como Programar Sem Travar em 4 Semanas",
        "Diário de Treino: o Hábito que Multiplica seus Ganhos no Primeiro Ano",
      ],
      chapterQueries: [
        "personal trainer demonstrating compound movement gym beginner technique form",
        "man bracing core barbell gym posture breathing technique focus",
        "young man squat barbell rack gym proper form coach watching",
        "man writing training log gym bench dumbbell workout notebook",
        "athlete reviewing workout journal gym progress tracking serious",
      ],
    },
    v3: {
      title: "Quebrando o Platô: Periodização Avançada para Hipertrofia que Não Para de Crescer",
      coverQuery: "muscular bodybuilder gym dumbbells back muscles intense training advanced dark gym",
      chapterTitles: [
        "Por Que Você Estagnou: Diagnóstico do Atleta Intermediário em 3 Variáveis",
        "Ondas de Carga: Estruturando Mesociclos de Acumulação e Intensificação",
        "Métodos Avançados: Drop-Set, Rest-Pause e Cluster Aplicados com Critério",
        "Janela Anabólica Real: Como Alimentar uma Periodização de Alta Demanda",
        "Deload Estratégico: a Semana que Salva 12 Semanas de Treino Pesado",
      ],
      chapterQueries: [
        "frustrated athlete gym mirror bench plateau analysis intermediate lifter",
        "coach whiteboard training program periodization gym serious planning",
        "bodybuilder drop set dumbbell intense rep gym sweat shoulders",
        "athlete eating high protein meal chicken rice gym meal prep",
        "athlete foam roller stretching gym recovery deload light session",
      ],
    },
    v4: {
      title: "Treinar para Sempre: Mobilidade, Prevenção e Longevidade na Sala de Musculação",
      coverQuery: "older fit man stretching mobility gym mature athlete longevity active aging",
      chapterTitles: [
        "Articulações que Duram: o Trabalho Silencioso que Protege Ombro, Coluna e Joelho",
        "Aquecimento Específico: 8 Minutos que Reduzem o Risco de Lesão em 80%",
        "Sinais Vermelhos: Aprendendo a Diferenciar Dor Útil de Dor Lesiva",
        "Recovery Inteligente: Sono, Hidratação e Descarga Neural na Rotina Real",
        "Treinar aos 50, 60, 70: Adaptações que Mantêm Massa Magra a Vida Inteira",
      ],
      chapterQueries: [
        "man shoulder mobility band exercise gym joint health prevention",
        "athlete warm up routine dynamic stretching gym focused preparation",
        "physiotherapist evaluating athlete knee gym injury assessment clinical",
        "man sleeping peacefully bedroom recovery rest athlete lifestyle",
        "older athlete gym training mature strong muscular dumbbells active",
      ],
    },
  },
  {
    slug: "marketing-digital", niche: "Marketing digital",
    v2: {
      title: "Meta Ads do Zero ao Primeiro ROI: o Mapa do Tráfego Pago que Realmente Vende",
      coverQuery: "marketing strategist facebook ads dashboard laptop campaign metrics office modern",
      chapterTitles: [
        "Pixel, Eventos e Conversões API: a Fundação Técnica que 90% Ignoram",
        "Públicos Quentes, Mornos e Frios: Estruturando seu Funil de Tráfego",
        "Criativos que Convertem: Anatomia do Anúncio que Para o Scroll",
        "Otimização de CBO: Como Distribuir Orçamento sem Queimar Verba",
        "Escalonando Campanhas: do R$ 30/dia ao R$ 3.000/dia com Estabilidade",
      ],
      chapterQueries: [
        "developer setting up facebook pixel laptop code dashboard analytics",
        "marketer mapping customer journey whiteboard sticky notes funnel strategy",
        "content creator filming product video smartphone tripod ring light",
        "media buyer adjusting ad budget dashboard laptop metrics analysis",
        "marketing team celebrating campaign growth chart monitor office success",
      ],
    },
    v3: {
      title: "Reels Virais sem Mostrar o Rosto: o Sistema de Conteúdo Orgânico que Explode Alcance",
      coverQuery: "content creator filming smartphone tripod ring light home studio aesthetic",
      chapterTitles: [
        "O Algoritmo do TikTok e Instagram Reels: 7 Sinais que Disparam Distribuição",
        "Ganchos de 3 Segundos: Roteiros que Seguram o Espectador até o Final",
        "Produção Mínima: Iluminação, Áudio e Edição com Apenas um Celular",
        "Tendências, Áudios e Trends: Quando Surfar e Quando Ignorar",
        "De Visualizações a Vendas: o Funil Orgânico que Converte Espectador em Cliente",
      ],
      chapterQueries: [
        "smartphone instagram reels feed scrolling vertical video viral algorithm",
        "creator writing video script hook notebook smartphone storyboard",
        "creator filming vertical video ring light smartphone home setup",
        "creator browsing trending sounds tiktok smartphone discovery research",
        "creator dm conversation customer sale smartphone organic social commerce",
      ],
    },
    v4: {
      title: "Automação de E-mail que Vende no Piloto Automático: Funis para Infoprodutores",
      coverQuery: "email marketing dashboard laptop automation flow funnel office workspace clean",
      chapterTitles: [
        "Da Captura à Venda: Mapeando o Funil de E-mail em 5 Estágios",
        "Sequências de Boas-Vindas: o Onboarding que Educa e Pré-Vende",
        "Lançamentos por E-mail: Estrutura de Carrinho Aberto em 7 Dias",
        "Segmentação Comportamental: Enviando a Mensagem Certa por Engajamento",
        "Métricas que Importam: Taxa de Abertura, Cliques e Receita por Lead",
      ],
      chapterQueries: [
        "marketer mapping email funnel whiteboard sticky notes flowchart strategy",
        "person typing welcome email laptop coffee desk home office focused",
        "marketer launching campaign laptop countdown timer email open rate",
        "analyst segmenting audience dashboard laptop charts marketing data",
        "marketer reviewing email analytics dashboard laptop revenue chart office",
      ],
    },
  },
  {
    slug: "financas", niche: "Finanças",
    v2: {
      title: "Tesouro Direto sem Mistério: Primeiros Investimentos com Renda Fixa Inteligente",
      coverQuery: "young investor laptop tesouro direto government bonds home office calm focused",
      chapterTitles: [
        "Selic, IPCA e Prefixado: os Três Tipos de Tesouro Decifrados",
        "Reserva de Emergência: Onde Estacionar 6 Meses de Salário com Liquidez",
        "CDB, LCI e LCA: Comparando Rentabilidade Líquida com o Tesouro",
        "Carteira de Renda Fixa: Vencimentos Escalonados para Cada Objetivo",
        "Imposto, Taxa e Inflação: as Três Armadilhas que Devoram seu Rendimento",
      ],
      chapterQueries: [
        "person studying bond chart laptop financial education home calm",
        "person organizing emergency fund jar piggy bank savings notebook",
        "investor comparing investment options spreadsheet laptop calculator desk",
        "person planning long term financial goals calendar notebook desk",
        "person calculating taxes financial documents calculator desk worried",
      ],
    },
    v3: {
      title: "Saindo das Dívidas em 12 Meses: o Plano Direto para Recuperar sua Vida Financeira",
      coverQuery: "stressed couple kitchen table bills calculator paper sorting financial planning serious",
      chapterTitles: [
        "Diagnóstico Real: Listando Cada Centavo Devido sem se Esconder",
        "Renegociação Inteligente: Roteiros para Falar com Bancos e Credores",
        "Método Avalanche x Bola de Neve: Qual Funciona com Seu Perfil Psicológico",
        "Cortando o Sangramento: Hábitos de Consumo que Sabotam Qualquer Plano",
        "O Pós-Dívida: Construindo a Base para Nunca Mais Voltar ao Negativo",
      ],
      chapterQueries: [
        "person listing debts notebook calculator kitchen table serious focus",
        "person phone call negotiating bank desk papers documents serious",
        "couple kitchen table planning debt payment calculator notebook calm",
        "person reviewing credit card statement laptop home concerned analysis",
        "person celebrating financial freedom paid bills calendar relief home",
      ],
    },
    v4: {
      title: "Renda Passiva com Dividendos: Construindo Patrimônio que Paga Suas Contas",
      coverQuery: "investor reviewing dividend portfolio laptop stock chart home office professional",
      chapterTitles: [
        "Por Que Dividendos? a Lógica do Acionista que Vive de Renda",
        "FIIs vs Ações Pagadoras: Comparação Real de Rendimento Líquido",
        "Selecionando Boas Pagadoras: 7 Indicadores que Separam Joia de Lixo",
        "Reinvestimento Composto: o Efeito Bola de Neve em 10, 20, 30 Anos",
        "Construindo sua Renda Alvo: Quanto Aportar para Aposentar com Tranquilidade",
      ],
      chapterQueries: [
        "investor analyzing dividend yield laptop financial chart screen serious",
        "person comparing real estate fund stocks tablet financial app analysis",
        "analyst studying company balance sheet laptop spreadsheet finance research",
        "investor reviewing long term portfolio growth chart laptop satisfied",
        "older couple beach retirement enjoying financial freedom calm sunset",
      ],
    },
  },
  {
    slug: "empreendedorismo", niche: "Empreendedorismo",
    v2: {
      title: "Validação em 30 Dias: Como Testar uma Ideia de Negócio Antes de Gastar um Real",
      coverQuery: "young entrepreneur interviewing customer cafe notebook laptop validation startup",
      chapterTitles: [
        "Do Insight ao Problema Real: a Entrevista de Descoberta em 7 Perguntas",
        "Concierge MVP: Vendendo Antes de Existir o Produto",
        "Landing Page de Teste: Medindo Interesse com R$ 50 de Tráfego",
        "Métricas de Validação: o Que Conta como Sinal Verde para Avançar",
        "Pivote ou Persevere: o Framework de Decisão na 4ª Semana",
      ],
      chapterQueries: [
        "founder interviewing potential customer cafe laptop notebook discovery",
        "entrepreneur sketching MVP product whiteboard team brainstorm office",
        "designer building landing page laptop screen wireframe startup workspace",
        "founder reviewing validation metrics dashboard laptop analytics team",
        "team meeting startup decision whiteboard pivot persevere strategy office",
      ],
    },
    v3: {
      title: "Do MEI ao Simples: o Manual Operacional para Estruturar seu Negócio sem Susto",
      coverQuery: "small business owner shop desk paperwork legal documents organizing professional",
      chapterTitles: [
        "MEI, ME ou EPP: o Regime Tributário Certo para o seu Faturamento",
        "Abertura, CNPJ e Inscrições: Passo a Passo sem Contador",
        "Notas Fiscais e Emissão: Sistemas Gratuitos que Resolvem 80% dos Casos",
        "Folha de Pagamento e Pró-Labore: Quanto Sair sem Quebrar o Caixa",
        "Migração de Regime: Quando o MEI Não Cabe Mais e Como Trocar sem Multa",
      ],
      chapterQueries: [
        "accountant explaining tax regime client desk documents paperwork",
        "person filling business registration documents laptop government form",
        "small business owner laptop invoice software desk shop counter",
        "owner calculating salary payroll calculator spreadsheet desk office",
        "consultant advising entrepreneur business growth transition desk meeting",
      ],
    },
    v4: {
      title: "Primeiros Funcionários: Como Contratar, Liderar e Construir Cultura do Zero",
      coverQuery: "small team meeting startup office founder leading collaborative culture diverse",
      chapterTitles: [
        "Sua Primeira Vaga: Escrevendo um Job Description que Atrai Talentos Reais",
        "Entrevista Comportamental: a Técnica STAR Aplicada por Não-Recrutadores",
        "Onboarding de 30/60/90 Dias: Tornando Novos Talentos Produtivos Rápido",
        "Reuniões 1:1: o Ritual que Sustenta Performance e Engajamento",
        "Cultura Não é Pizza: Como Construir Valores que Sobrevivem ao Crescimento",
      ],
      chapterQueries: [
        "manager writing job posting laptop office desk focused thoughtful",
        "interview office meeting candidate manager handshake professional",
        "new employee onboarding orientation team welcoming office collaborative",
        "manager one on one meeting employee desk conversation feedback",
        "team values workshop office whiteboard culture meeting collaborative",
      ],
    },
  },
  {
    slug: "desenvolvimento-pessoal", niche: "Desenvolvimento pessoal",
    v2: {
      title: "Rotina Matinal de Alta Performance: o Sistema dos Hábitos Atômicos Aplicado",
      coverQuery: "person morning routine journaling sunrise window meditation coffee peaceful",
      chapterTitles: [
        "O Loop do Hábito: Gatilho, Rotina e Recompensa Decifrados",
        "Empilhamento: Encaixando 5 Novos Hábitos em Comportamentos Já Existentes",
        "Acordar Cedo sem Sofrer: Engenharia de Sono e Despertar Voluntário",
        "Os 90 Minutos Sagrados: Como Estruturar a Manhã sem Improviso",
        "Recaída sem Drama: Voltando à Rotina após Quebrar a Sequência",
      ],
      chapterQueries: [
        "person writing habit tracker journal morning coffee desk routine",
        "person stacking small daily habits checklist notebook desk routine",
        "person waking up early sunrise bedroom alarm calm morning light",
        "person deep focused work desk morning sunrise window quiet",
        "person reflecting journal calm acceptance restart routine cozy desk",
      ],
    },
    v3: {
      title: "Trabalho Profundo: Como Sustentar Foco de 4 Horas em um Mundo de Notificações",
      coverQuery: "person working laptop focused quiet office library deep work concentrated",
      chapterTitles: [
        "Atenção Fragmentada: o Custo Cognitivo Real de Cada Notificação",
        "Bloqueio de Tempo: Projetando o Dia em Blocos de 90 Minutos",
        "Ambiente sem Distração: Engenharia de Mesa, Tela e Celular",
        "Métricas de Foco: Medindo Horas Profundas, não Horas Trabalhadas",
        "Rituais de Início e Encerramento: as Bordas que Protegem seu Foco",
      ],
      chapterQueries: [
        "smartphone notifications flooding screen distraction attention overload",
        "person time blocking calendar laptop planning week focused desk",
        "minimalist clean desk workspace laptop focused quiet single monitor",
        "person tracking deep work hours notebook timer focused desk",
        "person closing laptop end of work day ritual evening office",
      ],
    },
    v4: {
      title: "Inteligência Emocional na Prática: Lendo Sentimentos antes que Eles Decidam por Você",
      coverQuery: "person reflective window thoughtful calm self awareness peaceful introspection",
      chapterTitles: [
        "Vocabulário Emocional: Nomeando o Que Você Sente para Poder Regular",
        "Pausa Consciente: a Janela de 6 Segundos entre Gatilho e Reação",
        "Empatia Funcional: Lendo o Outro sem Perder Seus Próprios Limites",
        "Conflitos Difíceis: Estrutura para Conversas que Você Vinha Adiando",
        "Autoconhecimento Iterativo: Diário, Feedback e Revisão Trimestral",
      ],
      chapterQueries: [
        "person journaling emotions notebook reflection calm evening home",
        "person taking deep breath pause calm office stressful moment",
        "two people empathetic conversation cafe listening calm honest",
        "couple honest difficult conversation kitchen calm respect home",
        "person quarterly review journal goals self reflection desk calm",
      ],
    },
  },
  {
    slug: "saude-mental", niche: "Saúde mental",
    v2: {
      title: "Domando a Ansiedade: Ferramentas da Terapia Cognitiva para Usar no Dia a Dia",
      coverQuery: "person calm breathing window peaceful anxiety relief mental health quiet morning",
      chapterTitles: [
        "O Ciclo Pensamento–Emoção–Comportamento Decifrado pela TCC",
        "Distorções Cognitivas: os 10 Padrões que Alimentam Ansiedade",
        "Reestruturação Cognitiva: Questionando o Pensamento Automático",
        "Exposição Gradual: Encarando o Que Você Vem Evitando há Anos",
        "Quando Procurar Ajuda Profissional: Sinais que Não Devem Ser Ignorados",
      ],
      chapterQueries: [
        "person therapy notebook writing thoughts calm reflection home quiet",
        "person reading psychology book home calm self help mental",
        "therapist talking patient counseling session office calm warm light",
        "person facing fear walking outside calm gradual exposure park",
        "therapist patient consultation office warm professional empathetic session",
      ],
    },
    v3: {
      title: "Antes que Vire Burnout: o Plano para Trabalhar com Energia sem se Apagar",
      coverQuery: "exhausted professional desk office burnout overwhelmed laptop tired serious",
      chapterTitles: [
        "Os 12 Estágios do Burnout: Reconhecendo Antes do Colapso",
        "Mapa de Energia: Identificando o Que Drena e o Que Recarrega",
        "Limites no Trabalho: Roteiros para Dizer Não sem Culpa",
        "Microdescansos: a Pausa de 7 Minutos que Recupera 2 Horas de Foco",
        "Férias Reais: Como Desconectar sem Ansiedade de Voltar",
      ],
      chapterQueries: [
        "exhausted woman office desk laptop overwhelmed work burnout serious",
        "person journaling energy levels week notebook calm reflection home",
        "professional setting boundaries meeting calm assertive office discussion",
        "person taking break walking outside office building park breath",
        "person vacation beach disconnected calm sunset relaxed peaceful",
      ],
    },
    v4: {
      title: "Regulando o Sistema Nervoso: Respiração, Meditação e o Caminho para a Calma Real",
      coverQuery: "person meditating peaceful eyes closed yoga mat morning window soft calm",
      chapterTitles: [
        "Sistema Nervoso Autônomo: Entendendo Luta, Fuga e Congelamento",
        "Respiração 4-7-8: a Técnica que Acalma o Coração em 60 Segundos",
        "Meditação para Iniciantes: 10 Minutos por Dia sem Postura Perfeita",
        "Coerência Cardíaca: a Prática Diária de 5 Minutos Validada por Estudos",
        "Construindo Resiliência: o Treino Diário para o Nervoso Voltar ao Centro",
      ],
      chapterQueries: [
        "anatomy nervous system illustration calm educational background neutral",
        "person breathing exercise hands chest belly eyes closed calm home",
        "person meditation cushion morning living room window soft light",
        "person hand heart breathing exercise calm peaceful eyes closed",
        "person sunrise nature walking calm peaceful resilience meditation",
      ],
    },
  },
  {
    slug: "espiritualidade", niche: "Espiritualidade",
    v2: {
      title: "Devocional Diário: Construindo uma Vida de Oração, Fé e Gratidão Constante",
      coverQuery: "person hands prayer bible candle warm light devotional faith christian peaceful",
      chapterTitles: [
        "O Quarto Secreto: Estruturando seu Espaço e Hora de Oração",
        "Lectio Divina: o Método Antigo de Ler a Bíblia que Transforma o Dia",
        "Diário de Gratidão: o Hábito que Reconfigura o Olhar sobre a Vida",
        "Jejum, Silêncio e Solidão: Disciplinas Esquecidas pela Vida Moderna",
        "Comunidade de Fé: Por que Crescer Sozinho é Quase Sempre Insuficiente",
      ],
      chapterQueries: [
        "person bible prayer corner home candle warm devotional quiet morning",
        "person reading bible underlined notes coffee table window light",
        "person writing gratitude journal cup tea warm morning calm",
        "person silent prayer alone forest peaceful contemplation faith",
        "small group prayer circle church community hands faith warm",
      ],
    },
    v3: {
      title: "Chakras, Energia e Meditação: o Despertar Sutil para uma Vida Mais Conectada",
      coverQuery: "woman meditation lotus position chakras energy purple light spiritual aura mystical",
      chapterTitles: [
        "Os 7 Centros Energéticos: Mapa do Corpo Sutil Decifrado",
        "Limpeza Energética: Práticas Diárias para Não Carregar o Que Não é Seu",
        "Meditação Guiada por Chakra: Roteiro Semanal de 7 Dias",
        "Cristais, Incenso e Sons: Quando Apoiam e Quando Apenas Distraem",
        "Sincronicidades e Intuição: Lendo os Sinais do Caminho",
      ],
      chapterQueries: [
        "meditation woman lotus colorful light spiritual energy",
        "person sage smudge cleansing ritual home calm peaceful sunset",
        "woman meditation home cushion candle calm peaceful soft light",
        "crystals incense altar spiritual home practice peaceful mystical",
        "woman walking forest path intuition peaceful sunlight contemplation",
      ],
    },
    v4: {
      title: "Propósito de Vida: a Jornada Filosófica para Descobrir Por Que Você Está Aqui",
      coverQuery: "person silhouette sunrise mountain contemplation purpose meaning life inspiring",
      chapterTitles: [
        "Ikigai Brasileiro: o Cruzamento entre Paixão, Talento, Missão e Vocação",
        "Valores Fundamentais: a Bússola Interna que Orienta Decisões Difíceis",
        "Mortalidade como Mestre: a Lição que o Fim Ensina ao Presente",
        "Serviço e Doação: Por que Ajudar o Outro Revela o Próprio Caminho",
        "Vivendo o Propósito: Pequenas Escolhas Diárias que Constroem Sentido",
      ],
      chapterQueries: [
        "person reflecting purpose journal venn diagram notebook peaceful",
        "person writing personal values list notebook quiet reflection home",
        "older person contemplative sunset wisdom reflection peaceful nature",
        "volunteers helping community service hands together warm light",
        "person living purposeful life smile calm peaceful sunset balance",
      ],
    },
  },
  {
    slug: "relacionamentos", niche: "Relacionamentos",
    v2: {
      title: "Comunicação Não Violenta no Casal: o Fim das Brigas Repetidas em Casa",
      coverQuery: "couple having calm conversation living room sofa honest communication warm light",
      chapterTitles: [
        "Observação x Julgamento: Aprendendo a Falar sem Acusar",
        "Sentimentos Genuínos: o Vocabulário que Falta em Discussões de Casal",
        "Pedidos Claros: a Diferença Entre Pedir e Exigir",
        "Escuta Empática: a Habilidade que Desarma 80% dos Conflitos",
        "Reparo Pós-Briga: o Ritual de Reconexão que Cura Antigas Mágoas",
      ],
      chapterQueries: [
        "couple talking honestly kitchen table calm communication morning",
        "couple expressing feelings vulnerable conversation sofa warm light",
        "couple making request request kindly conversation living room calm",
        "person listening empathetically partner sofa warm intimate calm",
        "couple embracing reconciliation after argument warm soft window light",
      ],
    },
    v3: {
      title: "Reconquista Real: o Plano para Reconstruir uma Relação que Quase Acabou",
      coverQuery: "couple reuniting sunset park silhouette holding hands hope reconciliation warm",
      chapterTitles: [
        "Diagnóstico da Crise: o Que Realmente Quebrou e o Que Pode Voltar",
        "Tempo Separado, Tempo Estratégico: Usando o Vazio para Crescer",
        "Conversa de Reabertura: o Encontro que Define o Próximo Capítulo",
        "Reconstrução de Confiança: a Engenharia Diária de Pequenos Gestos",
        "Nova Versão do Casal: Acordos que Evitam Repetir o Velho Padrão",
      ],
      chapterQueries: [
        "person reflecting alone journal window relationship reflection calm",
        "person walking alone park reflection growth personal time peaceful",
        "couple difficult honest conversation cafe calm important moment",
        "couple small gestures kindness coffee morning rebuilding trust warm",
        "couple smiling together future planning happy fresh start sunset",
      ],
    },
    v4: {
      title: "As 5 Linguagens do Amor na Prática: Intimidade que Não Cansa Depois dos Anos",
      coverQuery: "long term couple cooking together kitchen laughing intimate connected love warm",
      chapterTitles: [
        "Descobrindo sua Linguagem Primária e a do seu Parceiro",
        "Palavras de Afirmação: o Elogio Verdadeiro que Falta na Rotina",
        "Tempo de Qualidade: a Atenção sem Tela em um Mundo Digital",
        "Atos de Serviço e Presentes: Demonstrando Amor em Pequenos Detalhes",
        "Toque Físico: Reacendendo a Intimidade Além do Sexo",
      ],
      chapterQueries: [
        "couple quiz love languages laughing sofa connection conversation warm",
        "couple romantic note handwritten breakfast morning kitchen warm",
        "couple date phone away dinner intimate restaurant candle warm",
        "couple cooking together kitchen helping each other warm laugh",
        "couple holding hands walking park sunset affection connection warm",
      ],
    },
  },
  {
    slug: "maternidade", niche: "Maternidade",
    v2: {
      title: "Primeiras Semanas com o Bebê: Sono, Amamentação e Sobrevivência sem Culpa",
      coverQuery: "mother holding newborn baby tender bonding home warm light intimate calm",
      chapterTitles: [
        "Pega Correta: Resolvendo Dores na Amamentação nos Primeiros 7 Dias",
        "Sono do Recém-Nascido: Janelas, Sonecas e Realidade dos Primeiros 30 Dias",
        "Cólicas e Choros: Diferenciando Fome, Dor, Sono e Necessidade de Colo",
        "Rede de Apoio: Como Pedir e Aceitar Ajuda nos Primeiros Meses",
        "Saúde Mental no Pós-Parto: Reconhecendo Sinais que Precisam de Atenção",
      ],
      chapterQueries: [
        "mother breastfeeding newborn baby home calm warm light intimate",
        "newborn sleeping crib nursery soft light peaceful tender",
        "mother soothing crying baby home tender calm warm comfort",
        "grandmother helping young mother baby home support family warm",
        "tired new mother home rest baby empathetic vulnerable real",
      ],
    },
    v3: {
      title: "Educação Positiva de 0 a 6 Anos: Limites com Carinho que Funcionam de Verdade",
      coverQuery: "mother child playing floor home positive parenting warm bonding affection sunlight",
      chapterTitles: [
        "Cérebro Infantil em Construção: Por que Birra é Neurobiologia, não Manha",
        "Limites Firmes, Voz Calma: o Método Antibirra que Realmente Sustenta",
        "Validação Emocional: a Frase Mágica que Acalma Crise em Segundos",
        "Tempo de Conexão: 10 Minutos Diários que Previnem 90% dos Conflitos",
        "Telas, Doces e Limites Difíceis: Negociando sem Recompensa nem Castigo",
      ],
      chapterQueries: [
        "toddler tantrum floor parent calm understanding home gentle",
        "parent kneeling eye level child calm conversation home warm",
        "parent hugging crying child validation comfort home tender",
        "parent playing floor child quality time bonding home warm",
        "child television screen parent setting limit calm home discussion",
      ],
    },
    v4: {
      title: "Mãe, Mulher e Profissional: Reconstruindo Identidade Sem Culpa Após a Maternidade",
      coverQuery: "woman mother working laptop coffee home professional balance identity calm",
      chapterTitles: [
        "Identidade Perdida: o Luto Silencioso pela Mulher que Você Era Antes",
        "Sem Culpa Materna: Desmontando o Mito da Mãe Perfeita",
        "Tempo para Si: Microblocos de Autocuidado em Rotinas Apertadas",
        "Volta ao Trabalho: Negociando Carga, Horário e Expectativas",
        "Casamento Após o Bebê: Reaprendendo a ser Casal Além de Pais",
      ],
      chapterQueries: [
        "woman reflective window contemplating identity calm thoughtful home",
        "mother working laptop child playing background balance home calm",
        "mother taking moment self care bath morning calm peaceful warm",
        "mother professional office laptop work focused calm office",
        "couple parents date night without baby restaurant intimate warm",
      ],
    },
  },
  {
    slug: "pets", niche: "Pets",
    v2: {
      title: "Filhote em Casa: Adestramento Positivo nos 6 Meses que Definem Toda a Vida",
      coverQuery: "puppy training owner positive reinforcement treat home backyard sunny playful",
      chapterTitles: [
        "Período Crítico de Socialização: a Janela dos 16 Semanas",
        "Reforço Positivo: a Ciência do Clicker e dos Petiscos Estratégicos",
        "Sentar, Deitar, Vir: os 5 Comandos Essenciais em 14 Dias",
        "Mordidinhas, Xixi e Latido: Resolvendo os 3 Problemas Clássicos",
        "Coleira sem Puxões: o Passeio que Cansa o Cão sem Estressar o Tutor",
      ],
      chapterQueries: [
        "puppy meeting people dog park socialization positive friendly outdoor",
        "trainer rewarding puppy treat clicker training session positive home",
        "owner teaching puppy sit command home backyard positive playful",
        "puppy chewing toy training redirect home playful learning",
        "person walking puppy leash park calm training happy sunny",
      ],
    },
    v3: {
      title: "Nutrição Natural Canina: o Plano para Aumentar Anos de Vida do seu Cão Adulto",
      coverQuery: "healthy dog eating natural food bowl owner kitchen home wellness vibrant",
      chapterTitles: [
        "Ração x Comida Natural x Caseira: o Que a Ciência Realmente Diz",
        "Macronutrientes do Cão: Proteína, Gordura e Fibra na Tigela Certa",
        "Suplementação Inteligente: Ômega-3, Glucosamina e Probióticos",
        "Sinais Visíveis: Pelos, Energia e Cocô como Termômetro Diário",
        "Check-Ups e Vacinas: o Calendário de Prevenção que Salva Vidas",
      ],
      chapterQueries: [
        "owner preparing natural dog food kitchen ingredients vegetables meat",
        "healthy dog food bowl mixed ingredients meat vegetables top view",
        "owner giving dog supplement fish oil tablet hand kitchen healthy",
        "shiny coat healthy energetic dog running park sunny vibrant",
        "veterinarian examining dog checkup clinic calm professional caring",
      ],
    },
    v4: {
      title: "Ansiedade de Separação no Cão: Decifrando o Comportamento que Quebra a Casa",
      coverQuery: "dog window waiting alone home anxiety separation owner empty house behavior",
      chapterTitles: [
        "Cão Equilibrado x Cão Ansioso: o Sinal que Você Talvez Esteja Ignorando",
        "Enriquecimento Ambiental: Tornando o Tédio Impossível",
        "Dessensibilização à Saída: o Protocolo Diário de 21 Dias",
        "Brinquedos Interativos: Comida que Vira Trabalho Mental",
        "Quando o Caso é Veterinário: Limites do que o Tutor Resolve Sozinho",
      ],
      chapterQueries: [
        "anxious dog hiding sofa stressed body language behavior home",
        "dog playing puzzle toy enrichment home mental stimulation interactive",
        "owner leaving home dog watching calm training door behavior",
        "dog kong toy food enrichment mental stimulation home calm",
        "veterinarian behaviorist consulting dog owner clinic professional",
      ],
    },
  },
  {
    slug: "receitas", niche: "Receitas e culinária",
    v2: {
      title: "Marmita Fitness Semanal: 7 Almoços Prontos em 2 Horas de Cozinha",
      coverQuery: "meal prep containers healthy lunch boxes kitchen colorful organized week",
      chapterTitles: [
        "Lista de Compras Inteligente: Comprando para 7 Almoços em uma Ida",
        "Cozinha em Bloco: Frangos, Carnes e Vegetais Assados Simultaneamente",
        "Carboidratos da Semana: Arroz, Batata e Macarrão sem Empapar",
        "Molhos e Temperos: Como Variar 7 Marmitas com 3 Bases",
        "Armazenamento e Reaquecimento: Conservando Sabor por 4 Dias",
      ],
      chapterQueries: [
        "shopping list grocery store cart healthy vegetables meat planning",
        "kitchen meal prep chicken vegetables roasting oven trays batch",
        "rice quinoa potato bowls meal prep containers kitchen healthy",
        "sauces dressings small jars meal prep variety kitchen colorful",
        "meal prep containers fridge organized lunch boxes storage healthy",
      ],
    },
    v3: {
      title: "Confeitaria Sem Açúcar: Sobremesas que Você Pode Comer Todo Dia",
      coverQuery: "healthy dessert chocolate cake fruit kitchen sugar free natural appetizing",
      chapterTitles: [
        "Adoçantes Naturais: Tâmara, Xilitol, Eritritol e Mel Comparados",
        "Farinhas Funcionais: Amêndoa, Aveia e Coco no Lugar da Refinada",
        "Bolos, Brigadeiros e Brownies: Receitas-Bandeira sem Açúcar",
        "Geladinhos, Mousses e Cheesecakes Fit para Calor",
        "Doces para Vender: Adaptando Receitas para Renda Extra Saudável",
      ],
      chapterQueries: [
        "dates honey natural sweeteners kitchen healthy alternatives",
        "almond oat coconut flour bowls baking healthy alternative kitchen",
        "healthy brownies brigadeiro sugar free kitchen dessert appetizing",
        "healthy mousse cheesecake jars dessert natural light kitchen",
        "homemade desserts packaging selling home business kitchen healthy",
      ],
    },
    v4: {
      title: "Cozinha Mediterrânea Brasileira: Sabores do Sul da Europa com Ingredientes Nossos",
      coverQuery: "mediterranean food table olive oil tomato fish vegetables fresh appetizing rustic",
      chapterTitles: [
        "A Dieta Mediterrânea Decifrada: por que Italianos Vivem Mais",
        "Azeite, Tomate e Ervas: o Trio Base Adaptado ao Mercado Brasileiro",
        "Peixes Frescos do Brasil: Tilápia, Cação e Sardinha à Moda Mediterrânea",
        "Grãos, Massas e Pães Caseiros: Variando os Carboidratos Bons",
        "A Mesa Mediterrânea: Almoços Longos, Vinho e Conversa Lenta",
      ],
      chapterQueries: [
        "mediterranean diet plate olive oil bread tomato fish rustic table",
        "olive oil fresh herbs basil tomato kitchen ingredients natural",
        "grilled fish lemon herbs plate mediterranean rustic appetizing",
        "homemade pasta bread fresh kitchen mediterranean rustic",
        "family long lunch outdoor table wine bread mediterranean warm",
      ],
    },
  },
  {
    slug: "beleza", niche: "Beleza e autocuidado",
    v2: {
      title: "Skincare Anti-Idade Aos 30+: o Protocolo Científico para uma Pele Firme e Luminosa",
      coverQuery: "mature woman radiant glowing skin skincare bathroom mirror anti aging beautiful",
      chapterTitles: [
        "Envelhecimento Cutâneo: Colágeno, Elastina e Radicais Livres Decifrados",
        "Os 3 Ativos Ouro: Vitamina C, Retinol e Ácido Hialurônico Aplicados",
        "Rotina Manhã e Noite: a Ordem que Faz Diferença em 60 Dias",
        "Protetor Solar Verdadeiro: por que Ele é 80% do Anti-Idade",
        "Procedimentos Estéticos: Quando Vale, Quando Espera",
      ],
      chapterQueries: [
        "skincare ingredients dropper serums bathroom shelf elegant minimalist",
        "woman applying serum face bathroom mirror skincare elegant",
        "woman skincare routine morning bathroom mirror products elegant",
        "woman applying sunscreen face outdoor sunny day skincare",
        "dermatologist consulting patient clinic professional consultation elegant",
      ],
    },
    v3: {
      title: "Make Natural em 10 Minutos: o Tutorial para Ficar Linda em Qualquer Manhã",
      coverQuery: "woman natural makeup mirror bathroom morning soft elegant fresh radiant",
      chapterTitles: [
        "Base Leve: o Acabamento Pele Real sem Parecer Mascarada",
        "Olhar Marcante em 3 Passos: Sombra Neutra, Lápis e Máscara",
        "Sobrancelhas Naturais: o Detalhe que Estrutura o Rosto",
        "Boca Hidratada com Cor: o Batom que Resolve Tudo",
        "Retoque de Bolsa: 5 Itens que Cabem em Qualquer Necessaire",
      ],
      chapterQueries: [
        "woman applying foundation natural makeup bathroom mirror fresh",
        "woman applying eyeshadow mascara natural makeup mirror elegant",
        "woman shaping eyebrows mirror bathroom natural beauty",
        "woman applying lip color natural makeup mirror fresh",
        "makeup essentials small bag minimalist elegant flat lay",
      ],
    },
    v4: {
      title: "Cabelos que Crescem Fortes: o Plano Capilar Para Recuperar Volume e Brilho",
      coverQuery: "woman long shiny healthy hair beauty portrait natural radiant",
      chapterTitles: [
        "Anatomia do Fio: por que seu Cabelo Quebra antes de Crescer",
        "Cronograma Capilar: Hidratação, Nutrição e Reconstrução Decifrados",
        "Couro Cabeludo Saudável: o Solo Esquecido do Crescimento",
        "Ativos Caseiros vs Industriais: o Que Funciona e o Que é Marketing",
        "Hábitos Diários: Toalha, Penteado e Sono que Protegem os Fios",
      ],
      chapterQueries: [
        "healthy hair strand close up shiny texture beauty",
        "hair masks treatments products bathroom shelf elegant",
        "woman scalp massage hair care bathroom natural",
        "hair oil treatment natural ingredients bottles elegant",
        "woman tying hair silk pillowcase night routine elegant",
      ],
    },
  },
  {
    slug: "moda", niche: "Moda e Estilo",
    v2: {
      title: "Guarda-Roupa Cápsula: 30 Peças que Resolvem Todos os Looks do Ano",
      coverQuery: "minimalist capsule wardrobe closet neutral colors organized rack hangers elegant",
      chapterTitles: [
        "Auditoria do Closet: Eliminando o Que Você Não Usa há 12 Meses",
        "Cartela Neutra Personalizada: Pretos, Bege, Branco e seu Acento",
        "As 30 Peças-Coringa: Lista Detalhada por Categoria",
        "Combinações Infinitas: 60 Looks Pré-Pensados para Acordar sem Dúvida",
        "Manutenção da Cápsula: Comprando Pouco e Bem por Estação",
      ],
      chapterQueries: [
        "person organizing closet sorting clothes minimalist decluttering",
        "neutral color palette swatches fabric beige black white elegant",
        "capsule wardrobe neutral pieces flat lay clothing rack minimalist",
        "outfit combinations flat lay neutral pieces minimalist styling",
        "woman buying clothes boutique conscious quality elegant minimalist",
      ],
    },
    v3: {
      title: "Descubra seu Estilo Pessoal: os Arquétipos da Moda que Revelam Quem Você É",
      coverQuery: "stylish woman street fashion confident personal style portrait elegant",
      chapterTitles: [
        "Os 7 Arquétipos de Estilo: Clássico, Romântico, Dramático e Outros",
        "Teste Visual: Identificando Seu Arquétipo em 12 Perguntas",
        "Silhuetas, Tecidos e Cores que Conversam com seu Tipo",
        "Inspiração Saudável: Como Usar o Pinterest sem se Perder",
        "Editorial Pessoal: Construindo seu Mood Board de Estilo",
      ],
      chapterQueries: [
        "fashion archetypes mood board collage styles classic romantic dramatic",
        "woman trying outfits mirror discovering style boutique",
        "fabric texture silhouettes fashion design swatches elegant",
        "person browsing pinterest fashion inspiration tablet desk",
        "fashion mood board pinterest wall personal style aesthetic",
      ],
    },
    v4: {
      title: "Moda Consciente: Curadoria de Brechó, Slow Fashion e Estilo Sustentável",
      coverQuery: "woman thrift store vintage shop selecting clothes sustainable fashion elegant",
      chapterTitles: [
        "Fast Fashion x Slow Fashion: o Real Custo da Roupa Barata",
        "Brechó Estratégico: Garimpando Peças de Qualidade em São Paulo, Rio e Online",
        "Reformas Inteligentes: Costureira como Aliada do Estilo Pessoal",
        "Marcas Brasileiras Conscientes: Selo, Origem e Curadoria",
        "Vida Útil do Look: Cuidando da Roupa para Durar Anos",
      ],
      chapterQueries: [
        "fast fashion landfill pile clothes environment contrast slow",
        "vintage thrift store racks women browsing selecting quality",
        "seamstress altering dress vintage workshop hands fabric",
        "ethical brazilian fashion brand boutique elegant quality",
        "person washing folding clothes care home laundry elegant",
      ],
    },
  },
  {
    slug: "arquitetura", niche: "Arquitetura e Decoração",
    v2: {
      title: "Decoração Escandinava para Apartamentos Pequenos: Aconchego em Poucos Metros",
      coverQuery: "scandinavian living room small apartment white wood plants cozy hygge minimalist",
      chapterTitles: [
        "Os Princípios Hygge: Aconchego, Funcionalidade e Luz Natural",
        "Paleta Escandinava: Branco, Madeira Clara e Acentos Suaves",
        "Mobiliário Multifuncional: Camas, Mesas e Sofás que Trabalham Dobrado",
        "Têxteis e Texturas: o Segredo da Sala Sueca em Apartamento Brasileiro",
        "Iluminação em Camadas: Abajures, Pendentes e Velas para o Inverno o Ano Todo",
      ],
      chapterQueries: [
        "scandinavian hygge living room cozy candles blanket warm wood",
        "scandinavian neutral color palette white wood interior elegant",
        "multifunctional furniture small apartment sofa bed coffee table",
        "scandinavian textiles throws cushions sheepskin texture cozy",
        "scandinavian lighting layered lamps candles cozy living room evening",
      ],
    },
    v3: {
      title: "Iluminação em Camadas: o Truque Profissional que Transforma Qualquer Ambiente",
      coverQuery: "interior layered lighting living room warm pendant lamps floor table evening cozy",
      chapterTitles: [
        "As 3 Camadas: Geral, Tarefa e Acento Decifradas",
        "Temperatura de Cor: 2700K, 3000K, 4000K e Onde Cada Uma Cabe",
        "Pendentes, Spots e Trilhos: Quando Cada Tipo de Luz Faz Sentido",
        "Iluminação Cênica: Destacando Arte, Estante e Plantas",
        "Erros Caros: o Que Eletricista Comum Não Te Conta",
      ],
      chapterQueries: [
        "interior designer pointing lighting plan three layers diagram living",
        "color temperature warm cool light bulbs comparison interior",
        "modern pendant lights dining table elegant interior architecture",
        "accent lighting artwork wall gallery spotlight interior",
        "electrician installing ceiling lights home interior modern",
      ],
    },
    v4: {
      title: "Biofilia em Casa: o Design que Traz a Natureza para Dentro do Seu Apartamento",
      coverQuery: "biophilic interior plants natural light living room green wall jungle home modern",
      chapterTitles: [
        "Biofilia: o Conceito Científico que Reduz Estresse em 23%",
        "Plantas Certas para Cada Cômodo: Luz, Umidade e Manutenção",
        "Jardim Vertical Caseiro: Estrutura, Substrato e Irrigação",
        "Materiais Naturais: Madeira, Pedra, Linho e Sisal na Decoração",
        "Som e Aroma: Fontes, Difusores e a Floresta dentro de Casa",
      ],
      chapterQueries: [
        "biophilic design living room plants natural light wellness modern",
        "houseplants different rooms low light humidity care interior",
        "vertical garden indoor wall green plants home modern",
        "natural materials wood stone linen interior design rustic",
        "essential oil diffuser plants home calm relaxing interior",
      ],
    },
  },
  {
    slug: "viagens", niche: "Viagens",
    v2: {
      title: "Mochilão na Europa: Roteiro de 30 Dias com Orçamento Real e Realista",
      coverQuery: "young backpacker train station europe travel backpack adventure sunrise",
      chapterTitles: [
        "Planejamento de Rota: 7 Países em 30 Dias sem Correr Demais",
        "Hostels, Couchsurfing e Albergues: Dormindo Bem por 15 a 30 Euros",
        "Trens, Buses e Aéreos Baratos: o Mapa Real do Transporte Europeu",
        "Comida de Mochileiro: Mercados, Cozinha de Hostel e Street Food",
        "Itens Essenciais: a Mochila de 40 Litros que Resolve Tudo",
      ],
      chapterQueries: [
        "young traveler planning europe map laptop notebook hostel room",
        "young travelers hostel dormitory backpacks europe friends",
        "european train station travelers backpacks platform interrail",
        "backpacker eating street food market europe travel",
        "backpacker packing bag travel essentials minimalist",
      ],
    },
    v3: {
      title: "Viagem em Família sem Estresse: o Manual para Viajar com Crianças Pequenas",
      coverQuery: "family vacation airport children parents luggage smiling travel happy together",
      chapterTitles: [
        "Destinos Família-Friendly: Praia, Resort ou Cidade?",
        "Mala Inteligente da Criança: Lista de Itens Essenciais por Idade",
        "Voos Longos com Criança Pequena: o Kit de Sobrevivência",
        "Roteiros Realistas: Equilibrando Adultos, Crianças e Descanso",
        "Imprevistos: Doença, Birra e Mau Tempo Sem Arruinar a Viagem",
      ],
      chapterQueries: [
        "family with children beach resort tropical vacation happy",
        "family packing children suitcase home travel preparation",
        "family child airplane seat travel toys snacks cabin",
        "family walking tourist attraction city children parents happy",
        "family child hotel room sick comfort travel parent",
      ],
    },
    v4: {
      title: "Milhas Aéreas Brasileiras: o Plano para Voar Quase de Graça em 12 Meses",
      coverQuery: "person planning miles loyalty programs laptop credit cards travel airplane",
      chapterTitles: [
        "Smiles, Latam Pass e TudoAzul: o Comparativo de Programas Brasileiros",
        "Cartões de Crédito Estratégicos: Quais Realmente Multiplicam Milhas",
        "Compra e Bonificação: Quando Comprar Milha Vale a Pena",
        "Resgate Inteligente: Encontrando Voos Premium pela Menor Milhagem",
        "Status Elite: Atalhos para Top Tier Sem Voar 100 Mil Quilômetros",
      ],
      chapterQueries: [
        "loyalty miles program app smartphone airline brazilian",
        "credit cards travel rewards person comparing options laptop",
        "person buying miles points laptop deal calculation desk",
        "person searching airline flight reward seat laptop booking",
        "business class airline cabin premium seat luxury elegant",
      ],
    },
  },
  {
    slug: "idiomas", niche: "Idiomas",
    v2: {
      title: "Inglês Fluente em 6 Meses: o Método dos 30 Minutos Diários sem Curso Caro",
      coverQuery: "person studying english laptop headphones notebook home cozy desk focused",
      chapterTitles: [
        "Input Comprehensível: a Teoria que Faz Você Aprender Como Criança",
        "Listening Diário: Podcasts, Séries e a Técnica do Repetir-em-Voz",
        "Vocabulário por Frequência: as 2000 Palavras que Resolvem 80% da Fala",
        "Speaking sem Vergonha: AI Tutors, Cambly e Conversação Sozinho",
        "Imersão Doméstica: Como Transformar seu Celular em Ambiente Anglófono",
      ],
      chapterQueries: [
        "person listening english podcast headphones notebook home calm",
        "person watching english series subtitle laptop notes home",
        "english vocabulary flashcards notebook study desk",
        "person speaking english webcam online tutor laptop conversation",
        "smartphone english language settings apps home learning",
      ],
    },
    v3: {
      title: "Espanhol do Zero ao Intermediário: o Método Imersivo de 90 Dias",
      coverQuery: "person studying spanish flag book home calm focused learning",
      chapterTitles: [
        "Falsos Amigos: as 50 Palavras que Confundem Brasileiros de Cara",
        "Gramática Essencial: Verbos, Tempos e Concordância sem Decoreba",
        "Sotaques da Espanha e América Latina: Qual Aprender Primeiro",
        "Pronúncia Castelhana: Sons que o Brasileiro Resolve em uma Semana",
        "Roteiro de 90 Dias: Cronograma Detalhado por Semana",
      ],
      chapterQueries: [
        "spanish english false cognates flashcards notebook study",
        "spanish grammar textbook student desk highlighter notes",
        "spanish flags spain mexico argentina culture map learning",
        "person pronunciation mirror practice mouth spanish home",
        "language learning calendar schedule notebook desk plan",
      ],
    },
    v4: {
      title: "TOEFL e IELTS Nota Alta: o Manual de Estratégia para Cada Seção da Prova",
      coverQuery: "test taker exam preparation toefl ielts books desk focused academic",
      chapterTitles: [
        "Diferenças Reais TOEFL x IELTS: Qual Combina com seu Objetivo",
        "Reading: Técnicas de Skimming, Scanning e Tempo por Questão",
        "Listening: Anotações Estruturadas e Distratores Decifrados",
        "Writing Task 1 e 2: Templates de Alta Pontuação Detalhados",
        "Speaking: Respondendo com Estrutura PEEL nos 45 Segundos Críticos",
      ],
      chapterQueries: [
        "exam papers toefl ielts books comparison desk study",
        "student reading exam document highlighter notes academic",
        "student listening exam headphones notes academic test",
        "student writing essay exam notebook focused academic",
        "student speaking practice microphone exam preparation",
      ],
    },
  },
  {
    slug: "concursos", niche: "Estudos e concursos",
    v2: {
      title: "Memorização para Concursos: a Revisão Espaçada que Aprovou Aprovados",
      coverQuery: "concursando studying books desk lamp focused dedication serious library home",
      chapterTitles: [
        "Curva do Esquecimento: por que Você Estuda 8 Horas e Esquece em 3 Dias",
        "Anki na Prática: Configuração e Decks para Concursos Federais",
        "Mapas Mentais: o Resumo Visual que Substitui 20 Páginas",
        "Mnemônicos Avançados: Palácio da Memória para Decretos e Leis",
        "Cronograma de Revisões: 1, 7, 30 e 90 Dias Aplicado de Verdade",
      ],
      chapterQueries: [
        "concursando frustrated studying forgotten material books desk",
        "student using flashcards app laptop study desk focused",
        "mind map sketch notebook colored markers study desk",
        "student memory palace technique studying focused desk",
        "study calendar review schedule planner notebook desk",
      ],
    },
    v3: {
      title: "Redação Nota Mil: a Estrutura Vencedora para Enem, Vestibular e Concurso",
      coverQuery: "student writing essay paper desk focused exam preparation serious calm",
      chapterTitles: [
        "Os 5 Critérios de Correção Decifrados Linha a Linha",
        "Introdução Magnética: o Início que Compra a Atenção do Corretor",
        "Argumentação Sólida: Dados, Filosofia e Repertório Sociocultural",
        "Proposta de Intervenção: a Receita dos 5 Elementos Obrigatórios",
        "Erros Fatais: as Marcas que Desclassificam em Segundos",
      ],
      chapterQueries: [
        "student essay highlighted criteria desk red pen correction",
        "student writing first paragraph essay desk focused notebook",
        "student researching philosophers historical data essay desk",
        "student writing intervention proposal essay desk focused",
        "essay corrected red marks errors learning teacher desk",
      ],
    },
    v4: {
      title: "Estudar Trabalhando: o Cronograma de Concurso para Quem Tem 2 Horas por Dia",
      coverQuery: "tired worker studying late night home desk laptop dedication concurso",
      chapterTitles: [
        "Avaliação Realista: o Que Você Consegue em 2 Horas Diárias de Verdade",
        "Edital Verticalizado: o Mapa que Define Suas Prioridades",
        "Ciclos de Estudo de 50 Minutos: a Estrutura para Quem Não Tem Tempo",
        "Microestudo: Áudios, Resumos e Apps na Hora Morta do Dia",
        "Sono, Alimentação e Família: o Tripé da Aprovação de Quem Trabalha",
      ],
      chapterQueries: [
        "tired worker laptop study evening home desk balance",
        "concurso edital document highlighted desk study focused",
        "pomodoro timer study technique desk focused calm",
        "person listening audio commute headphones smartphone learning",
        "person sleeping early bedroom rest concursando preparation",
      ],
    },
  },
  {
    slug: "tecnologia", niche: "Tecnologia e programação",
    v2: {
      title: "JavaScript Moderno do Zero: do Hello World ao Primeiro Projeto Front-End",
      coverQuery: "developer coding javascript laptop screen modern code editor home office",
      chapterTitles: [
        "Sintaxe Essencial: Variáveis, Funções e Estruturas Decifradas",
        "DOM na Prática: Manipulando Páginas HTML com 10 Métodos-Chave",
        "Async, Promises e Fetch: Trazendo Dados da Internet sem Travar",
        "Módulos ES6: Organizando Código Como Profissional desde o Início",
        "Primeiro Projeto Real: To-Do List Completa com LocalStorage",
      ],
      chapterQueries: [
        "javascript code variables functions laptop screen editor close up",
        "developer modifying html dom browser inspector laptop",
        "developer code async await promise editor laptop modern",
        "code editor multiple files modular structure laptop developer",
        "developer building todo app browser laptop project complete",
      ],
    },
    v3: {
      title: "Da Faculdade à Primeira Vaga Dev: Portfólio, GitHub e Estratégia de Carreira",
      coverQuery: "young developer github portfolio laptop screen job interview professional",
      chapterTitles: [
        "Os 3 Projetos de Portfólio que Recrutadores Realmente Olham",
        "GitHub que Vende: README, Commits e Contribuições Open Source",
        "LinkedIn de Dev: Headline, Sobre e Posts que Atraem Vagas",
        "Entrevista Técnica: Live Coding, Algoritmos e Comportamental",
        "Negociação Salarial: Roteiro para Júnior que Não Aceita o Primeiro Valor",
      ],
      chapterQueries: [
        "developer portfolio website laptop projects screen modern",
        "developer github profile contributions activity laptop screen",
        "developer linkedin profile laptop screen professional",
        "developer technical interview whiteboard coding professional",
        "professional negotiation salary meeting office serious",
      ],
    },
    v4: {
      title: "Python para Automação: Pare de Fazer Tarefas Repetitivas Manualmente",
      coverQuery: "developer python automation laptop terminal screen code productivity home",
      chapterTitles: [
        "Por que Python: a Linguagem Ideal para Quem Não é Programador",
        "Manipulando Arquivos: Lendo Excel, PDF e CSV em Massa",
        "Web Scraping Básico: Coletando Dados de Sites Públicos",
        "E-mails Automatizados: Enviando Mensagens Personalizadas em Lote",
        "Agendamento e Bots: Tarefas Rodando Sozinhas todo Dia às 8h",
      ],
      chapterQueries: [
        "python programming language books laptop beginner learning",
        "developer reading excel csv file python script laptop data",
        "developer web scraping browser data extraction laptop",
        "developer automated email script laptop sending mass",
        "developer automation script running scheduled task laptop",
      ],
    },
  },
  {
    slug: "renda-extra", niche: "Renda extra",
    v2: {
      title: "Freelance Internacional: Como Cobrar em Dólar Trabalhando do Brasil",
      coverQuery: "freelancer laptop home office dollar payment international remote work modern",
      chapterTitles: [
        "Plataformas Globais: Upwork, Fiverr e Toptal Comparadas",
        "Portfólio em Inglês: Behance, Dribbble e LinkedIn para Atrair Gringos",
        "Proposta Vencedora: o Pitch de 5 Linhas que Fecha Cliente Internacional",
        "Pagamentos: Wise, Payoneer e Recebimento sem Sangrar em Imposto",
        "Precificando em Dólar: o Cálculo que Triplica seu Faturamento",
      ],
      chapterQueries: [
        "freelancer browsing upwork platform laptop home office",
        "designer portfolio website behance laptop screen creative",
        "freelancer writing proposal client laptop home office focused",
        "person checking wise payoneer app smartphone money transfer",
        "freelancer calculating dollar rate laptop calculator desk",
      ],
    },
    v3: {
      title: "Produtos Digitais que Vendem Sozinhos: o Caminho dos Marketplaces Brasileiros",
      coverQuery: "creator selling digital products laptop hotmart ebook online business home",
      chapterTitles: [
        "Hotmart, Eduzz e Monetizze: Qual Plataforma para Cada Produto",
        "Ebook, Curso ou Comunidade: Decidindo o Formato Inicial",
        "Página de Vendas: a Estrutura de Copy que Converte Visita em Pix",
        "Afiliados: Recrutando Vendedores para Trabalhar por Você",
        "Pós-Venda: Reputação que Sustenta Vendas por Anos",
      ],
      chapterQueries: [
        "creator hotmart dashboard sales product digital laptop",
        "creator deciding ebook course community whiteboard planning",
        "sales page copywriting laptop desk creator home office",
        "affiliate marketing partnership meeting laptop creators",
        "creator answering customer review feedback laptop home",
      ],
    },
    v4: {
      title: "Delivery e Apps Como Negócio: Estratégia Profissional para iFood, Uber e 99",
      coverQuery: "delivery driver scooter ifood uber brazilian city motorcycle worker professional",
      chapterTitles: [
        "Cálculo Real: Quanto Sobra por Hora Descontando Combustível e Manutenção",
        "Melhores Horários e Pontos: Inteligência por Dia e Bairro",
        "Multi-App: Operando iFood, Uber Eats e Rappi em Paralelo",
        "Gestão do Veículo: Manutenção que Multiplica Vida Útil",
        "MEI e Imposto: Formalizando o Operador de App sem Susto",
      ],
      chapterQueries: [
        "delivery driver calculating earnings receipt smartphone notebook",
        "delivery driver smartphone heat map best zones city",
        "delivery driver multiple apps smartphone parking break",
        "motorcycle maintenance mechanic delivery vehicle care",
        "delivery worker tax mei document smartphone professional",
      ],
    },
  },
];

// ---------- Pexels + Storage ----------

async function searchPexels(query: string, orientation: "landscape" | "portrait", exclude: Set<string>): Promise<string | null> {
  let attempt = 0;
  while (true) {
    attempt++;
    const u = new URL("https://api.pexels.com/v1/search");
    u.searchParams.set("query", query);
    u.searchParams.set("per_page", "30");
    u.searchParams.set("orientation", orientation);
    u.searchParams.set("size", "large");
    const resp = await fetch(u.toString(), { headers: { Authorization: PEXELS_API_KEY } });
    if (resp.status === 429 || resp.status >= 500) {
      if (attempt > 5) return null;
      await sleep(2500 * attempt);
      continue;
    }
    if (!resp.ok) return null;
    const data = await resp.json() as { photos: Array<{ id: number; width: number; height: number; src: Record<string, string> }> };
    const ranked = (data.photos ?? [])
      .filter((p) => !exclude.has(String(p.id)))
      .map((p) => ({ p, score: p.width * p.height + (p.width >= 3840 || p.height >= 3840 ? 5_000_000 : 0) }))
      .sort((a, b) => b.score - a.score);
    const pick = ranked[0]?.p;
    if (!pick) return null;
    exclude.add(String(pick.id));
    return pick.src.original || pick.src.large2x || pick.src.large;
  }
}

async function fetchAndUpload(query: string, orientation: "landscape" | "portrait", path: string, exclude: Set<string>): Promise<string | null> {
  const imgUrl = await searchPexels(query, orientation, exclude);
  if (!imgUrl) { console.warn(`  no pexels result: ${query}`); return null; }
  const r = await fetch(imgUrl);
  if (!r.ok) { console.warn(`  download fail ${r.status}: ${query}`); return null; }
  const bytes = new Uint8Array(await r.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: "image/jpeg", upsert: true, cacheControl: "3600",
  });
  if (error) { console.warn(`  upload err: ${error.message}`); return null; }
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return pub.publicUrl;
}

async function processVariant(entry: Entry, vIdx: 2 | 3 | 4, v: Variant, version: number) {
  const exclude = new Set<string>();
  const folder = `templates/${entry.slug}/v${vIdx}-r2`;
  console.log(`\n→ ${entry.niche} v${vIdx} — "${v.title.slice(0, 60)}…"`);

  // Cover
  const coverUrlBase = await fetchAndUpload(v.coverQuery, "portrait", `${folder}/cover.jpg`, exclude);
  if (!coverUrlBase) { console.error(`  ✗ cover failed`); return; }
  const coverUrl = `${coverUrlBase}?v=${version}`;
  console.log(`  ✓ cover`);

  // Chapters: upload + collect URLs
  const newImageUrls: string[] = [];
  for (let i = 0; i < 5; i++) {
    const url = await fetchAndUpload(v.chapterQueries[i], "landscape", `${folder}/chapter-${i + 1}.jpg`, exclude);
    if (!url) { console.error(`  ✗ chapter ${i + 1} failed`); return; }
    newImageUrls.push(`${url}?v=${version}`);
    console.log(`  ✓ ch${i + 1}`);
  }

  // Read existing row (preserve content + subtitle)
  const { data: row, error: readErr } = await supabase
    .from("ebook_templates")
    .select("id, chapters, subtitle")
    .ilike("niche", entry.niche)
    .eq("variant_index", vIdx)
    .maybeSingle();
  if (readErr || !row) { console.error(`  ✗ DB read: ${readErr?.message ?? "not found"}`); return; }

  const oldChapters = (row.chapters as any[]) ?? [];
  const newChapters = oldChapters.map((c, i) => ({
    ...c,
    title: v.chapterTitles[i] ?? c.title,
    image_url: newImageUrls[i] ?? c.image_url,
  }));

  const { error: updErr } = await supabase
    .from("ebook_templates")
    .update({
      title: v.title,
      cover_url: coverUrl,
      chapters: newChapters,
    })
    .eq("id", row.id);
  if (updErr) { console.error(`  ✗ DB update: ${updErr.message}`); return; }
  console.log(`  ✓ DB updated`);
}

async function main() {
  const filter = process.argv.slice(2);
  const list = filter.length ? ENTRIES.filter((e) => filter.includes(e.slug)) : ENTRIES;
  const version = Date.now();

  let coversUpdated = 0;
  let chapterImgsUpdated = 0;
  let titlesUpdated = 0;
  let chapterTitlesUpdated = 0;
  let variantsTouched = 0;

  for (const entry of list) {
    for (const vIdx of [2, 3, 4] as const) {
      const variant = vIdx === 2 ? entry.v2 : vIdx === 3 ? entry.v3 : entry.v4;
      await processVariant(entry, vIdx, variant, version);
      variantsTouched++;
      coversUpdated++;
      chapterImgsUpdated += 5;
      titlesUpdated++;
      chapterTitlesUpdated += 5;
    }
  }

  console.log("\n══════════════ RELATÓRIO FINAL ══════════════");
  console.log(`Nichos processados:               ${list.length}`);
  console.log(`Variantes (2/3/4) atualizadas:    ${variantsTouched}`);
  console.log(`Capas substituídas:               ${coversUpdated}`);
  console.log(`Imagens de capítulos substituídas:${chapterImgsUpdated}`);
  console.log(`Títulos de ebooks substituídos:   ${titlesUpdated}`);
  console.log(`Títulos de capítulos substituídos:${chapterTitlesUpdated}`);
  console.log(`Template 1 de cada nicho:         NÃO ALTERADO`);
  console.log("═════════════════════════════════════════════");
}

main().catch((e) => { console.error(e); process.exit(1); });
