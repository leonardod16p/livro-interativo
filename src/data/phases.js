// As 7 fases da trilha, na ordem em que a raposa as encontra subindo o
// tronco. As 3 primeiras ficam perto da base (raízes) e são as perguntas
// fundamentais; as 4 seguintes ficam mais acima, no tronco, e são os
// blocos de abstração — na MESMA ordem obrigatória do projeto de
// raízes/tronco original (intuição -> geometria/física -> analogias -> abstração).
//
// `t` é a posição (0 a 1) ao longo da trilha real (ver utils/treePath.js).
// `group` é só pra UI ('raiz' | 'tronco').
//
// Tipos de passo suportados (mesmo contrato do projeto base, veja
// src/components/lesson/): 'text', 'quiz', 'reflection'.

export const PHASES = [
  // ---------- RAÍZES: as 3 perguntas fundamentais ----------
  {
    id: 'oqueeh',
    group: 'raiz',
    t: 0.06,
    title: 'O que é?',
    subtitle: 'Nomear a coisa',
    color: '#e8a33d',
    lesson: {
      title: 'Nomear antes de resolver',
      steps: [
        {
          type: 'text',
          title: 'Antes de tudo, o que é isso?',
          body: 'A primeira pergunta nunca é "como resolver" — é "o que é, de fato, essa coisa". Dar nome exato ao que você está olhando é o que separa uma investigação de um chute no escuro. Se você não consegue descrever o objeto com precisão, ainda não está pronto pra mexer nele.',
        },
        {
          type: 'quiz',
          prompt: 'Qual das opções abaixo é uma definição precisa (e não só uma descrição vaga)?',
          options: [
            '"É tipo uma curva estranha que sobe"',
            '"Um número que representa o quanto uma quantidade muda"',
            '"Uma coisa meio complicada da matemática"',
            '"Aquele símbolo que aparece nas fórmulas"',
          ],
          correctIndex: 1,
          explanation:
            'Uma boa definição diz exatamente o que a coisa É e o que ela FAZ — "representa o quanto uma quantidade muda" cumpre isso. As outras são só impressões, não definições.',
        },
      ],
    },
  },
  {
    id: 'como',
    group: 'raiz',
    t: 0.14,
    title: 'Como?',
    subtitle: 'O caminho até lá',
    color: '#d98a3d',
    lesson: {
      title: 'Do nome ao processo',
      steps: [
        {
          type: 'text',
          title: 'Depois de nomear, vem o caminho',
          body: 'Saber o nome da coisa não basta — agora é preciso entender por quais passos ela é construída ou calculada. "Como" é a pergunta que transforma uma ideia abstrata em um processo que você consegue repetir, passo a passo, sempre que precisar.',
        },
        {
          type: 'quiz',
          prompt: 'Você quer entender "como" uma receita de bolo funciona. Qual pergunta te ajuda mais?',
          options: [
            'De que cor é a forma do bolo?',
            'Em que ordem os ingredientes são misturados e por quanto tempo assa?',
            'Quem inventou o bolo?',
            'Quantas calorias tem uma fatia?',
          ],
          correctIndex: 1,
          explanation:
            'A pergunta "como" busca o processo: ordem dos passos, o que depende do quê. As outras perguntas são curiosidades válidas, mas não descrevem o processo.',
        },
        {
          type: 'reflection',
          prompt: 'Pense em algo que você sabe fazer bem. Se tivesse que explicar o "como" pra alguém em 3 passos, quais seriam?',
          placeholder: 'Escreva livremente aqui...',
        },
      ],
    },
  },
  {
    id: 'porque',
    group: 'raiz',
    t: 0.22,
    title: 'Por quê?',
    subtitle: 'A razão por trás',
    color: '#c97a3d',
    lesson: {
      title: 'A raiz da raiz',
      steps: [
        {
          type: 'text',
          title: 'O que sustenta o "como"',
          body: 'Todo processo (o "como") existe por um motivo. Perguntar "por quê" é ir atrás da raiz mais funda: por que esse método funciona e não outro? O que aconteceria se essa regra não existisse? É essa pergunta que transforma "decorar um processo" em "entender de verdade".',
        },
        {
          type: 'quiz',
          prompt: 'Por que multiplicamos base × altura pra achar a área de um retângulo?',
          options: [
            'Porque um professor decidiu arbitrariamente essa fórmula',
            'Porque é a forma mais rápida de escrever no quadro',
            'Porque a área conta quantos quadradinhos unitários cabem dentro, e isso é exatamente base vezes altura',
            'Não existe uma razão, é só uma convenção',
          ],
          correctIndex: 2,
          explanation:
            'A fórmula não é arbitrária: se você imaginar o retângulo coberto por quadradinhos de lado 1, o número de linhas é a altura e o número de colunas é a base — multiplicar as duas contagens dá o total de quadradinhos, ou seja, a área.',
        },
      ],
    },
  },

  // ---------- TRONCO: os 4 blocos de abstração, em ordem obrigatória ----------
  {
    id: 'intuition',
    group: 'tronco',
    t: 0.42,
    title: 'Intuição',
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
    id: 'geometry',
    group: 'tronco',
    t: 0.58,
    title: 'Geometria/Física',
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
    id: 'analysis',
    group: 'tronco',
    t: 0.74,
    title: 'Analogias',
    subtitle: '(conteúdo provisório — ajustar depois)',
    color: '#5ccf9b',
    lesson: {
      title: 'Placeholder — Analogias',
      steps: [
        {
          type: 'text',
          title: 'Um mesmo padrão, roupas diferentes',
          body: '[Conteúdo provisório] Uma analogia funciona quando duas situações diferentes escondem a mesma estrutura por baixo. Este texto é um placeholder simples — substitua pelo conteúdo definitivo da fase de Analogias quando estiver pronto.',
        },
        {
          type: 'quiz',
          prompt: '[Placeholder] Qual par de coisas costuma ser usado como analogia clássica pra explicar fluxo?',
          options: ['Água correndo em um cano e corrente elétrica', 'Cor e cheiro', 'Nome e sobrenome', 'Dia e mês'],
          correctIndex: 0,
          explanation: '[Placeholder] Água em um cano e corrente elétrica compartilham a mesma estrutura matemática de fluxo — troque por um exemplo definitivo quando o conteúdo da fase for escrito.',
        },
      ],
    },
  },
  {
    id: 'topology',
    group: 'tronco',
    t: 0.90,
    title: 'Abstração',
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

export function phaseById(id) {
  return PHASES.find((p) => p.id === id)
}

export const ROOT_PHASES = PHASES.filter((p) => p.group === 'raiz')
export const TRUNK_PHASES = PHASES.filter((p) => p.group === 'tronco')
