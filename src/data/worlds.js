// Os 4 "mundos" são pontos ao longo da espiral (t de 0 a 1).
// Cada um representa uma fase do jogo / uma aula futura.
//
// Cada mundo agora tem uma `lesson.steps`: uma sequência de passos que o
// MissionPanel percorre um a um. Essa é a estrutura que futuramente vira
// a aula interativa de verdade — hoje já dá pra brincar com texto,
// perguntas de múltipla escolha e reflexões abertas.
//
// Tipos de passo suportados (veja src/components/lesson/):
//   { type: 'text',       title, body }
//   { type: 'quiz',       prompt, options: [string, ...], correctIndex, explanation }
//   { type: 'reflection', prompt, placeholder }

export const WORLDS = [
  {
    id: 'perguntas',
    t: 0.18,
    title: 'Mundo das Perguntas',
    subtitle: 'Onde tudo começa',
    color: '#e8a33d',
    lesson: {
      title: 'A primeira pergunta',
      steps: [
        {
          type: 'text',
          title: 'Antes da resposta',
          body: 'Toda descoberta começa com uma boa pergunta, não com uma resposta pronta. Antes de tentar resolver algo, vale mais perguntar "por quê?" e "como?" do que sair procurando a solução direto.',
        },
        {
          type: 'quiz',
          prompt: 'Qual dessas é a melhor forma de começar a investigar um problema novo?',
          options: [
            'Procurar a resposta certa o mais rápido possível',
            'Observar com calma e perguntar por que o problema existe',
            'Ignorar o problema até ele desaparecer',
            'Copiar a solução de um problema parecido, sem verificar se serve',
          ],
          correctIndex: 1,
          explanation:
            'Observar e perguntar "por quê" antes de agir evita resolver o problema errado — a pressa em responder costuma pular a parte mais importante.',
        },
      ],
    },
  },
  {
    id: 'intuicao',
    t: 0.42,
    title: 'Mundo da Intuição',
    subtitle: 'Sentir antes de provar',
    color: '#9b7fd4',
    lesson: {
      title: 'Confie no palpite',
      steps: [
        {
          type: 'text',
          title: 'O primeiro chute',
          body: 'Nem tudo precisa de prova imediata. Antes de calcular, treine o palpite: o que "parece" certo? A intuição não substitui a prova, mas ajuda a saber por onde começar a procurar.',
        },
        {
          type: 'quiz',
          prompt: 'Sem calcular — só no chute — o que parece maior?',
          options: ['37% de 240', 'Metade de 100', 'São praticamente iguais', 'Impossível saber sem calcular'],
          correctIndex: 0,
          explanation:
            '37% de 240 é 88,8 — bem maior que metade de 100 (que é 50). O primeiro instinto de "são parecidos" costuma enganar quando os números vêm em formatos diferentes (porcentagem vs. fração).',
        },
        {
          type: 'reflection',
          prompt: 'Teve algum momento nessa pergunta em que seu primeiro instinto mudou? O que fez você duvidar do primeiro palpite?',
          placeholder: 'Escreva livremente aqui...',
        },
      ],
    },
  },
  {
    id: 'fisica',
    t: 0.68,
    title: 'Mundo da Física e Geometria',
    subtitle: 'A forma das coisas',
    color: '#4fc3e0',
    lesson: {
      title: 'Formas que se movem',
      steps: [
        {
          type: 'text',
          title: 'Da intuição à precisão',
          body: 'Aqui o palpite vira cálculo. Formas, forças e espaço seguem regras exatas — e entender essas regras é o que permite prever como algo vai se comportar antes mesmo de testar.',
        },
        {
          type: 'quiz',
          prompt: 'Um quadrado tem lado igual a 4. Qual é a sua área?',
          options: ['8', '12', '16', '20'],
          correctIndex: 2,
          explanation: 'Área do quadrado é lado × lado: 4 × 4 = 16.',
        },
      ],
    },
  },
  {
    id: 'abstracao',
    t: 0.92,
    title: 'Mundo da Abstração',
    subtitle: 'O topo da árvore',
    color: '#d45c9b',
    lesson: {
      title: 'Além da forma',
      steps: [
        {
          type: 'text',
          title: 'Soltando o concreto',
          body: 'No topo, as ideias se soltam dos números e formas específicas. Você começa a enxergar padrões que se repetem em coisas completamente diferentes — é isso que conecta tudo que veio antes.',
        },
        {
          type: 'quiz',
          prompt: 'Qual número continua a sequência: 2, 4, 8, 16, ?',
          options: ['18', '24', '32', '20'],
          correctIndex: 2,
          explanation: 'Cada número é o dobro do anterior: 16 × 2 = 32.',
        },
        {
          type: 'reflection',
          prompt: 'Você percebeu o padrão pela regra (dobrar) ou pelo formato dos números? Existe alguma outra sequência do seu dia a dia que segue uma regra parecida?',
          placeholder: 'Escreva livremente aqui...',
        },
      ],
    },
  },
]

export function worldById(id) {
  return WORLDS.find((w) => w.id === id)
}
