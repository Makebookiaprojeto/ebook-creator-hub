INSERT INTO public.ebook_templates (niche, title, subtitle, audience, cover_url, cover_prompt, is_active, chapters)
VALUES 
(
  'Arquitetura e Decoração', 
  'Decoração Transformativa: Do Zero ao Ambiente dos Sonhos', 
  'Aprenda a decorar sua casa com estilo, funcionalidade e baixo custo.', 
  'Pessoas interessadas em renovar seus lares, recém-casados ou apaixonados por design de interiores.', 
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1080&w=1920',
  'modern luxury living room interior design high resolution 4k',
  true,
  '[
    {
      "title": "Os Fundamentos da Decoração",
      "subtitle": "Equilibrando estética e funcionalidade no seu lar.",
      "content": "Decorar um ambiente vai muito além de escolher móveis bonitos. Trata-se de criar uma narrativa visual que reflita quem você é, enquanto mantém a praticidade necessária para o dia a dia. Neste capítulo, exploraremos os princípios básicos do design: equilíbrio, contraste e proporção. Você aprenderá como a circulação de um espaço define o seu conforto e como pequenos ajustes no layout podem fazer uma sala parecer duas vezes maior. Entender a alma do seu ambiente é o primeiro passo para uma transformação real.",
      "image_url": "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    },
    {
      "title": "A Psicologia das Cores e Iluminação",
      "subtitle": "Como criar atmosferas únicas através de tons e luzes.",
      "content": "As cores têm o poder de alterar nosso humor e percepção. Um azul suave pode trazer calma a um quarto, enquanto um terracota pode aquecer uma sala de estar. Mas a cor não trabalha sozinha; ela depende inteiramente da iluminação. Veremos como combinar luz natural, luz direta para tarefas e iluminação de destaque para criar camadas de profundidade. Aprenda a escolher a temperatura de cor certa (Kelvin) para cada cômodo e como as texturas das paredes reagem a diferentes fontes de luz.",
      "image_url": "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    },
    {
      "title": "Organização e Estilo: Otimizando Espaços",
      "subtitle": "Estratégias inteligentes para manter a casa impecável.",
      "content": "Não existe decoração bonita em uma casa bagunçada. A organização é a base de um design de interiores bem-sucedido. Aqui, focaremos em soluções inteligentes de armazenamento que não sacrificam o estilo. Desde o uso de prateleiras flutuantes até a curadoria de objetos decorativos que contam uma história. Você descobrirá a regra do menos é mais e como o minimalismo funcional pode trazer paz mental. Transforme sua casa em um refúgio de tranquilidade onde cada objeto tem seu lugar e propósito.",
      "image_url": "https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    }
  ]'::jsonb
),
(
  'Moda e Estilo', 
  'O Código do Estilo: Sua Imagem como Ferramenta de Poder', 
  'Descubra sua identidade visual e aprenda a se vestir com confiança em qualquer ocasião.', 
  'Mulheres e homens que buscam melhorar sua autoimagem, profissionais que desejam projetar autoridade ou interessados em moda.', 
  'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1080&w=1920',
  'high fashion photography luxury clothing aesthetic 4k',
  true,
  '[
    {
      "title": "Descobrindo seu Estilo Pessoal",
      "subtitle": "Como alinhar sua personalidade à sua forma de vestir.",
      "content": "Muitas pessoas seguem tendências sem entender se elas realmente combinam com sua essência. O estilo pessoal é uma forma de comunicação não verbal poderosíssima. Neste capítulo, faremos um mergulho interno para identificar seus arquétipos de estilo. Você aprenderá que a moda passa, mas o estilo é eterno. Veremos como analisar seu estilo de vida para construir um guarda-roupa que funcione para você, e não o contrário. Vestir-se bem começa pelo autoconhecimento.",
      "image_url": "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    },
    {
      "title": "Guarda-Roupa Inteligente e Versatilidade",
      "subtitle": "Construindo uma base sólida com peças essenciais.",
      "content": "Ter um armário cheio e nada para vestir é um dilema comum. A solução está no conceito de guarda-roupa cápsula e peças atemporais. Aprenda a investir em qualidade em vez de quantidade. Discutiremos o caimento perfeito (alfaiataria), a importância dos tecidos naturais e como acessórios podem transformar um look básico em algo extraordinário. Você dominará a arte de multiplicar looks com poucas peças, garantindo que esteja sempre elegante sem esforço.",
      "image_url": "https://images.pexels.com/photos/1078958/pexels-photo-1078958.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    },
    {
      "title": "Cromatismo e Proporção Corporal",
      "subtitle": "Técnicas visuais para valorizar sua silhueta.",
      "content": "A cor certa perto do rosto pode iluminar sua expressão ou te deixar com aspecto cansado. Introduziremos os conceitos de análise de coloração pessoal e como as cores transmitem mensagens diferentes no ambiente profissional e social. Além disso, falaremos sobre silhueta e equilíbrio visual: como usar linhas, volumes e estampas a seu favor para valorizar seu tipo físico. A moda é uma ferramenta geométrica que, quando bem usada, harmoniza sua imagem e eleva sua autoconfiança instantaneamente.",
      "image_url": "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    }
  ]'::jsonb
);