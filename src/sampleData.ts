import { DayEntry, PillarKey } from './types';
import { fmtKey, addDays } from './storage';

export function generateSampleHistory(referenceDate: Date = new Date()): Record<string, DayEntry> {
  const history: Record<string, DayEntry> = {};

  const sampleTasks: Record<PillarKey, string[]> = {
    espiritual: [
      '20 min de oração / meditação matinal',
      'Leitura de 2 capítulos do livro sapiencial',
      'Momento de gratidão e diário de reflexão',
      'Desconexão digital 1h antes de dormir',
      'Prática de silêncio e respiração profunda',
    ],
    fisico: [
      'Treino de musculação (peito e tríceps)',
      'Corrida de 5km na esteira/parque',
      'Bater meta de 3 litros de água e dieta limpa',
      'Alongamento e mobilidade articular',
      'Treino funcional de pernas e core',
    ],
    mental: [
      'Estudo focado de 45 min sem interrupções',
      'Leitura de 25 páginas de livro técnico',
      'Revisão dos aprendizados do dia e anotações',
      'Assistir aula do curso de especialização',
      'Prática de raciocínio lógico e escrita reflexiva',
    ],
    familiar: [
      'Jantar presente em família sem celular à mesa',
      'Ligar para os pais e conversar com calma',
      'Brincar 30 min com total atenção com filhos/irmãos',
      'Conversa de alinhamento e carinho com parceiro(a)',
      'Ajudar em casa com tarefas e organização',
    ],
    profissional: [
      'Entregar relatório estratégico do projeto principal',
      'Revisão e limpeza da caixa de e-mails prioritários',
      'Planejamento das metas trimestrais com a equipe',
      'Prospectar 3 novos clientes em potencial',
      'Executar tarefa mais difícil do dia na primeira hora',
    ],
  };

  const excuses = [
    'Falta de tempo',
    'Cansaço / energia baixa',
    'Distração (celular / redes sociais)',
    'Mudança de prioridade',
    'Desconforto / medo da tarefa',
    'Imprevisto / urgência externa',
  ];

  // Generate 18 days of history leading up to yesterday
  for (let i = 18; i >= 1; i--) {
    const targetDate = addDays(referenceDate, -i);
    const dateKey = fmtKey(targetDate);

    // Pick 3-5 pillars for that day
    const pillars: PillarKey[] = ['espiritual', 'fisico', 'mental', 'familiar', 'profissional'];
    const chosenPillars = pillars.slice(0, 3 + (i % 3));

    const plan = chosenPillars.map((p, idx) => ({
      id: `task-${dateKey}-${p}-${idx}`,
      pillar: p,
      text: sampleTasks[p][(i + idx) % sampleTasks[p].length],
    }));

    // Next day plan
    const nextPlan = pillars.map((p, idx) => ({
      id: `task-next-${dateKey}-${p}-${idx}`,
      pillar: p,
      text: sampleTasks[p][(i + idx + 1) % sampleTasks[p].length],
    }));

    // Reviews
    const review = plan.map((task, idx) => {
      // simulate realistic success distribution: ~70% done, 15% partial, 15% not
      const roll = (i * 7 + idx * 13) % 100;
      if (roll < 65) {
        return {
          id: task.id,
          status: 'feito' as const,
          excuse: '',
          excuseOther: '',
          focusShift: '',
          rating: 4 + ((i + idx) % 2),
          comment: (i % 3 === 0) ? 'Execução fluida no primeiro bloco do dia.' : '',
          consequenceShort: 'Sensação de dever cumprido e clareza mental.',
          consequenceMedium: 'Progresso consistente nas metas da semana.',
          consequenceLong: 'Fortalecimento da identidade e disciplina.',
        };
      } else if (roll < 85) {
        return {
          id: task.id,
          status: 'parcial' as const,
          excuse: excuses[(i + idx) % excuses.length],
          excuseOther: '',
          focusShift: 'Mensagens urgentes no WhatsApp e reunião de última hora.',
          rating: 0,
          comment: 'Consegui iniciar, mas fui interrompido antes de concluir.',
          consequenceShort: 'Ficou pendência para amanhã.',
          consequenceMedium: 'Atraso leve no cronograma previsto.',
          consequenceLong: 'Necessidade de recalibrar a rotina.',
        };
      } else {
        return {
          id: task.id,
          status: 'nao' as const,
          excuse: excuses[(i + idx) % excuses.length],
          excuseOther: '',
          focusShift: 'Deixei para o final do dia e a energia esgotou.',
          rating: 0,
          comment: 'Preciso blindar o horário pela manhã.',
          consequenceShort: 'Culpa momentânea e frustração.',
          consequenceMedium: 'Acúmulo de tarefas.',
          consequenceLong: 'Risco de perder consistência no pilar.',
        };
      }
    });

    const dayNotesList = [
      'Dia produtivo. Foco em manter o ritmo sem acelerar demais.',
      'Manhã muito boa com rotina matinal cumprida. Tarde um pouco truncada.',
      'Boa clareza mental hoje. As conversas foram alinhadas e produtivas.',
      'Dia com algumas distrações, mas consegui resgatar o controle no final.',
      'Foco e execução sólidos nos pilares prioritários.',
    ];

    history[dateKey] = {
      date: dateKey,
      dayNotes: dayNotesList[i % dayNotesList.length],
      plan,
      review,
      nextPlan,
      closed: true,
      closedAt: `${dateKey}T21:30:00.000Z`,
    };
  }

  return history;
}
