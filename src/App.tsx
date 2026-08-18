import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Sparkles, Dumbbell, Brain, Home, Briefcase, User, Plus, X, Star,
  Flame, Check, Minus, Stamp, MessageSquarePlus, CalendarDays,
  Pencil, Save, CheckCircle2, Clock, ChevronLeft, ChevronRight, ArrowLeft,
  Copy, ChevronDown, ChevronUp, Download, Upload, FileJson, FileSpreadsheet,
  Database, FolderUp, AlertCircle, Quote, Shuffle, Lightbulb, AlertTriangle,
  TrendingUp, TrendingDown, Compass
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";

export interface DailyQuote {
  quote: string;
  author: string;
  source?: string;
  tag: string;
  insight: string;
}

export const STOIC_QUOTES: DailyQuote[] = [
  {
    quote: "Você tem poder sobre a sua mente, não sobre os acontecimentos externos. Compreenda isso e encontrará a sua verdadeira força.",
    author: "Marco Aurélio",
    source: "Meditações",
    tag: "Foco & Controle",
    insight: "Concentre 100% da sua energia nas tarefas que você mesmo pode executar hoje.",
  },
  {
    quote: "Não é porque as coisas são difíceis que não ousamos; é porque não ousamos que elas são difíceis.",
    author: "Sêneca",
    source: "Cartas a Lucílio",
    tag: "Ação Imediata",
    insight: "Comece pela tarefa que mais tem evitado. O atrito inicial é apenas uma ilusão da mente.",
  },
  {
    quote: "Primeiro diga a si mesmo o que você gostaria de ser; depois, faça o que tiver que fazer.",
    author: "Epicteto",
    source: "Discursos",
    tag: "Identidade & Disciplina",
    insight: "Cada tarefa cumprida hoje é um voto na pessoa disciplinada e realizadora que você está construindo.",
  },
  {
    quote: "Não desperdice mais tempo discutindo sobre o que um bom homem deve ser. Seja um.",
    author: "Marco Aurélio",
    source: "Meditações",
    tag: "Execução Prática",
    insight: "Menos planejamento abstrato, mais blocos de tempo concluídos sem distrações.",
  },
  {
    quote: "A sorte é o que acontece quando a preparação encontra a oportunidade.",
    author: "Sêneca",
    source: "Tratados Filosóficos",
    tag: "Preparação",
    insight: "O plano de amanhã traçado com clareza hoje à noite é a sua maior vantagem competitiva.",
  },
  {
    quote: "Se você deseja melhorar, esteja disposto a parecer ignorante ou tolo em coisas externas.",
    author: "Epicteto",
    source: "Encheirídion",
    tag: "Crescimento Pessoal",
    insight: "A consistência imperfeita diária sempre vence a inércia da perfeição paralisante.",
  },
  {
    quote: "A brevidade da vida não é uma desgraça; o desperdício dela, sim.",
    author: "Sêneca",
    source: "Sobre a Brevidade da Vida",
    tag: "Gestão do Tempo",
    insight: "Elimine estímulos fúteis antes de abrir seu bloco de metas profissionais.",
  },
  {
    quote: "A alma torna-se tingida com a cor dos seus pensamentos e hábitos.",
    author: "Marco Aurélio",
    source: "Meditações",
    tag: "Clareza Mental",
    insight: "Revise com sinceridade as desculpas de hoje para desarmá-las amanhã.",
  },
  {
    quote: "Nenhum homem é livre se não for senhor de si mesmo.",
    author: "Epicteto",
    source: "Fragmentos",
    tag: "Autodomínio",
    insight: "Cumprir as metas dos seus pilares é a forma mais sólida de liberdade e soberania pessoal.",
  },
  {
    quote: "O obstáculo no caminho torna-se o caminho. O que impede a ação move a ação.",
    author: "Marco Aurélio",
    source: "Meditações",
    tag: "Resiliência",
    insight: "Quando um imprevisto surgir no trabalho, encare-o como um treino de calma e método.",
  },
  {
    quote: "Trabalhe para aprender a querer apenas aquilo que realmente depende de você.",
    author: "Epicteto",
    source: "Manual de Vida",
    tag: "Paz de Espírito",
    insight: "Dê o seu melhor esforço em cada atividade e não sofra com o que foge ao seu controle.",
  },
  {
    quote: "Comece cada dia dizendo a si mesmo: hoje lidarei com pressões e ruídos, mas minha clareza não será perturbada.",
    author: "Marco Aurélio",
    source: "Meditações",
    tag: "Blindagem Emocional",
    insight: "Mantenha o compromisso com suas metas mesmo em dias agitados ou desafiadores.",
  },
  {
    quote: "Nada é tão lamentável quanto a mente de quem vive antecipando o futuro com ansiedade.",
    author: "Sêneca",
    source: "Cartas a Lucílio",
    tag: "Presença & Foco",
    insight: "Execute uma meta de cada vez. O dia se vence passo a passo.",
  },
  {
    quote: "Pense no tempo que você já desperdiçou adiando decisões. Há um limite para a sua existência.",
    author: "Marco Aurélio",
    source: "Meditações",
    tag: "Urgência Consciente",
    insight: "Não empurre tarefas difíceis para mais tarde; vença a resistência agora.",
  },
  {
    quote: "A excelência não é um ato isolado, mas um hábito construído repetição após repetição.",
    author: "Aristóteles / Sêneca",
    source: "Filosofia Prática",
    tag: "Hábitos Sólidos",
    insight: "Mesmo em dias parciais, completar 1 meta chave mantém a sua ofensiva viva.",
  }
];

export interface Pillar {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
}

export interface Task {
  id: string;
  pillar: string;
  text: string;
}

export interface TaskReviewItem {
  id: string;
  status: "feito" | "parcial" | "nao" | null;
  excuse: string;
  excuseOther: string;
  focusShift: string;
  rating: number;
  comment: string;
  consequenceShort: string;
  consequenceMedium: string;
  consequenceLong: string;
}

export interface DayEntry {
  date: string; // YYYY-MM-DD
  dayNotes: string;
  plan: Task[];
  review: TaskReviewItem[];
  nextPlan: Task[];
  closed: boolean;
}

const PILLARS: Pillar[] = [
  { key: "espiritual", label: "Espiritual", icon: Sparkles, color: "#9B87C4" },
  { key: "fisico", label: "Físico", icon: Dumbbell, color: "#4FBFA8" },
  { key: "mental", label: "Mental", icon: Brain, color: "#5B8FC7" },
  { key: "familiar", label: "Familiar", icon: Home, color: "#D98B6B" },
  { key: "profissional", label: "Profissional", icon: Briefcase, color: "#C9A961" },
  { key: "pessoais", label: "Atividades pessoais", icon: User, color: "#E07A9A" },
];

const EXCUSES = [
  "Falta de tempo",
  "Cansaço / energia baixa",
  "Distração (celular / redes sociais)",
  "Mudança de prioridade",
  "Desconforto / medo da tarefa",
  "Imprevisto / urgência externa",
  "Falta de clareza no que fazer",
  "Outro",
];

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

const pad = (n: number) => String(n).padStart(2, "0");
const fmtKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, n: number) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};
const longDate = (d: Date) =>
  d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const newId = () => Math.random().toString(36).slice(2, 9);
const pillarOf = (key: string) => PILLARS.find((p) => p.key === key) || PILLARS[0];

function emptyEntry(dateKey: string, plan: Task[] = []): DayEntry {
  return {
    date: dateKey,
    dayNotes: "",
    plan,
    review: plan.map((p) => ({
      id: p.id,
      status: null,
      excuse: "",
      excuseOther: "",
      focusShift: "",
      rating: 0,
      comment: "",
      consequenceShort: "",
      consequenceMedium: "",
      consequenceLong: "",
    })),
    nextPlan: [],
    closed: false,
  };
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

const STORAGE_PREFIX = "w1_live_entry:";

// Purge any legacy simulated keys once
try {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith("w1_entry:") || k.startsWith("entry:"))) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
} catch {
  // ignore
}

function safeGet(key: string): DayEntry | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: DayEntry): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error("Erro ao salvar:", e);
  }
}

// Export history as formatted JSON backup (100% roundtrip)
function exportHistoryAsJson(historyMap: Record<string, DayEntry>, todayEntry?: DayEntry) {
  const fullMap: Record<string, DayEntry> = { ...historyMap };
  if (todayEntry && todayEntry.date) {
    fullMap[todayEntry.date] = todayEntry;
  }
  const payload = {
    app: "Registro Diario de Metas & Revisao",
    version: 1,
    exportedAt: new Date().toISOString(),
    totalDays: Object.keys(fullMap).length,
    historyMap: fullMap,
  };
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const todayStr = fmtKey(new Date());
  a.href = url;
  a.download = `backup-metas-diarias-${todayStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export history as UTF-8 CSV spreadsheet
function exportHistoryAsCsv(historyMap: Record<string, DayEntry>, todayEntry?: DayEntry) {
  const fullMap: Record<string, DayEntry> = { ...historyMap };
  if (todayEntry && todayEntry.date) {
    fullMap[todayEntry.date] = todayEntry;
  }

  const escapeCsv = (str: any) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const headers = [
    "Data",
    "Dia da Semana",
    "Status do Dia",
    "Notas do Dia",
    "Pilar",
    "Tarefa / Meta",
    "Status da Tarefa",
    "Avaliação (1-5)",
    "Desculpa",
    "Outra Desculpa",
    "Desvio de Foco",
    "Consequência Curto Prazo",
    "Consequência Médio Prazo",
    "Consequência Longo Prazo",
    "Comentário da Tarefa",
    "Metas para Amanhã"
  ];

  const rows: string[] = [headers.join(",")];
  const sortedKeys = Object.keys(fullMap).sort();

  sortedKeys.forEach((dateKey) => {
    const entry = fullMap[dateKey];
    if (!entry) return;
    const dateObj = new Date(dateKey + "T00:00:00");
    const weekDayStr = dateObj.toLocaleDateString("pt-BR", { weekday: "long" });
    const dayStatus = entry.closed ? "Fechado" : "Aberto";
    const dayNotes = entry.dayNotes || "";
    const nextPlanSummary = (entry.nextPlan || [])
      .map((t) => `[${pillarOf(t.pillar).label}] ${t.text}`)
      .join(" | ");

    if (entry.plan && entry.plan.length > 0) {
      entry.plan.forEach((task) => {
        const p = pillarOf(task.pillar);
        const r = entry.review?.find((x) => x.id === task.id);
        const statusLabel =
          r?.status === "feito"
            ? "Feito"
            : r?.status === "parcial"
            ? "Parcial"
            : r?.status === "nao"
            ? "Não feito"
            : "Não avaliado";

        rows.push(
          [
            escapeCsv(dateKey),
            escapeCsv(cap(weekDayStr)),
            escapeCsv(dayStatus),
            escapeCsv(dayNotes),
            escapeCsv(p.label),
            escapeCsv(task.text),
            escapeCsv(statusLabel),
            escapeCsv(r?.rating || ""),
            escapeCsv(r?.excuse || ""),
            escapeCsv(r?.excuseOther || ""),
            escapeCsv(r?.focusShift || ""),
            escapeCsv(r?.consequenceShort || ""),
            escapeCsv(r?.consequenceMedium || ""),
            escapeCsv(r?.consequenceLong || ""),
            escapeCsv(r?.comment || ""),
            escapeCsv(nextPlanSummary)
          ].join(",")
        );
      });
    } else {
      rows.push(
        [
          escapeCsv(dateKey),
          escapeCsv(cap(weekDayStr)),
          escapeCsv(dayStatus),
          escapeCsv(dayNotes),
          escapeCsv(""),
          escapeCsv("Nenhuma tarefa planejada"),
          escapeCsv(""),
          escapeCsv(""),
          escapeCsv(""),
          escapeCsv(""),
          escapeCsv(""),
          escapeCsv(""),
          escapeCsv(""),
          escapeCsv(""),
          escapeCsv(""),
          escapeCsv(nextPlanSummary)
        ].join(",")
      );
    }
  });

  const csvContent = "\uFEFF" + rows.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const todayStr = fmtKey(new Date());
  a.href = url;
  a.download = `relatorio-metas-diarias-${todayStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Parse and import backup JSON file
function parseAndImportBackup(
  rawJson: string,
  onSuccess: (importedCount: number) => void,
  onError: (msg: string) => void,
  onUpdateState: (newMap: Record<string, DayEntry>) => void,
  todayKey: string,
  onUpdateTodayEntry?: (entry: DayEntry) => void
) {
  try {
    const data = JSON.parse(rawJson);
    let mapToImport: Record<string, DayEntry> = {};

    if (data && typeof data === "object") {
      if (data.historyMap && typeof data.historyMap === "object") {
        mapToImport = data.historyMap;
      } else if (data.data && typeof data.data === "object") {
        mapToImport = data.data;
      } else if (Array.isArray(data)) {
        data.forEach((item: any) => {
          if (item && item.date) {
            mapToImport[item.date] = item;
          }
        });
      } else {
        Object.keys(data).forEach((key) => {
          if (typeof data[key] === "object" && data[key] !== null) {
            mapToImport[key] = data[key];
          }
        });
      }
    }

    const importedKeys = Object.keys(mapToImport).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k));
    if (importedKeys.length === 0) {
      onError("Arquivo inválido: nenhuma data de registro no formato AAAA-MM-DD foi encontrada.");
      return;
    }

    let count = 0;
    const currentMap: Record<string, DayEntry> = {};

    // Load existing items from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        const val = localStorage.getItem(k);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (parsed && parsed.date) currentMap[parsed.date] = parsed;
          } catch {}
        }
      }
    }

    importedKeys.forEach((key) => {
      const item = mapToImport[key];
      if (item && typeof item === "object") {
        const sanitized: DayEntry = {
          date: item.date || key,
          dayNotes: typeof item.dayNotes === "string" ? item.dayNotes : "",
          plan: Array.isArray(item.plan) ? item.plan : [],
          review: Array.isArray(item.review) ? item.review : [],
          nextPlan: Array.isArray(item.nextPlan) ? item.nextPlan : [],
          closed: !!item.closed,
        };
        safeSet(key, sanitized);
        currentMap[key] = sanitized;
        count++;
      }
    });

    onUpdateState({ ...currentMap });
    if (currentMap[todayKey] && onUpdateTodayEntry) {
      onUpdateTodayEntry(currentMap[todayKey]);
    }
    onSuccess(count);
  } catch (err: any) {
    onError(`Erro ao ler arquivo: ${err?.message || "Formato JSON inválido"}`);
  }
}

export default function App() {
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);
  const todayKey = useMemo(() => fmtKey(today), [today]);
  const tomorrowKey = useMemo(() => fmtKey(tomorrow), [tomorrow]);
  const yesterdayKey = useMemo(() => fmtKey(addDays(today, -1)), [today]);

  const [historyMap, setHistoryMap] = useState<Record<string, DayEntry>>(() => {
    const map: Record<string, DayEntry> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        const val = localStorage.getItem(k);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (parsed && parsed.date) {
              map[parsed.date] = parsed;
            }
          } catch {
            // ignore
          }
        }
      }
    }
    return map;
  });

  const [entry, setEntry] = useState<DayEntry>(() => {
    const existing = safeGet(todayKey);
    if (existing) return existing;
    const y = safeGet(yesterdayKey);
    const plan = (y && Array.isArray(y.nextPlan) && y.nextPlan.length > 0) ? y.nextPlan : [];
    const newDay = emptyEntry(todayKey, plan);
    safeSet(todayKey, newDay);
    return newDay;
  });

  const [monthCursor, setMonthCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [newTaskText, setNewTaskText] = useState<Record<string, string>>({});
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState<string>("");
  const [notesSavedAlert, setNotesSavedAlert] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef<any>(null);

  // Helper to sync tomorrow's entry in historyMap and storage whenever nextPlan changes
  const syncTomorrowWithNextPlan = (nextPlanTasks: Task[]) => {
    const currentTomorrow = safeGet(tomorrowKey) || emptyEntry(tomorrowKey, nextPlanTasks);
    const syncedTomorrow: DayEntry = {
      ...currentTomorrow,
      date: tomorrowKey,
      plan: nextPlanTasks,
      review: nextPlanTasks.map((t) => {
        const existingReview = currentTomorrow.review?.find((r) => r.id === t.id);
        return (
          existingReview || {
            id: t.id,
            status: null,
            excuse: "",
            excuseOther: "",
            focusShift: "",
            rating: 0,
            comment: "",
            consequenceShort: "",
            consequenceMedium: "",
            consequenceLong: "",
          }
        );
      }),
    };
    safeSet(tomorrowKey, syncedTomorrow);
    setHistoryMap((h) => ({ ...h, [tomorrowKey]: syncedTomorrow }));
  };

  // Sync today's entry to localStorage, historyMap, and tomorrow's entry
  const updateEntry = (updater: DayEntry | ((prev: DayEntry) => DayEntry)) => {
    setEntry((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      setSaving(true);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        safeSet(todayKey, next);
        setHistoryMap((h) => ({ ...h, [todayKey]: next }));
        syncTomorrowWithNextPlan(next.nextPlan || []);
        setSaving(false);
      }, 250);
      return next;
    });
  };

  // Keep tomorrow synced on initial load if entry.nextPlan has items
  useEffect(() => {
    if (entry.nextPlan && entry.nextPlan.length > 0) {
      syncTomorrowWithNextPlan(entry.nextPlan);
    }
  }, [entry.nextPlan, tomorrowKey]);

  // Save notes explicitly with confirmation button
  const handleSaveNotes = () => {
    safeSet(todayKey, entry);
    setHistoryMap((h) => ({ ...h, [todayKey]: entry }));
    setNotesSavedAlert(true);
    setTimeout(() => {
      setNotesSavedAlert(false);
    }, 2200);
  };

  const [mirrorSavedAlert, setMirrorSavedAlert] = useState(false);

  // Mirror today's planned tasks to tomorrow's plan
  function mirrorTodayTasksToTomorrow() {
    if (!entry.plan || entry.plan.length === 0) return;
    const mirrored: Task[] = entry.plan.map((t) => ({
      id: newId(),
      pillar: t.pillar,
      text: t.text,
    }));

    updateEntry((e) => {
      const existingKeys = new Set(
        (e.nextPlan || []).map((t) => `${t.pillar}:${t.text.trim().toLowerCase()}`)
      );
      const toAdd = mirrored.filter(
        (t) => !existingKeys.has(`${t.pillar}:${t.text.trim().toLowerCase()}`)
      );

      const updatedNext = toAdd.length > 0 ? [...(e.nextPlan || []), ...toAdd] : [...(e.nextPlan || [])];
      const finalNext = (e.nextPlan || []).length === 0 ? mirrored : updatedNext;
      syncTomorrowWithNextPlan(finalNext);
      return {
        ...e,
        nextPlan: finalNext,
      };
    });

    setMirrorSavedAlert(true);
    setTimeout(() => {
      setMirrorSavedAlert(false);
    }, 2400);
  }

  // Task review updates
  function updateReview(id: string, patch: Partial<TaskReviewItem>) {
    updateEntry((e) => ({
      ...e,
      review: e.review.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }

  // Edit today's task text
  function saveEditingTodayTask(id: string) {
    if (!editingTaskText.trim()) return;
    updateEntry((e) => ({
      ...e,
      plan: e.plan.map((t) => (t.id === id ? { ...t, text: editingTaskText.trim() } : t)),
    }));
    setEditingTaskId(null);
    setEditingTaskText("");
  }

  // Edit tomorrow's task text
  function saveEditingTomorrowTask(id: string) {
    if (!editingTaskText.trim()) return;
    updateEntry((e) => {
      const updatedNext = e.nextPlan.map((t) =>
        t.id === id ? { ...t, text: editingTaskText.trim() } : t
      );
      syncTomorrowWithNextPlan(updatedNext);
      return {
        ...e,
        nextPlan: updatedNext,
      };
    });
    setEditingTaskId(null);
    setEditingTaskText("");
  }

  // Add task for today
  function addTodayTask(pillarKey: string, customText?: string) {
    const key = "today-" + pillarKey;
    const text = (customText !== undefined ? customText : (newTaskText[key] || "")).trim();
    if (!text) return;
    const task: Task = { id: newId(), pillar: pillarKey, text };
    updateEntry((e) => ({
      ...e,
      plan: [...e.plan, task],
      review: [
        ...e.review,
        {
          id: task.id,
          status: null,
          excuse: "",
          excuseOther: "",
          focusShift: "",
          rating: 0,
          comment: "",
          consequenceShort: "",
          consequenceMedium: "",
          consequenceLong: "",
        },
      ],
    }));
    setNewTaskText((s) => ({ ...s, [key]: "" }));
  }

  // Remove today's task
  function removeTodayTask(id: string) {
    updateEntry((e) => ({
      ...e,
      plan: e.plan.filter((t) => t.id !== id),
      review: e.review.filter((r) => r.id !== id),
    }));
  }

  // Add tomorrow's task
  function addTomorrowTask(pillarKey: string) {
    const text = (newTaskText[pillarKey] || "").trim();
    if (!text) return;
    const newTask = { id: newId(), pillar: pillarKey, text };
    updateEntry((e) => {
      const updatedNext = [...e.nextPlan, newTask];
      syncTomorrowWithNextPlan(updatedNext);
      return {
        ...e,
        nextPlan: updatedNext,
      };
    });
    setNewTaskText((s) => ({ ...s, [pillarKey]: "" }));
  }

  // Remove tomorrow's task
  function removeTomorrowTask(id: string) {
    updateEntry((e) => {
      const updatedNext = e.nextPlan.filter((t) => t.id !== id);
      syncTomorrowWithNextPlan(updatedNext);
      return {
        ...e,
        nextPlan: updatedNext,
      };
    });
  }

  function closeDay() {
    const closedEntry = { ...entry, closed: true };
    updateEntry(closedEntry);
    safeSet(todayKey, closedEntry);
    setHistoryMap((prev) => ({ ...prev, [todayKey]: closedEntry }));
  }

  function reopen() {
    const reopened = { ...entry, closed: false };
    updateEntry(reopened);
    safeSet(todayKey, reopened);
    setHistoryMap((prev) => ({ ...prev, [todayKey]: reopened }));
  }

  // Update selected history entry when editing a past or future day
  function updateHistoryEntry(dateKey: string, updater: (prev: DayEntry) => DayEntry) {
    setHistoryMap((prev) => {
      const current = prev[dateKey] || emptyEntry(dateKey, []);
      const updated = updater(current);
      safeSet(dateKey, updated);

      // If updating tomorrow's plan from the detail view, sync back to today's nextPlan
      if (dateKey === tomorrowKey) {
        setEntry((e) => {
          const next = { ...e, nextPlan: updated.plan || [] };
          safeSet(todayKey, next);
          return next;
        });
      }

      return { ...prev, [dateKey]: updated };
    });
  }

  const allReviewed =
    entry.plan.length === 0 || entry.review.every((r) => r.status !== null);
  const isToday = selectedKey === todayKey;
  const isTomorrow = selectedKey === tomorrowKey;

  // Derive selected entry with tomorrow fallback
  const selectedEntry = useMemo(() => {
    if (isToday) return entry;
    if (isTomorrow) {
      return (
        historyMap[tomorrowKey] ||
        safeGet(tomorrowKey) ||
        emptyEntry(tomorrowKey, entry.nextPlan || [])
      );
    }
    return historyMap[selectedKey] || safeGet(selectedKey);
  }, [isToday, isTomorrow, selectedKey, entry, historyMap, tomorrowKey]);

  // Streak counter
  let streak = 0;
  let cursorDate = entry.closed ? today : addDays(today, -1);
  while (true) {
    const k = fmtKey(cursorDate);
    const d = k === todayKey ? entry : historyMap[k];
    if (d && d.closed) {
      streak++;
      cursorDate = addDays(cursorDate, -1);
    } else {
      break;
    }
  }

  const tomorrowCount = entry.nextPlan?.length || 0;

  return (
    <div style={styles.page} className="app-page">
      <style>{FONT_IMPORT + GLOBAL_CSS}</style>

      {/* Header */}
      <header style={styles.header} className="app-header">
        <div>
          <div style={styles.quoteWrap} className="app-quote-wrap">
            <span style={styles.quoteText} className="app-quote-text">
              “Comece fazendo o necessário, depois o possível — de repente você faz o impossível.”
            </span>
            <span style={styles.quoteAuthor} className="app-quote-author">— São Francisco de Assis</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h1 style={styles.title} className="app-title">
              {selectedKey === todayKey
                ? cap(longDate(today))
                : selectedKey === tomorrowKey
                ? `Amanhã · ${cap(longDate(tomorrow))}`
                : cap(longDate(new Date(selectedKey + "T00:00:00")))}
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }} className="app-header-right">
          {/* Quick Date Switcher Tabs */}
          <div style={styles.dateTabsWrap}>
            <button
              type="button"
              style={{
                ...styles.dateTabBtn,
                background: selectedKey === todayKey ? COLORS.teal + "22" : "transparent",
                borderColor: selectedKey === todayKey ? COLORS.teal : COLORS.line,
                color: selectedKey === todayKey ? COLORS.teal : COLORS.textMuted,
                fontWeight: selectedKey === todayKey ? 600 : 400,
              }}
              onClick={() => setSelectedKey(todayKey)}
            >
              Hoje
            </button>
            <button
              type="button"
              style={{
                ...styles.dateTabBtn,
                background: selectedKey === tomorrowKey ? COLORS.teal + "22" : "transparent",
                borderColor: selectedKey === tomorrowKey ? COLORS.teal : COLORS.line,
                color: selectedKey === tomorrowKey ? COLORS.teal : COLORS.textMuted,
                fontWeight: selectedKey === tomorrowKey ? 600 : 400,
              }}
              onClick={() => setSelectedKey(tomorrowKey)}
            >
              Amanhã
            </button>
          </div>

          <div style={styles.streakBadge}>
            <Flame size={15} style={{ marginRight: 6, color: COLORS.gold }} />
            {streak} dia{streak !== 1 ? "s" : ""} seguido{streak !== 1 ? "s" : ""}
          </div>

          <button
            type="button"
            style={styles.backupHeaderBtn}
            onClick={() => setShowBackupModal(true)}
            title="Exportar backup completo (JSON / CSV) ou restaurar registros"
          >
            <Database size={13} style={{ marginRight: 6, color: COLORS.teal }} />
            Backup & Dados
          </button>
        </div>
      </header>

      {/* 3-Column Layout: Left (Calendar), Center (Main Flow), Right (Tomorrow & Charts) */}
      <div style={styles.grid} className="app-grid">
        {/* Left Column: Calendar & Streak (hidden on mobile) */}
        <aside style={styles.sidebar} className="app-sidebar">
          <Calendar
            monthCursor={monthCursor}
            setMonthCursor={setMonthCursor}
            historyMap={historyMap}
            selectedKey={selectedKey}
            setSelectedKey={setSelectedKey}
            todayKey={todayKey}
            tomorrowKey={tomorrowKey}
            tomorrowTasksCount={tomorrowCount}
          />
          <Legend2 />

          {/* Backup Button in Sidebar */}
          <button
            type="button"
            style={styles.sidebarBackupBtn}
            onClick={() => setShowBackupModal(true)}
            title="Exportar ou importar backup de registros"
          >
            <Database size={14} style={{ marginRight: 8, color: COLORS.teal }} />
            <span>Backup & Exportação</span>
          </button>
        </aside>

        {/* Center Column: Main flow */}
        <main style={styles.main} className="app-main">
          {isToday ? (
            <TodayFlow
              entry={entry}
              onNotesChange={(val) => updateEntry((s) => ({ ...s, dayNotes: val }))}
              onSaveNotes={handleSaveNotes}
              notesSavedAlert={notesSavedAlert}
              updateReview={updateReview}
              addTomorrowTask={addTomorrowTask}
              removeTomorrowTask={removeTomorrowTask}
              addTodayTask={addTodayTask}
              removeTodayTask={removeTodayTask}
              newTaskText={newTaskText}
              setNewTaskText={setNewTaskText}
              editingTaskId={editingTaskId}
              editingTaskText={editingTaskText}
              onStartEdit={(id, text) => {
                setEditingTaskId(id);
                setEditingTaskText(text);
              }}
              onCancelEdit={() => {
                setEditingTaskId(null);
                setEditingTaskText("");
              }}
              onSaveEditingTodayTask={saveEditingTodayTask}
              onSaveEditingTomorrowTask={saveEditingTomorrowTask}
              onEditingTextChange={setEditingTaskText}
              allReviewed={allReviewed}
              closeDay={closeDay}
              reopen={reopen}
              saving={saving}
              onViewTomorrow={() => setSelectedKey(tomorrowKey)}
              onMirrorTodayTasks={mirrorTodayTasksToTomorrow}
              mirrorSavedAlert={mirrorSavedAlert}
            />
          ) : (
            <EditablePastDay
              dateKey={selectedKey}
              entry={selectedEntry}
              isTomorrow={isTomorrow}
              todayKey={todayKey}
              onBack={() => setSelectedKey(todayKey)}
              onUpdate={(updater) => updateHistoryEntry(selectedKey, updater)}
            />
          )}
        </main>

        {/* Right Column: Tomorrow Tasks + Trend & Pillar Charts (hidden on mobile) */}
        <aside style={styles.rightPanel} className="app-right-panel">
          {/* Highlight of Tomorrow's Plan */}
          <TomorrowHighlightCard
            tomorrowDate={tomorrow}
            nextPlan={entry.nextPlan}
            editingTaskId={editingTaskId}
            editingTaskText={editingTaskText}
            onStartEdit={(id, text) => {
              setEditingTaskId(`right-${id}`);
              setEditingTaskText(text);
            }}
            onCancelEdit={() => {
              setEditingTaskId(null);
              setEditingTaskText("");
            }}
            onSaveEdit={saveEditingTomorrowTask}
            onEditingTextChange={setEditingTaskText}
            onRemove={removeTomorrowTask}
            onOpenTomorrowDay={() => setSelectedKey(tomorrowKey)}
            onMirrorTodayTasks={mirrorTodayTasksToTomorrow}
            todayPlanCount={entry.plan.length}
            mirrorSavedAlert={mirrorSavedAlert}
          />

          {/* Charts */}
          <TrendChart historyMap={historyMap} />
          <PillarChart historyMap={historyMap} />

          {/* Diagnostic & Chart Summary */}
          <ChartInsightsSummary historyMap={historyMap} todayEntry={entry} />
        </aside>
      </div>

      {/* Backup & Export Modal */}
      {showBackupModal && (
        <BackupModal
          isOpen={showBackupModal}
          onClose={() => setShowBackupModal(false)}
          historyMap={historyMap}
          todayEntry={entry}
          todayKey={todayKey}
          onUpdateHistoryMap={(newMap) => setHistoryMap(newMap)}
          onUpdateTodayEntry={(newEntry) => setEntry(newEntry)}
        />
      )}
    </div>
  );
}

function TodayFlow({
  entry,
  onNotesChange,
  onSaveNotes,
  notesSavedAlert,
  updateReview,
  addTomorrowTask,
  removeTomorrowTask,
  addTodayTask,
  removeTodayTask,
  newTaskText,
  setNewTaskText,
  editingTaskId,
  editingTaskText,
  onStartEdit,
  onCancelEdit,
  onSaveEditingTodayTask,
  onSaveEditingTomorrowTask,
  onEditingTextChange,
  allReviewed,
  closeDay,
  reopen,
  saving,
  onViewTomorrow,
  onMirrorTodayTasks,
  mirrorSavedAlert,
}: {
  entry: DayEntry;
  onNotesChange: (val: string) => void;
  onSaveNotes: () => void;
  notesSavedAlert: boolean;
  updateReview: (id: string, patch: Partial<TaskReviewItem>) => void;
  addTomorrowTask: (pillarKey: string) => void;
  removeTomorrowTask: (id: string) => void;
  addTodayTask: (pillarKey: string, customText?: string) => void;
  removeTodayTask: (id: string) => void;
  newTaskText: Record<string, string>;
  setNewTaskText: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  editingTaskId: string | null;
  editingTaskText: string;
  onStartEdit: (id: string, text: string) => void;
  onCancelEdit: () => void;
  onSaveEditingTodayTask: (id: string) => void;
  onSaveEditingTomorrowTask: (id: string) => void;
  onEditingTextChange: (text: string) => void;
  allReviewed: boolean;
  closeDay: () => void;
  reopen: () => void;
  saving: boolean;
  onViewTomorrow?: () => void;
  onMirrorTodayTasks?: () => void;
  mirrorSavedAlert?: boolean;
}) {
  const [collapsedTasks, setCollapsedTasks] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) => {
    setCollapsedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const reviewedTasks = entry.plan.filter((t) => {
    const r = entry.review.find((x) => x.id === t.id);
    return r && r.status !== null;
  });

  const allReviewedCollapsed =
    reviewedTasks.length > 0 && reviewedTasks.every((t) => !!collapsedTasks[t.id]);

  const toggleCollapseAll = () => {
    if (allReviewedCollapsed) {
      setCollapsedTasks({});
    } else {
      const next: Record<string, boolean> = {};
      entry.plan.forEach((t) => {
        next[t.id] = true;
      });
      setCollapsedTasks(next);
    }
  };

  if (entry.closed) {
    return <ClosedView entry={entry} onReopen={reopen} />;
  }

  return (
    <>
      <div style={styles.saveIndicator}>{saving ? "salvando alterações…" : "salvo"}</div>

      {/* Dica do Dia: Reflexão Estoica & Alta Performance */}
      <DailyStoicTipCard />

      {/* Section 1: Notas do dia com botão de salvar */}
      <Section
        title="Notas do dia"
        subtitle="Espaço livre — qualquer coisa que não caiba nas tarefas abaixo. Editável a qualquer momento."
      >
        <div style={styles.notesBox}>
          <textarea
            style={styles.bigTextarea}
            placeholder="Como foi o dia de forma geral? Algum padrão que você percebeu?"
            value={entry.dayNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={3}
          />
          <div style={styles.notesActionRow}>
            <button
              id="btn-save-notes"
              type="button"
              style={styles.saveNotesBtn}
              onClick={onSaveNotes}
            >
              <Save size={14} style={{ marginRight: 6 }} />
              Salvar notas
            </button>
            {notesSavedAlert && (
              <span style={styles.savedAlertText}>
                <CheckCircle2 size={14} style={{ marginRight: 5, color: COLORS.teal }} />
                Notas salvas com sucesso!
              </span>
            )}
          </div>
        </div>
      </Section>

      {/* Section 2: Revisão do dia */}
      {entry.plan.length > 0 && (
        <Section
          title="Revisão do dia"
          subtitle="O que você se propôs ontem — o que de fato aconteceu. Clique no lápis para editar o texto."
          rightAction={
            entry.plan.length > 0 ? (
              <button
                type="button"
                style={styles.sectionActionBtn}
                onClick={toggleCollapseAll}
                title={allReviewedCollapsed ? "Expandir todos os detalhes" : "Recolher todos os detalhes preenchidos"}
              >
                {allReviewedCollapsed ? (
                  <>
                    <ChevronDown size={13} style={{ marginRight: 5 }} />
                    Expandir todos
                  </>
                ) : (
                  <>
                    <ChevronUp size={13} style={{ marginRight: 5 }} />
                    Recolher detalhes
                  </>
                )}
              </button>
            ) : undefined
          }
        >
          {entry.plan.map((task) => {
            const r = entry.review.find((x) => x.id === task.id) || {
              id: task.id,
              status: null,
              excuse: "",
              excuseOther: "",
              focusShift: "",
              rating: 0,
              comment: "",
              consequenceShort: "",
              consequenceMedium: "",
              consequenceLong: "",
            };
            const isEditing = editingTaskId === task.id;

            return (
              <TaskReview
                key={task.id}
                task={task}
                r={r}
                isEditing={isEditing}
                isCollapsed={!!collapsedTasks[task.id]}
                onToggleCollapse={() => toggleCollapse(task.id)}
                editingText={editingTaskText}
                onStartEdit={() => onStartEdit(task.id, task.text)}
                onCancelEdit={onCancelEdit}
                onSaveEdit={() => onSaveEditingTodayTask(task.id)}
                onEditingTextChange={onEditingTextChange}
                onRemove={() => removeTodayTask(task.id)}
                onChange={(patch) => updateReview(task.id, patch)}
              />
            );
          })}
        </Section>
      )}

      {/* Adicionar atividade para hoje */}
      <Section
        title={entry.plan.length === 0 ? "Ponto de partida" : "Adicionar atividade realizada hoje"}
        subtitle={
          entry.plan.length === 0
            ? "Ainda não há tarefas de ontem para revisar. Registre algo feito hoje sem plano prévio."
            : "Adicione qualquer outra tarefa realizada hoje para incluir na revisão."
        }
      >
        <BootstrapAdd onAdd={addTodayTask} />
      </Section>

      {/* Section 3: Plano de amanhã */}
      <Section
        title="Plano de amanhã"
        subtitle="O que você se propõe a fazer amanhã, por pilar. Visível imediatamente no painel lateral."
        rightAction={
          onMirrorTodayTasks ? (
            <button
              type="button"
              style={{
                ...styles.mirrorBtn,
                opacity: entry.plan.length === 0 ? 0.5 : 1,
                cursor: entry.plan.length === 0 ? "not-allowed" : "pointer",
              }}
              onClick={onMirrorTodayTasks}
              disabled={entry.plan.length === 0}
              title={
                entry.plan.length === 0
                  ? "Nenhuma meta em hoje para espelhar"
                  : "Copiar todas as metas de hoje para o plano de amanhã"
              }
            >
              <Copy size={13} style={{ marginRight: 6 }} />
              Espelhar metas de hoje ({entry.plan.length})
            </button>
          ) : undefined
        }
      >
        {mirrorSavedAlert && (
          <div style={{ ...styles.savedAlertText, marginBottom: 12 }}>
            <CheckCircle2 size={14} style={{ marginRight: 5, color: COLORS.teal }} />
            Metas de hoje espelhadas para amanhã com sucesso!
          </div>
        )}

        <TomorrowPlanner
          nextPlan={entry.nextPlan}
          newTaskText={newTaskText}
          setNewTaskText={setNewTaskText}
          editingTaskId={editingTaskId}
          editingTaskText={editingTaskText}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onSaveEdit={onSaveEditingTomorrowTask}
          onEditingTextChange={onEditingTextChange}
          onAdd={addTomorrowTask}
          onRemove={removeTomorrowTask}
        />
      </Section>

      {/* Fechar o dia */}
      <div style={styles.closeWrap}>
        {!allReviewed && (
          <div style={styles.warnText}>
            Ainda há tarefas sem avaliação de status acima.
          </div>
        )}
        <button id="btn-close-day" style={styles.closeBtn} onClick={closeDay}>
          <Stamp size={16} style={{ marginRight: 8 }} />
          Fechar o dia
        </button>
      </div>
    </>
  );
}

function Section({
  title,
  subtitle,
  rightAction,
  children,
}: {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section style={styles.section}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div>
          <h2 style={styles.sectionTitle}>{title}</h2>
          {subtitle && <p style={styles.sectionSub}>{subtitle}</p>}
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
      {children}
    </section>
  );
}

function StatusButton({
  active,
  color,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  color: string;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="app-status-btn"
      style={{
        ...styles.statusBtn,
        borderColor: active ? color : COLORS.line,
        background: active ? color + "22" : "transparent",
        color: active ? color : COLORS.textMuted,
      }}
    >
      <Icon size={13} style={{ marginRight: 5 }} />
      {label}
    </button>
  );
}

interface TaskReviewProps {
  key?: React.Key;
  task: Task;
  r: TaskReviewItem;
  isEditing: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  editingText: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditingTextChange: (text: string) => void;
  onRemove: () => void;
  onChange: (patch: Partial<TaskReviewItem>) => void;
}

function TaskReview({
  task,
  r,
  isEditing,
  isCollapsed = false,
  onToggleCollapse,
  editingText,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditingTextChange,
  onRemove,
  onChange,
}: TaskReviewProps) {
  const pillar = pillarOf(task.pillar);
  const Icon = pillar.icon;
  const [commentOpen, setCommentOpen] = useState(!!r.comment);
  const isDone = r.status === "feito";
  const isProblem = r.status === "parcial" || r.status === "nao";

  return (
    <div style={{ ...styles.card, borderLeftColor: pillar.color }} className="app-card">
      <div style={styles.cardHeaderRow}>
        <div style={{ ...styles.pillarTag, color: pillar.color }}>
          <Icon size={13} style={{ marginRight: 5 }} />
          {pillar.label}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {r.status && onToggleCollapse && (
            <button
              type="button"
              style={styles.toggleCollapseBtn}
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expandir detalhes da tarefa" : "Recolher detalhes da tarefa"}
            >
              {isCollapsed ? (
                <>
                  <ChevronDown size={12} style={{ marginRight: 3 }} />
                  Detalhes
                </>
              ) : (
                <>
                  <ChevronUp size={12} style={{ marginRight: 3 }} />
                  Recolher
                </>
              )}
            </button>
          )}
          {!isEditing && (
            <button
              type="button"
              style={styles.actionIconBtn}
              onClick={onStartEdit}
              title="Editar texto da tarefa"
            >
              <Pencil size={13} />
            </button>
          )}
          <button
            type="button"
            style={{ ...styles.actionIconBtn, color: COLORS.rust }}
            onClick={onRemove}
            title="Remover tarefa"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input
            style={styles.inputFlex}
            value={editingText}
            onChange={(e) => onEditingTextChange(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveEdit();
            }}
          />
          <button type="button" style={styles.saveMiniBtn} onClick={onSaveEdit}>
            <Save size={13} style={{ marginRight: 4 }} />
            Salvar
          </button>
          <button type="button" style={styles.cancelMiniBtn} onClick={onCancelEdit}>
            <X size={13} />
          </button>
        </div>
      ) : (
        <div style={styles.taskText}>{task.text}</div>
      )}

      <div style={styles.statusRow} className="app-status-row">
        <StatusButton
          active={r.status === "feito"}
          color={COLORS.teal}
          label="Feito"
          icon={Check}
          onClick={() => onChange({ status: "feito" })}
        />
        <StatusButton
          active={r.status === "parcial"}
          color={COLORS.gold}
          label="Parcial"
          icon={Minus}
          onClick={() => onChange({ status: "parcial" })}
        />
        <StatusButton
          active={r.status === "nao"}
          color={COLORS.rust}
          label="Não feito"
          icon={X}
          onClick={() => onChange({ status: "nao" })}
        />
      </div>

      {/* Summary preview strip when collapsed */}
      {isCollapsed && r.status && (
        <div
          style={styles.collapsedSummaryRow}
          onClick={onToggleCollapse}
          title="Clique para ver e editar detalhes completos"
        >
          <div style={styles.collapsedSummaryText}>
            {r.status === "feito" ? (
              <span
                style={{
                  ...styles.collapsedStatusBadge,
                  background: COLORS.teal + "22",
                  color: COLORS.teal,
                }}
              >
                <Check size={11} style={{ marginRight: 4 }} />
                Feito {r.rating > 0 && `· ${r.rating}★`}
              </span>
            ) : r.status === "parcial" ? (
              <span
                style={{
                  ...styles.collapsedStatusBadge,
                  background: COLORS.gold + "22",
                  color: COLORS.gold,
                }}
              >
                <Minus size={11} style={{ marginRight: 4 }} />
                Parcial {r.excuse && `· ${r.excuse}`}
              </span>
            ) : (
              <span
                style={{
                  ...styles.collapsedStatusBadge,
                  background: COLORS.rust + "22",
                  color: COLORS.rust,
                }}
              >
                <X size={11} style={{ marginRight: 4 }} />
                Não feito {r.excuse && `· ${r.excuse}`}
              </span>
            )}
            {(r.consequenceShort || r.consequenceMedium || r.consequenceLong) && (
              <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                • Consequências registradas
              </span>
            )}
            {r.comment && (
              <span style={{ fontSize: 11, color: COLORS.textMuted }}>• 💬 Comentário</span>
            )}
          </div>
          <span style={{ fontSize: 11, color: COLORS.teal, display: "flex", alignItems: "center" }}>
            Ver detalhes <ChevronDown size={12} style={{ marginLeft: 3 }} />
          </span>
        </div>
      )}

      {/* Expanded Details */}
      {!isCollapsed && (
        <>
          {isDone && (
            <div style={styles.detailBlock}>
              <label style={styles.label}>Como avalia a execução?</label>
              <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onChange({ rating: n })}
                    style={styles.starBtn}
                    title={`${n} estrelas`}
                  >
                    <Star
                      size={19}
                      fill={r.rating >= n ? COLORS.gold : "none"}
                      color={COLORS.gold}
                    />
                  </button>
                ))}
              </div>
              <label style={styles.label}>Essa conquista destrava o quê?</label>
              <div style={styles.trioRow} className="app-trio-row">
                <textarea
                  style={styles.trioTextarea}
                  placeholder="Curto prazo"
                  value={r.consequenceShort}
                  onChange={(e) => onChange({ consequenceShort: e.target.value })}
                  rows={2}
                />
                <textarea
                  style={styles.trioTextarea}
                  placeholder="Médio prazo"
                  value={r.consequenceMedium}
                  onChange={(e) => onChange({ consequenceMedium: e.target.value })}
                  rows={2}
                />
                <textarea
                  style={styles.trioTextarea}
                  placeholder="Longo prazo"
                  value={r.consequenceLong}
                  onChange={(e) => onChange({ consequenceLong: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          )}

          {isProblem && (
            <div style={styles.detailBlock}>
              <label style={styles.label}>Qual foi a desculpa?</label>
              <div style={styles.chipRow}>
                {EXCUSES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => onChange({ excuse: ex })}
                    style={{
                      ...styles.chip,
                      borderColor: r.excuse === ex ? COLORS.rust : COLORS.line,
                      color: r.excuse === ex ? COLORS.rust : COLORS.textMuted,
                      background: r.excuse === ex ? COLORS.rust + "1a" : "transparent",
                    }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
              {r.excuse === "Outro" && (
                <textarea
                  style={{ ...styles.wideTextarea, marginBottom: 10 }}
                  placeholder="Descreva a desculpa"
                  value={r.excuseOther}
                  onChange={(e) => onChange({ excuseOther: e.target.value })}
                  rows={2}
                />
              )}
              <label style={styles.label}>O que desviou seu foco?</label>
              <textarea
                style={styles.wideTextarea}
                placeholder="Ex: reunião não planejada, celular, outra tarefa mais fácil…"
                value={r.focusShift}
                onChange={(e) => onChange({ focusShift: e.target.value })}
                rows={2}
              />

              <label style={{ ...styles.label, marginTop: 12 }}>Custo de não ter feito</label>
              <div style={styles.trioRow} className="app-trio-row">
                <textarea
                  style={styles.trioTextarea}
                  placeholder="Curto prazo"
                  value={r.consequenceShort}
                  onChange={(e) => onChange({ consequenceShort: e.target.value })}
                  rows={2}
                />
                <textarea
                  style={styles.trioTextarea}
                  placeholder="Médio prazo"
                  value={r.consequenceMedium}
                  onChange={(e) => onChange({ consequenceMedium: e.target.value })}
                  rows={2}
                />
                <textarea
                  style={styles.trioTextarea}
                  placeholder="Longo prazo"
                  value={r.consequenceLong}
                  onChange={(e) => onChange({ consequenceLong: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          )}

          <div style={styles.commentZone}>
            {!commentOpen ? (
              <button
                type="button"
                style={styles.commentToggle}
                onClick={() => setCommentOpen(true)}
              >
                <MessageSquarePlus size={13} style={{ marginRight: 6 }} />
                {r.comment ? "Editar comentário" : "Adicionar comentário"}
              </button>
            ) : (
              <>
                <label style={styles.label}>Comentário</label>
                <textarea
                  style={styles.wideTextarea}
                  placeholder="Detalhe à vontade — contexto, sensações, o que aprendeu…"
                  value={r.comment}
                  onChange={(e) => onChange({ comment: e.target.value })}
                  rows={3}
                  autoFocus
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function BootstrapAdd({
  onAdd,
}: {
  onAdd: (pillarKey: string, customText?: string) => void;
}) {
  const [selectedPillar, setSelectedPillar] = useState<string>("profissional");
  const [taskText, setTaskText] = useState<string>("");

  const activePillar = pillarOf(selectedPillar);
  const PillarIcon = activePillar.icon;

  const handleAdd = () => {
    if (!taskText.trim()) return;
    onAdd(selectedPillar, taskText.trim());
    setTaskText("");
  };

  return (
    <div style={styles.compactAddBox} className="app-compact-add-box">
      <div style={styles.compactAddRow} className="app-compact-add-row">
        {/* Selectable Pillar Dropdown */}
        <div
          style={{
            ...styles.compactPillarSelectWrap,
            borderColor: activePillar.color + "66",
          }}
          className="app-compact-pillar-wrap"
        >
          <div style={{ ...styles.compactPillarIcon, color: activePillar.color }}>
            <PillarIcon size={14} />
          </div>
          <select
            value={selectedPillar}
            onChange={(e) => setSelectedPillar(e.target.value)}
            style={{
              ...styles.compactPillarSelect,
              color: activePillar.color,
            }}
            aria-label="Pilar da meta ou atividade realizada"
          >
            {PILLARS.map((p) => (
              <option
                key={p.key}
                value={p.key}
                style={{ background: COLORS.surface, color: COLORS.text }}
              >
                {p.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            style={{ ...styles.compactPillarChevron, color: activePillar.color }}
          />
        </div>

        {/* Input for the goal / task */}
        <input
          style={styles.compactAddInput}
          placeholder="Descreva a meta ou atividade realizada hoje…"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />

        {/* Action Button */}
        <button
          type="button"
          style={{
            ...styles.compactAddBtn,
            opacity: taskText.trim() ? 1 : 0.65,
            cursor: taskText.trim() ? "pointer" : "default",
          }}
          onClick={handleAdd}
          title="Adicionar meta realizada para a revisão"
        >
          <Plus size={14} style={{ marginRight: 5 }} />
          <span>Adicionar</span>
        </button>
      </div>
    </div>
  );
}

function TomorrowPlanner({
  nextPlan,
  newTaskText,
  setNewTaskText,
  editingTaskId,
  editingTaskText,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditingTextChange,
  onAdd,
  onRemove,
}: {
  nextPlan: Task[];
  newTaskText: Record<string, string>;
  setNewTaskText: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  editingTaskId: string | null;
  editingTaskText: string;
  onStartEdit: (id: string, text: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onEditingTextChange: (text: string) => void;
  onAdd: (pillarKey: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {PILLARS.map((p) => {
        const Icon = p.icon;
        const items = nextPlan.filter((t) => t.pillar === p.key);
        return (
          <div key={p.key} style={styles.pillarPlannerBlock}>
            <div style={{ ...styles.pillarTag, color: p.color, marginBottom: 6 }}>
              <Icon size={13} style={{ marginRight: 5 }} />
              {p.label}
            </div>
            {items.map((t) => {
              const isEditing = editingTaskId === t.id;

              return (
                <div key={t.id} style={styles.plannedChip}>
                  {isEditing ? (
                    <div style={{ display: "flex", gap: 6, width: "100%" }}>
                      <input
                        style={styles.inputFlex}
                        value={editingTaskText}
                        onChange={(e) => onEditingTextChange(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") onSaveEdit(t.id);
                        }}
                      />
                      <button
                        type="button"
                        style={styles.saveMiniBtn}
                        onClick={() => onSaveEdit(t.id)}
                      >
                        <Save size={13} />
                      </button>
                      <button
                        type="button"
                        style={styles.cancelMiniBtn}
                        onClick={onCancelEdit}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span>{t.text}</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          type="button"
                          style={styles.actionIconBtn}
                          onClick={() => onStartEdit(t.id, t.text)}
                          title="Editar propósito"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          style={{ ...styles.actionIconBtn, color: COLORS.rust }}
                          onClick={() => onRemove(t.id)}
                          title="Remover propósito"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            <div style={styles.addRow}>
              <input
                style={styles.inputFlex}
                placeholder={`Novo propósito em ${p.label.toLowerCase()}…`}
                value={newTaskText[p.key] || ""}
                onChange={(e) => setNewTaskText((s) => ({ ...s, [p.key]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onAdd(p.key);
                }}
              />
              <button
                type="button"
                style={styles.addBtn}
                onClick={() => onAdd(p.key)}
                title={`Adicionar a ${p.label}`}
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TomorrowHighlightCard({
  tomorrowDate,
  nextPlan,
  editingTaskId,
  editingTaskText,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditingTextChange,
  onRemove,
  onOpenTomorrowDay,
  onMirrorTodayTasks,
  todayPlanCount = 0,
  mirrorSavedAlert = false,
}: {
  tomorrowDate: Date;
  nextPlan: Task[];
  editingTaskId: string | null;
  editingTaskText: string;
  onStartEdit: (id: string, text: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onEditingTextChange: (text: string) => void;
  onRemove: (id: string) => void;
  onOpenTomorrowDay: () => void;
  onMirrorTodayTasks?: () => void;
  todayPlanCount?: number;
  mirrorSavedAlert?: boolean;
}) {
  const count = nextPlan.length;

  return (
    <div style={styles.tomorrowPanel}>
      <div style={styles.tomorrowHeader}>
        <div
          style={{ ...styles.tomorrowDateLabel, cursor: "pointer" }}
          onClick={onOpenTomorrowDay}
          title="Clique para abrir e ver o dia de amanhã"
        >
          <CalendarDays size={15} style={{ marginRight: 7, color: COLORS.teal }} />
          <span>Atividades de Amanhã</span>
        </div>
        <button
          type="button"
          onClick={onOpenTomorrowDay}
          style={styles.tomorrowCountBadgeBtn}
          title="Abrir página completa do dia de amanhã"
        >
          {count} {count === 1 ? "tarefa" : "tarefas"} →
        </button>
      </div>
      <div style={styles.tomorrowSubDate}>{cap(longDate(tomorrowDate))}</div>

      {onMirrorTodayTasks && todayPlanCount > 0 && (
        <div style={{ marginBottom: 12 }}>
          <button
            type="button"
            style={{ ...styles.mirrorBtn, width: "100%", justifyContent: "center" }}
            onClick={onMirrorTodayTasks}
            title="Copiar todas as metas de hoje para a lista de amanhã"
          >
            <Copy size={12} style={{ marginRight: 6 }} />
            Espelhar metas de hoje ({todayPlanCount})
          </button>
          {mirrorSavedAlert && (
            <div style={{ ...styles.savedAlertText, marginTop: 6, fontSize: 11 }}>
              <CheckCircle2 size={12} style={{ marginRight: 4, color: COLORS.teal }} />
              Metas espelhadas para amanhã!
            </div>
          )}
        </div>
      )}

      {count > 0 ? (
        <div style={styles.tomorrowTasksList}>
          {PILLARS.map((p) => {
            const items = nextPlan.filter((t) => t.pillar === p.key);
            if (items.length === 0) return null;
            const Icon = p.icon;

            return (
              <div key={p.key} style={styles.tomorrowPillarGroup}>
                <div style={{ ...styles.tomorrowPillarTitle, color: p.color }}>
                  <Icon size={12} style={{ marginRight: 5 }} />
                  {p.label}
                </div>
                {items.map((item) => {
                  const isEditing = editingTaskId === `right-${item.id}`;

                  return (
                    <div
                      key={item.id}
                      style={{
                        ...styles.tomorrowTaskCard,
                        borderLeftColor: p.color,
                      }}
                    >
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 6, width: "100%" }}>
                          <input
                            style={styles.inputFlex}
                            value={editingTaskText}
                            onChange={(e) => onEditingTextChange(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") onSaveEdit(item.id);
                            }}
                          />
                          <button
                            type="button"
                            style={styles.saveMiniBtn}
                            onClick={() => onSaveEdit(item.id)}
                          >
                            <Save size={12} />
                          </button>
                          <button
                            type="button"
                            style={styles.cancelMiniBtn}
                            onClick={onCancelEdit}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div style={styles.tomorrowTaskContent}>
                          <span style={styles.tomorrowTaskText}>{item.text}</span>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              type="button"
                              style={styles.actionIconBtn}
                              onClick={() => onStartEdit(item.id, item.text)}
                              title="Editar atividade"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              style={{ ...styles.actionIconBtn, color: COLORS.rust }}
                              onClick={() => onRemove(item.id)}
                              title="Remover atividade"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          <button
            type="button"
            style={styles.viewTomorrowFullBtn}
            onClick={onOpenTomorrowDay}
          >
            <CalendarDays size={13} style={{ marginRight: 6 }} />
            Ver visualização do dia de amanhã
          </button>
        </div>
      ) : (
        <div style={styles.emptyTomorrowBox}>
          <p style={styles.emptyTomorrowText}>Nenhum plano cadastrado para amanhã ainda.</p>
          <p style={styles.emptyTomorrowSubText}>
            Adicione atividades no campo <strong>"Plano de amanhã"</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

function ClosedView({ entry, onReopen }: { entry: DayEntry; onReopen: () => void }) {
  const done = entry.review.filter((r) => r.status === "feito").length;
  const partial = entry.review.filter((r) => r.status === "parcial").length;
  const not = entry.review.filter((r) => r.status === "nao").length;
  const total = entry.review.length;

  return (
    <div style={styles.stampWrap}>
      <div style={styles.stamp}>
        <Stamp size={24} />
        <div style={styles.stampText}>DIA REGISTRADO</div>
      </div>
      <div style={styles.summaryLine}>
        {total > 0
          ? `${done} feita${done !== 1 ? "s" : ""} · ${partial} parcial${partial !== 1 ? "is" : ""} · ${not} não feita${not !== 1 ? "s" : ""} de ${total}`
          : "Nenhuma tarefa revisada hoje."}
      </div>
      <div style={styles.summaryLine}>
        {entry.nextPlan.length} propósito{entry.nextPlan.length !== 1 ? "s" : ""} definido
        {entry.nextPlan.length !== 1 ? "s" : ""} para amanhã.
      </div>
      <button type="button" style={styles.ghostBtn} onClick={onReopen}>
        <Pencil size={13} style={{ marginRight: 6 }} />
        Reabrir e editar registro
      </button>
    </div>
  );
}

function EditablePastDay({
  dateKey,
  entry,
  isTomorrow,
  todayKey,
  onBack,
  onUpdate,
}: {
  dateKey: string;
  entry?: DayEntry | null;
  isTomorrow?: boolean;
  todayKey: string;
  onBack: () => void;
  onUpdate: (updater: (prev: DayEntry) => DayEntry) => void;
}) {
  const d = new Date(dateKey + "T00:00:00");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [newFutureTaskText, setNewFutureTaskText] = useState<Record<string, string>>({});

  const planTasks = entry?.plan || [];

  function addFutureTask(pillarKey: string) {
    const text = (newFutureTaskText[pillarKey] || "").trim();
    if (!text) return;
    const task: Task = { id: newId(), pillar: pillarKey, text };
    onUpdate((prev) => ({
      ...prev,
      plan: [...(prev.plan || []), task],
      review: [
        ...(prev.review || []),
        {
          id: task.id,
          status: null,
          excuse: "",
          excuseOther: "",
          focusShift: "",
          rating: 0,
          comment: "",
          consequenceShort: "",
          consequenceMedium: "",
          consequenceLong: "",
        },
      ],
    }));
    setNewFutureTaskText((s) => ({ ...s, [pillarKey]: "" }));
  }

  function removeFutureTask(id: string) {
    onUpdate((prev) => ({
      ...prev,
      plan: (prev.plan || []).filter((t) => t.id !== id),
      review: (prev.review || []).filter((r) => r.id !== id),
    }));
  }

  return (
    <div>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button type="button" style={styles.ghostBtn} onClick={onBack}>
          <ArrowLeft size={13} style={{ marginRight: 6 }} />
          Voltar para hoje
        </button>
        {isTomorrow ? (
          <div style={styles.activeTomorrowBadge}>
            <CalendarDays size={13} style={{ marginRight: 6, color: COLORS.teal }} />
            Planejamento Ativo de Amanhã
          </div>
        ) : (
          entry && (
            <button
              type="button"
              style={{ ...styles.ghostBtn, borderColor: COLORS.teal, color: COLORS.teal }}
              onClick={() =>
                onUpdate((prev) => ({
                  ...prev,
                  closed: !prev.closed,
                }))
              }
            >
              {entry.closed ? "Reabrir dia" : "Marcar como fechado"}
            </button>
          )
        )}
      </div>

      {isTomorrow && (
        <div style={styles.tomorrowBanner}>
          <div style={styles.tomorrowBannerTitle}>
            <CalendarDays size={16} style={{ marginRight: 8, color: COLORS.teal }} />
            Metas Programadas para Amanhã
          </div>
          <div style={styles.tomorrowBannerDesc}>
            Estas metas foram cadastradas no fechamento de hoje e serão automaticamente o seu plano de ação ao iniciar o dia de amanhã. Você pode editar, adicionar ou organizar novas tarefas diretamente aqui.
          </div>
        </div>
      )}

      <h2 style={{ ...styles.sectionTitle, marginTop: isTomorrow ? 14 : 0 }}>
        {isTomorrow ? `Amanhã · ${cap(longDate(d))}` : cap(longDate(d))}
      </h2>

      {/* Section 1: Notas do dia */}
      <Section
        title={isTomorrow ? "Notas prévias para amanhã" : "Notas do dia"}
        subtitle={isTomorrow ? "Reflexões ou preparativos para amanhã (editável)." : "Reflexão registrada para esta data (editável)."}
      >
        <textarea
          style={styles.bigTextarea}
          value={entry?.dayNotes || ""}
          onChange={(e) => {
            const val = e.target.value;
            onUpdate((prev) => ({ ...prev, dayNotes: val }));
          }}
          rows={3}
          placeholder={isTomorrow ? "Algum lembrete ou prioridade para amanhã?" : "Nenhuma nota registrada."}
        />
      </Section>

      {/* Section 2: Tarefas do Dia */}
      <Section
        title={isTomorrow ? `Metas definidas para amanhã (${planTasks.length})` : "Tarefas e Revisão"}
        subtitle={
          isTomorrow
            ? "Tarefas estabelecidas para cada pilar. Use o lápis para editar o texto ou o botão X para remover."
            : "Você pode alterar status, notas e textos a qualquer momento."
        }
      >
        {planTasks.length === 0 ? (
          <div style={styles.emptyTomorrowBox}>
            <p style={styles.emptyTomorrowText}>
              {isTomorrow
                ? "Nenhuma meta programada para amanhã ainda."
                : "Nenhuma tarefa registrada para este dia."}
            </p>
            <p style={styles.emptyTomorrowSubText}>
              Adicione abaixo as atividades que você planeja executar.
            </p>
          </div>
        ) : (
          planTasks.map((task) => {
            const r = entry?.review?.find((x) => x.id === task.id) || {
              id: task.id,
              status: null,
              excuse: "",
              excuseOther: "",
              focusShift: "",
              rating: 0,
              comment: "",
              consequenceShort: "",
              consequenceMedium: "",
              consequenceLong: "",
            };
            const pillar = pillarOf(task.pillar);
            const Icon = pillar.icon;
            const isEditing = editingId === task.id;

            return (
              <div key={task.id} style={{ ...styles.card, borderLeftColor: pillar.color }} className="app-card">
                <div style={styles.cardHeaderRow}>
                  <div style={{ ...styles.pillarTag, color: pillar.color }}>
                    <Icon size={13} style={{ marginRight: 5 }} />
                    {pillar.label}
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {!isEditing && (
                      <button
                        type="button"
                        style={styles.actionIconBtn}
                        onClick={() => {
                          setEditingId(task.id);
                          setEditingText(task.text);
                        }}
                        title="Editar texto"
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                    {isTomorrow && (
                      <button
                        type="button"
                        style={{ ...styles.actionIconBtn, color: COLORS.rust }}
                        onClick={() => removeFutureTask(task.id)}
                        title="Remover meta de amanhã"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <input
                      style={styles.inputFlex}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onUpdate((prev) => ({
                            ...prev,
                            plan: prev.plan.map((t) =>
                              t.id === task.id ? { ...t, text: editingText.trim() } : t
                            ),
                          }));
                          setEditingId(null);
                        }
                      }}
                    />
                    <button
                      type="button"
                      style={styles.saveMiniBtn}
                      onClick={() => {
                        onUpdate((prev) => ({
                          ...prev,
                          plan: prev.plan.map((t) =>
                            t.id === task.id ? { ...t, text: editingText.trim() } : t
                          ),
                        }));
                        setEditingId(null);
                      }}
                    >
                      <Save size={13} />
                    </button>
                    <button
                      type="button"
                      style={styles.cancelMiniBtn}
                      onClick={() => setEditingId(null)}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div style={styles.taskText}>{task.text}</div>
                )}

                {!isTomorrow && (
                  <>
                    <div style={styles.statusRow} className="app-status-row">
                      <StatusButton
                        active={r.status === "feito"}
                        color={COLORS.teal}
                        label="Feito"
                        icon={Check}
                        onClick={() =>
                          onUpdate((prev) => ({
                            ...prev,
                            review: (prev.review || []).map((x) =>
                              x.id === task.id ? { ...x, status: "feito" } : x
                            ),
                          }))
                        }
                      />
                      <StatusButton
                        active={r.status === "parcial"}
                        color={COLORS.gold}
                        label="Parcial"
                        icon={Minus}
                        onClick={() =>
                          onUpdate((prev) => ({
                            ...prev,
                            review: (prev.review || []).map((x) =>
                              x.id === task.id ? { ...x, status: "parcial" } : x
                            ),
                          }))
                        }
                      />
                      <StatusButton
                        active={r.status === "nao"}
                        color={COLORS.rust}
                        label="Não feito"
                        icon={X}
                        onClick={() =>
                          onUpdate((prev) => ({
                            ...prev,
                            review: (prev.review || []).map((x) =>
                              x.id === task.id ? { ...x, status: "nao" } : x
                            ),
                          }))
                        }
                      />
                    </div>

                    {r.rating > 0 && (
                      <div style={{ display: "flex", gap: 3, marginTop: 10, marginBottom: 6 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={15}
                            fill={r.rating >= n ? COLORS.gold : "none"}
                            color={COLORS.gold}
                          />
                        ))}
                      </div>
                    )}

                    {r.excuse && (
                      <div style={styles.readonlyLine}>
                        <strong>Desculpa:</strong> {r.excuse === "Outro" ? r.excuseOther : r.excuse}
                      </div>
                    )}
                    {r.focusShift && (
                      <div style={styles.readonlyLine}>
                        <strong>Desvio de foco:</strong> {r.focusShift}
                      </div>
                    )}
                    {(r.consequenceShort || r.consequenceMedium || r.consequenceLong) && (
                      <div style={styles.readonlyLine}>
                        <strong>Consequências:</strong>{" "}
                        {[r.consequenceShort, r.consequenceMedium, r.consequenceLong]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    )}
                    {r.comment && (
                      <div style={styles.readonlyLine}>
                        <strong>Comentário:</strong> {r.comment}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </Section>

      {/* Adicionar novas metas para amanhã */}
      <Section
        title={isTomorrow ? "Adicionar mais metas para amanhã" : "Adicionar atividade a este dia"}
        subtitle="Adicione atividades diretamente por pilar."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.key} style={styles.addRow}>
                <div style={{ color: p.color, display: "flex", width: 22, alignItems: "center" }}>
                  <Icon size={13} />
                </div>
                <input
                  style={styles.inputFlex}
                  placeholder={`Adicionar meta em ${p.label.toLowerCase()}…`}
                  value={newFutureTaskText[p.key] || ""}
                  onChange={(e) =>
                    setNewFutureTaskText((s) => ({ ...s, [p.key]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addFutureTask(p.key);
                  }}
                />
                <button
                  type="button"
                  style={styles.addBtn}
                  onClick={() => addFutureTask(p.key)}
                  title={`Adicionar a ${p.label}`}
                >
                  <Plus size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </Section>

      {!isTomorrow && entry?.nextPlan && entry.nextPlan.length > 0 && (
        <Section title="Plano definido para o dia seguinte">
          {entry.nextPlan.map((t) => {
            const p = pillarOf(t.pillar);
            return (
              <div key={t.id} style={styles.plannedChip}>
                <span>
                  <strong style={{ color: p.color, marginRight: 6 }}>{p.label}:</strong>
                  {t.text}
                </span>
              </div>
            );
          })}
        </Section>
      )}
    </div>
  );
}

function Calendar({
  monthCursor,
  setMonthCursor,
  historyMap,
  selectedKey,
  setSelectedKey,
  todayKey,
  tomorrowKey,
  tomorrowTasksCount = 0,
}: {
  monthCursor: Date;
  setMonthCursor: (d: Date) => void;
  historyMap: Record<string, DayEntry>;
  selectedKey: string;
  setSelectedKey: (k: string) => void;
  todayKey: string;
  tomorrowKey?: string;
  tomorrowTasksCount?: number;
}) {
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const n = daysInMonth(year, month);
  const firstDow = new Date(year, month, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= n; d++) cells.push(d);

  function dayColor(key: string) {
    const e = historyMap[key];
    if (!e || !e.review || e.review.length === 0) {
      if (key === tomorrowKey && tomorrowTasksCount > 0) {
        return COLORS.teal;
      }
      return e && e.closed ? COLORS.line : null;
    }
    const feito = e.review.filter((r) => r.status === "feito").length;
    const rate = feito / e.review.length;
    if (rate >= 0.7) return COLORS.teal;
    if (rate >= 0.3) return COLORS.gold;
    return COLORS.rust;
  }

  return (
    <div style={styles.calendarBox}>
      <div style={styles.calendarHead}>
        <button
          type="button"
          style={styles.iconBtn}
          onClick={() => setMonthCursor(new Date(year, month - 1, 1))}
          title="Mês anterior"
        >
          <ChevronLeft size={15} />
        </button>
        <div style={styles.calendarMonthLabel}>
          <CalendarDays size={13} style={{ marginRight: 6 }} />
          {cap(MONTHS_PT[month])} {year}
        </div>
        <button
          type="button"
          style={styles.iconBtn}
          onClick={() => setMonthCursor(new Date(year, month + 1, 1))}
          title="Próximo mês"
        >
          <ChevronRight size={15} />
        </button>
      </div>
      <div style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <div key={i} style={styles.weekCell}>
            {w}
          </div>
        ))}
      </div>
      <div style={styles.calGrid}>
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const key = fmtKey(new Date(year, month, d));
          const color = dayColor(key);
          const isSel = key === selectedKey;
          const isToday = key === todayKey;
          const isTomorrow = key === tomorrowKey;

          return (
            <button
              type="button"
              key={i}
              onClick={() => setSelectedKey(key)}
              title={
                isToday
                  ? "Hoje"
                  : isTomorrow
                  ? `Amanhã (${tomorrowTasksCount} metas planejadas)`
                  : key
              }
              style={{
                ...styles.calCell,
                border: isSel
                  ? `1.5px solid ${COLORS.teal}`
                  : isToday
                  ? `1px solid ${COLORS.textMuted}`
                  : isTomorrow && tomorrowTasksCount > 0
                  ? `1px dashed ${COLORS.teal}`
                  : "1px solid transparent",
                color: isTomorrow && tomorrowTasksCount > 0 ? COLORS.teal : COLORS.text,
                background: isTomorrow && tomorrowTasksCount > 0 ? COLORS.teal + "11" : "transparent",
              }}
            >
              {d}
              <span
                style={{
                  ...styles.calDot,
                  background: color || "transparent",
                  boxShadow: isTomorrow && tomorrowTasksCount > 0 ? `0 0 4px ${COLORS.teal}` : "none",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Legend2() {
  return (
    <div style={styles.legendBox}>
      <div style={styles.legendRow}>
        <span style={{ ...styles.legendDot, background: COLORS.teal }} />
        Bom dia (≥70% feito)
      </div>
      <div style={styles.legendRow}>
        <span style={{ ...styles.legendDot, background: COLORS.gold }} />
        Dia parcial (30–70%)
      </div>
      <div style={styles.legendRow}>
        <span style={{ ...styles.legendDot, background: COLORS.rust }} />
        Dia fraco (&lt;30%)
      </div>
    </div>
  );
}

function TrendChart({
  historyMap,
}: {
  historyMap: Record<string, DayEntry>;
}) {
  const data = Object.keys(historyMap)
    .sort()
    .map((key) => {
      const e = historyMap[key];
      if (!e || !e.review || e.review.length === 0) return null;
      const feito = e.review.filter((r) => r.status === "feito").length;
      const parcial = e.review.filter((r) => r.status === "parcial").length;
      const rate = Math.round(
        (feito / e.review.length) * 100 + (parcial / e.review.length) * 40
      );
      const d = new Date(key + "T00:00:00");
      return {
        label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
        taxa: Math.min(rate, 100),
        _key: key,
      };
    })
    .filter((x): x is { label: string; taxa: number; _key: string } => Boolean(x))
    .slice(-21);

  return (
    <div style={styles.panelBox}>
      <div style={styles.panelTitle}>Tendência de execução</div>
      {data.length === 0 ? (
        <div style={styles.emptyChart}>Sem dados suficientes ainda.</div>
      ) : (
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={data} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid stroke={COLORS.line} strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: COLORS.textMuted, fontSize: 9.5 }}
              axisLine={{ stroke: COLORS.line }}
              tickLine={false}
              interval={Math.ceil(data.length / 5)}
            />
            <YAxis
              tick={{ fill: COLORS.textMuted, fontSize: 9.5 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: COLORS.surfaceAlt,
                border: `1px solid ${COLORS.line}`,
                borderRadius: 6,
                fontSize: 11,
              }}
              labelStyle={{ color: COLORS.text }}
            />
            <Line
              type="monotone"
              dataKey="taxa"
              stroke={COLORS.teal}
              strokeWidth={2}
              dot={{ r: 2.5, fill: COLORS.teal }}
              name="Taxa de execução"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function PillarChart({ historyMap }: { historyMap: Record<string, DayEntry> }) {
  const counts: Record<string, { feito: number; parcial: number; nao: number }> = {};
  PILLARS.forEach((p) => (counts[p.key] = { feito: 0, parcial: 0, nao: 0 }));

  Object.values(historyMap).forEach((e) => {
    if (!e || !e.plan || !e.review) return;
    e.plan.forEach((task) => {
      const r = e.review.find((x) => x.id === task.id);
      if (!r || !r.status || !counts[task.pillar]) return;
      counts[task.pillar][r.status === "nao" ? "nao" : r.status]++;
    });
  });

  const data = PILLARS.map((p) => ({
    pillar: p.label.slice(0, 4),
    Feito: counts[p.key].feito,
    Parcial: counts[p.key].parcial,
    "Não feito": counts[p.key].nao,
  }));
  const hasData = data.some((d) => d.Feito + d.Parcial + d["Não feito"] > 0);

  return (
    <div style={styles.panelBox}>
      <div style={styles.panelTitle}>O que vai bem e mal, por pilar</div>
      {!hasData ? (
        <div style={styles.emptyChart}>Sem dados suficientes ainda.</div>
      ) : (
        <ResponsiveContainer width="100%" height={170}>
          <BarChart data={data} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid stroke={COLORS.line} strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="pillar"
              tick={{ fill: COLORS.textMuted, fontSize: 9.5 }}
              axisLine={{ stroke: COLORS.line }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: COLORS.textMuted, fontSize: 9.5 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: COLORS.surfaceAlt,
                border: `1px solid ${COLORS.line}`,
                borderRadius: 6,
                fontSize: 11,
              }}
              labelStyle={{ color: COLORS.text }}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: COLORS.textMuted }} />
            <Bar dataKey="Feito" stackId="a" fill={COLORS.teal} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Parcial" stackId="a" fill={COLORS.gold} />
            <Bar
              dataKey="Não feito"
              stackId="a"
              fill={COLORS.rust}
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function ChartInsightsSummary({
  historyMap,
  todayEntry,
}: {
  historyMap: Record<string, DayEntry>;
  todayEntry?: DayEntry;
}) {
  const fullMap: Record<string, DayEntry> = { ...historyMap };
  if (todayEntry && todayEntry.date) {
    fullMap[todayEntry.date] = todayEntry;
  }

  // Aggregate stats per pillar
  const pillarStats: Record<
    string,
    { total: number; feito: number; parcial: number; nao: number }
  > = {};
  PILLARS.forEach((p) => {
    pillarStats[p.key] = { total: 0, feito: 0, parcial: 0, nao: 0 };
  });

  const excuseCounts: Record<string, number> = {};
  let totalReviewedTasks = 0;
  let totalDoneTasks = 0;

  Object.values(fullMap).forEach((e) => {
    if (!e || !e.plan || !e.review) return;
    e.plan.forEach((task) => {
      const r = e.review.find((x) => x.id === task.id);
      if (!r || !r.status) return;
      totalReviewedTasks++;
      if (r.status === "feito") totalDoneTasks++;

      if (pillarStats[task.pillar]) {
        pillarStats[task.pillar].total++;
        if (r.status === "feito") pillarStats[task.pillar].feito++;
        else if (r.status === "parcial") pillarStats[task.pillar].parcial++;
        else if (r.status === "nao") pillarStats[task.pillar].nao++;
      }

      if (r.excuse && r.excuse.trim()) {
        excuseCounts[r.excuse] = (excuseCounts[r.excuse] || 0) + 1;
      }
    });
  });

  if (totalReviewedTasks === 0) {
    return (
      <div style={styles.insightsCard}>
        <div style={styles.insightsHeader}>
          <div style={styles.insightsTitleWrap}>
            <Compass size={14} color={COLORS.teal} />
            <span style={styles.insightsTitle}>Diagnóstico dos Dados</span>
          </div>
        </div>
        <p style={styles.insightsEmptyText}>
          Conforme você registrar e revisar suas tarefas diárias, este espaço analisará seus números e apontará padrões e pontos de atenção por pilar.
        </p>
      </div>
    );
  }

  // Evaluate pillars with at least 1 task
  const evaluatedPillars = PILLARS.map((p) => {
    const s = pillarStats[p.key];
    const score =
      s.total > 0 ? Math.round(((s.feito + s.parcial * 0.4) / s.total) * 100) : null;
    return {
      pillar: p,
      stats: s,
      rate: score,
    };
  }).filter((x) => x.stats.total > 0);

  const sortedByRate = [...evaluatedPillars].sort((a, b) => (a.rate ?? 0) - (b.rate ?? 0));
  const lowestPillar = sortedByRate[0];
  const highestPillar = sortedByRate[sortedByRate.length - 1];

  // Specific check for work/professional pillar
  const workPillar = evaluatedPillars.find((x) => x.pillar.key === "profissional");

  // Top excuse
  const sortedExcuses = Object.entries(excuseCounts).sort((a, b) => b[1] - a[1]);
  const topExcuse = sortedExcuses[0]?.[0];

  const overallRate = Math.round((totalDoneTasks / totalReviewedTasks) * 100);

  return (
    <div style={styles.insightsCard}>
      <div style={styles.insightsHeader}>
        <div style={styles.insightsTitleWrap}>
          <Compass size={14} color={COLORS.teal} />
          <span style={styles.insightsTitle}>Diagnóstico dos Dados</span>
        </div>
        <span style={styles.insightsBadge}>
          {overallRate}% conclusão geral
        </span>
      </div>

      <div style={styles.insightsList}>
        {/* Work pillar alert or lowest pillar alert */}
        {workPillar && (workPillar.rate ?? 100) < 70 ? (
          <div style={styles.insightItemAttention}>
            <div style={styles.insightIconAttention}>
              <AlertTriangle size={13} color={COLORS.rust} />
            </div>
            <div style={styles.insightContent}>
              <span style={styles.insightHighlightRust}>
                Atenção com as metas de trabalho ({workPillar.rate}% de sucesso):
              </span>{" "}
              {workPillar.stats.nao + workPillar.stats.parcial} de {workPillar.stats.total} metas profissionais ficaram incompletas. Sugestão: reduza o volume e priorize 1 ou 2 tarefas essenciais amanhã.
            </div>
          </div>
        ) : lowestPillar && (lowestPillar.rate ?? 100) < 65 ? (
          <div style={styles.insightItemAttention}>
            <div style={styles.insightIconAttention}>
              <AlertTriangle size={13} color={COLORS.rust} />
            </div>
            <div style={styles.insightContent}>
              <span style={styles.insightHighlightRust}>
                Atenção com as metas de {lowestPillar.pillar.label} ({lowestPillar.rate}%):
              </span>{" "}
              {lowestPillar.stats.nao + lowestPillar.stats.parcial} tarefas parciais ou não feitas. Cuidado para não superestimar a energia disponível neste pilar.
            </div>
          </div>
        ) : null}

        {/* Highest pillar highlight */}
        {highestPillar && (highestPillar.rate ?? 0) >= 70 && (
          <div style={styles.insightItemSuccess}>
            <div style={styles.insightIconSuccess}>
              <TrendingUp size={13} color={COLORS.teal} />
            </div>
            <div style={styles.insightContent}>
              <span style={styles.insightHighlightTeal}>
                Pilar mais consistente: {highestPillar.pillar.label} ({highestPillar.rate}%)
              </span>{" "}
              — {highestPillar.stats.feito} de {highestPillar.stats.total} metas concluídas com excelência.
            </div>
          </div>
        )}

        {/* Top excuse pattern */}
        {topExcuse && (
          <div style={styles.insightItemNeutral}>
            <div style={styles.insightIconNeutral}>
              <Lightbulb size={13} color={COLORS.gold} />
            </div>
            <div style={styles.insightContent}>
              <span style={styles.insightHighlightGold}>Padrão de atrito:</span>{" "}
              A justificativa mais frequente nos desvios foi <em>"{topExcuse}"</em>. Planeje seu dia contornando esse obstáculo.
            </div>
          </div>
        )}

        {/* Stoic actionable prompt */}
        <div style={styles.insightStoicPrompt}>
          <Quote size={11} color={COLORS.textMuted} style={{ marginRight: 5, flexShrink: 0 }} />
          <span>
            <em>"O que não depende de você, deixe ir. O que depende, faça com excelência."</em>
          </span>
        </div>
      </div>
    </div>
  );
}

function DailyStoicTipCard() {
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * STOIC_QUOTES.length)
  );
  const [collapsed, setCollapsed] = useState(false);

  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % STOIC_QUOTES.length);
  };

  const current = STOIC_QUOTES[quoteIndex] || STOIC_QUOTES[0];

  return (
    <div style={styles.stoicCard} className="app-stoic-card">
      <div style={styles.stoicCardHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={styles.stoicCardBadge}>
            <Sparkles size={11} style={{ marginRight: 4 }} />
            Dica do Dia
          </span>
          <span style={styles.stoicCardTag}>{current.tag}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            style={styles.stoicShuffleBtn}
            onClick={nextQuote}
            title="Sortear outra reflexão estoica / produtividade"
          >
            <Shuffle size={11} style={{ marginRight: 5 }} />
            Nova reflexão
          </button>
          <button
            type="button"
            style={styles.stoicToggleBtn}
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expandir reflexão" : "Recolher reflexão"}
          >
            {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={styles.stoicCardBody}>
          <div style={styles.stoicQuoteRow}>
            <Quote size={15} color={COLORS.teal} style={{ marginRight: 8, flexShrink: 0, marginTop: 2, opacity: 0.85 }} />
            <p style={styles.stoicQuoteText}>“{current.quote}”</p>
          </div>

          <div style={styles.stoicAuthorRow}>
            <span style={styles.stoicAuthorName}>— {current.author}</span>
            {current.source && <span style={styles.stoicSource}>({current.source})</span>}
          </div>

          <div style={styles.stoicInsightBox}>
            <Lightbulb size={13} color={COLORS.gold} style={{ marginRight: 7, flexShrink: 0, marginTop: 1 }} />
            <div style={styles.stoicInsightText}>
              <strong style={{ color: COLORS.gold }}>Aplicação prática:</strong> {current.insight}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BackupModal({
  isOpen,
  onClose,
  historyMap,
  todayEntry,
  todayKey,
  onUpdateHistoryMap,
  onUpdateTodayEntry,
}: {
  isOpen: boolean;
  onClose: () => void;
  historyMap: Record<string, DayEntry>;
  todayEntry: DayEntry;
  todayKey: string;
  onUpdateHistoryMap: (newMap: Record<string, DayEntry>) => void;
  onUpdateTodayEntry: (entry: DayEntry) => void;
}) {
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const fullMap: Record<string, DayEntry> = { ...historyMap };
  if (todayEntry && todayEntry.date) {
    fullMap[todayEntry.date] = todayEntry;
  }
  const totalDays = Object.keys(fullMap).length;
  let totalTasks = 0;
  let totalDone = 0;
  Object.values(fullMap).forEach((e) => {
    if (e && e.plan) {
      totalTasks += e.plan.length;
    }
    if (e && e.review) {
      totalDone += e.review.filter((r) => r.status === "feito").length;
    }
  });

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      setStatusMessage({
        type: "error",
        text: "Por favor, selecione um arquivo válido no formato .json.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        setStatusMessage({
          type: "error",
          text: "O arquivo selecionado está vazio.",
        });
        return;
      }

      parseAndImportBackup(
        content,
        (importedCount) => {
          setStatusMessage({
            type: "success",
            text: `Backup restaurado com sucesso! ${importedCount} dia(s) carregados no seu histórico.`,
          });
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
        (errorMsg) => {
          setStatusMessage({
            type: "error",
            text: errorMsg,
          });
        },
        onUpdateHistoryMap,
        todayKey,
        onUpdateTodayEntry
      );
    };
    reader.onerror = () => {
      setStatusMessage({
        type: "error",
        text: "Falha ao ler o arquivo no navegador.",
      });
    };
    reader.readAsText(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div
        style={styles.modalCard}
        className="app-backup-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={styles.modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={styles.modalIconWrap}>
              <Database size={18} color={COLORS.teal} />
            </div>
            <div>
              <h2 style={styles.modalTitle}>Backup & Exportação</h2>
              <p style={styles.modalSubTitle}>
                Exporte seu histórico de registros ou restaure um backup anterior
              </p>
            </div>
          </div>
          <button
            type="button"
            style={styles.modalCloseBtn}
            onClick={onClose}
            title="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div style={styles.modalStatsBar}>
          <div style={styles.modalStatItem}>
            <span style={styles.modalStatLabel}>Dias com histórico</span>
            <span style={styles.modalStatVal}>{totalDays}</span>
          </div>
          <div style={styles.modalStatItem}>
            <span style={styles.modalStatLabel}>Metas cadastradas</span>
            <span style={styles.modalStatVal}>{totalTasks}</span>
          </div>
          <div style={styles.modalStatItem}>
            <span style={styles.modalStatLabel}>Tarefas cumpridas</span>
            <span style={{ ...styles.modalStatVal, color: COLORS.teal }}>
              {totalDone}
            </span>
          </div>
        </div>

        {/* Alert Feedback */}
        {statusMessage && (
          <div
            style={{
              ...styles.modalAlertBox,
              background:
                statusMessage.type === "success"
                  ? COLORS.teal + "1a"
                  : COLORS.rust + "1a",
              borderColor:
                statusMessage.type === "success" ? COLORS.teal : COLORS.rust,
              color:
                statusMessage.type === "success" ? COLORS.teal : "#f87171",
            }}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 size={16} style={{ marginRight: 8, flexShrink: 0 }} />
            ) : (
              <AlertCircle size={16} style={{ marginRight: 8, flexShrink: 0 }} />
            )}
            <span style={{ fontSize: 12.5, lineHeight: 1.4 }}>
              {statusMessage.text}
            </span>
          </div>
        )}

        {/* Export Section */}
        <div style={{ marginBottom: 20 }}>
          <div style={styles.modalSectionHeading}>
            <Download size={14} style={{ marginRight: 6, color: COLORS.teal }} />
            1. Exportar registros (Backup do Usuário)
          </div>
          <div style={styles.exportCardsGrid} className="app-export-grid">
            {/* JSON Option */}
            <div style={styles.exportCard}>
              <div style={styles.exportCardTop}>
                <FileJson size={20} color={COLORS.teal} />
                <div>
                  <div style={styles.exportCardTitle}>Backup JSON Completo</div>
                  <div style={styles.exportCardBadge}>Recomendado para restauração</div>
                </div>
              </div>
              <p style={styles.exportCardDesc}>
                Exporta 100% do histórico (tarefas, notas, avaliações, motivos e consequências) para restauração perfeita a qualquer momento.
              </p>
              <button
                type="button"
                style={styles.exportActionBtnPrimary}
                onClick={() => exportHistoryAsJson(historyMap, todayEntry)}
              >
                <Download size={13} style={{ marginRight: 6 }} />
                Baixar Backup (.json)
              </button>
            </div>

            {/* CSV Option */}
            <div style={styles.exportCard}>
              <div style={styles.exportCardTop}>
                <FileSpreadsheet size={20} color={COLORS.gold} />
                <div>
                  <div style={styles.exportCardTitle}>Relatório em Planilha CSV</div>
                  <div style={{ ...styles.exportCardBadge, color: COLORS.gold, borderColor: COLORS.gold + "44", background: COLORS.gold + "15" }}>
                    Excel / Planilhas
                  </div>
                </div>
              </div>
              <p style={styles.exportCardDesc}>
                Planilha tabular formatada com todas as colunas para abrir diretamente no Microsoft Excel, Google Planilhas ou Calc.
              </p>
              <button
                type="button"
                style={styles.exportActionBtnSecondary}
                onClick={() => exportHistoryAsCsv(historyMap, todayEntry)}
              >
                <Download size={13} style={{ marginRight: 6 }} />
                Baixar Planilha (.csv)
              </button>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div style={{ marginBottom: 8 }}>
          <div style={styles.modalSectionHeading}>
            <Upload size={14} style={{ marginRight: 6, color: COLORS.teal }} />
            2. Importar ou Restaurar Backup (.JSON)
          </div>
          <div
            style={{
              ...styles.importDropZone,
              borderColor: isDragging ? COLORS.teal : COLORS.line,
              background: isDragging ? COLORS.teal + "11" : COLORS.surfaceAlt,
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileInputChange}
              accept=".json,application/json"
              style={{ display: "none" }}
            />
            <div style={styles.importIconCircle}>
              <FolderUp size={20} color={COLORS.teal} />
            </div>
            <div style={styles.importDropTitle}>
              Arraste o arquivo .json de backup aqui
            </div>
            <div style={styles.importDropSub}>
              ou clique para selecionar um arquivo do seu computador
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.modalFooter}>
          <button
            type="button"
            style={styles.modalCloseFooterBtn}
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

const COLORS = {
  bg: "#0A1622",
  surface: "#0F1F30",
  surfaceAlt: "#142943",
  line: "#1E3A56",
  text: "#E7EEF5",
  textMuted: "#7C93AA",
  teal: "#2DD4BF",
  gold: "#C9A961",
  rust: "#C4514A",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');`;
const GLOBAL_CSS = `
  * { box-sizing: border-box; }
  body { margin: 0; background: ${COLORS.bg}; -webkit-font-smoothing: antialiased; }
  textarea, input { font-family: 'Inter', sans-serif; }
  textarea::placeholder, input::placeholder { color: #55708A; }
  textarea:focus, input:focus { outline: none; border-color: ${COLORS.teal} !important; }
  button { cursor: pointer; font-family: inherit; }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.line}; border-radius: 4px; }

  /* Mobile Responsive View */
  @media (max-width: 1024px) {
    .app-sidebar,
    .app-right-panel {
      display: none !important;
    }
    .app-grid {
      display: block !important;
      max-width: 100% !important;
    }
    .app-page {
      padding: 20px 16px 48px !important;
    }
    .app-header {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 14px !important;
      padding-bottom: 16px !important;
      margin-bottom: 22px !important;
    }
    .app-header-right {
      width: 100% !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
    }
  }

  @media (max-width: 640px) {
    .app-page {
      padding: 16px 12px 40px !important;
    }
    .app-title {
      font-size: 20px !important;
    }
    .app-quote-wrap {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 4px !important;
      margin-bottom: 6px !important;
    }
    .app-quote-text {
      font-size: 12px !important;
    }
    .app-quote-author {
      font-size: 11px !important;
    }
    .app-trio-row {
      flex-direction: column !important;
      gap: 6px !important;
    }
    .app-status-row {
      max-width: 100% !important;
    }
    .app-card {
      padding: 14px 12px !important;
    }
    .app-status-btn {
      padding: 8px 6px !important;
      font-size: 11px !important;
    }
    .app-add-row {
      gap: 5px !important;
    }
    .app-backup-modal {
      padding: 16px 14px !important;
      max-width: 95vw !important;
      max-height: 90vh !important;
    }
    .app-export-grid {
      grid-template-columns: 1fr !important;
    }
    .app-compact-add-row {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 8px !important;
    }
    .app-compact-pillar-wrap {
      width: 100% !important;
      min-width: 100% !important;
    }
  }
`;

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: `radial-gradient(ellipse at top, #0D1D2C 0%, ${COLORS.bg} 55%)`,
    color: COLORS.text,
    fontFamily: "'Inter', sans-serif",
    padding: "32px 32px 60px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottom: `1px solid ${COLORS.line}`,
    paddingBottom: 18,
    marginBottom: 24,
    maxWidth: 1400,
    margin: "0 auto 24px",
  },
  quoteWrap: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#94A3B8",
    fontFamily: "'Inter', sans-serif",
    lineHeight: 1.4,
  },
  quoteAuthor: {
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.teal,
    fontFamily: "'Hanken Grotesk', sans-serif",
    whiteSpace: "nowrap",
  },
  dateTabsWrap: {
    display: "flex",
    gap: 6,
    background: COLORS.surface,
    padding: "3px",
    borderRadius: 8,
    border: `1px solid ${COLORS.line}`,
  },
  dateTabBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 14px",
    borderRadius: 6,
    fontSize: 12.5,
    border: "1px solid transparent",
    transition: "all 0.15s ease",
    cursor: "pointer",
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.18em",
    color: COLORS.teal,
    textTransform: "uppercase",
    marginBottom: 6,
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontWeight: 600,
  },
  title: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 26,
    fontWeight: 700,
    margin: 0,
  },
  streakBadge: {
    display: "flex",
    alignItems: "center",
    color: COLORS.gold,
    fontSize: 13,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 20,
    padding: "6px 14px",
    background: COLORS.surface,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "270px minmax(0, 1fr) 340px",
    gap: 28,
    maxWidth: 1400,
    margin: "0 auto",
    alignItems: "start",
  },
  sidebar: {
    position: "sticky",
    top: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  main: { minWidth: 0 },
  rightPanel: {
    position: "sticky",
    top: 24,
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  saveIndicator: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginBottom: 14,
    textAlign: "right",
  },
  section: { marginBottom: 30 },
  sectionHead: { marginBottom: 14 },
  sectionTitle: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 17,
    fontWeight: 700,
    margin: "0 0 4px",
  },
  sectionSub: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    margin: 0,
    lineHeight: 1.6,
  },
  notesBox: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 8,
    padding: "14px",
  },
  bigTextarea: {
    width: "100%",
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 6,
    padding: "12px 14px",
    fontSize: 13,
    color: COLORS.text,
    resize: "vertical",
    lineHeight: 1.5,
  },
  notesActionRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  saveNotesBtn: {
    display: "flex",
    alignItems: "center",
    background: COLORS.teal,
    color: "#052421",
    border: "none",
    borderRadius: 6,
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 600,
  },
  savedAlertText: {
    display: "flex",
    alignItems: "center",
    fontSize: 12,
    color: COLORS.teal,
    fontWeight: 500,
  },
  card: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    borderLeft: "3px solid",
    borderRadius: 10,
    padding: "18px",
    marginBottom: 14,
  },
  cardHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pillarTag: {
    display: "flex",
    alignItems: "center",
    fontSize: 10.5,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    fontWeight: 600,
  },
  taskText: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 14,
    lineHeight: 1.4,
  },
  statusRow: {
    display: "flex",
    gap: 8,
    marginBottom: 4,
    maxWidth: 340,
  },
  statusBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid",
    borderRadius: 6,
    padding: "7px 6px",
    fontSize: 11.5,
    background: "transparent",
    fontWeight: 500,
  },
  detailBlock: {
    marginTop: 14,
    paddingTop: 14,
    borderTop: `1px dashed ${COLORS.line}`,
  },
  label: {
    display: "block",
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginBottom: 7,
    letterSpacing: "0.03em",
  },
  wideTextarea: {
    width: "100%",
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 6,
    padding: "9px 11px",
    fontSize: 12.5,
    color: COLORS.text,
    resize: "vertical",
    marginBottom: 10,
  },
  trioRow: {
    display: "flex",
    gap: 8,
    marginBottom: 4,
  },
  trioTextarea: {
    flex: 1,
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 6,
    padding: "8px 10px",
    fontSize: 12,
    color: COLORS.text,
    resize: "vertical",
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  chip: {
    border: "1px solid",
    borderRadius: 20,
    padding: "5px 11px",
    fontSize: 11,
    background: "transparent",
  },
  starBtn: {
    background: "transparent",
    border: "none",
    padding: 2,
  },
  addRow: {
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  inputFlex: {
    flex: 1,
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 5,
    padding: "8px 10px",
    fontSize: 12.5,
    color: COLORS.text,
  },
  addBtn: {
    background: COLORS.teal + "22",
    border: `1px solid ${COLORS.teal}`,
    color: COLORS.teal,
    borderRadius: 5,
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  saveMiniBtn: {
    display: "flex",
    alignItems: "center",
    background: COLORS.teal,
    color: "#052421",
    border: "none",
    borderRadius: 5,
    padding: "6px 10px",
    fontSize: 11.5,
    fontWeight: 600,
  },
  cancelMiniBtn: {
    display: "flex",
    alignItems: "center",
    background: "transparent",
    border: `1px solid ${COLORS.line}`,
    color: COLORS.textMuted,
    borderRadius: 5,
    padding: "6px 8px",
    fontSize: 11.5,
  },
  actionIconBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: `1px solid ${COLORS.line}`,
    color: COLORS.textMuted,
    borderRadius: 4,
    width: 26,
    height: 26,
    padding: 0,
  },
  plannedChip: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 6,
    padding: "7px 10px",
    fontSize: 12.5,
    marginBottom: 6,
  },
  sectionActionBtn: {
    display: "flex",
    alignItems: "center",
    background: "transparent",
    border: `1px solid ${COLORS.line}`,
    borderRadius: 6,
    color: COLORS.textMuted,
    padding: "5px 10px",
    fontSize: 11.5,
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.15s ease",
  },
  toggleCollapseBtn: {
    display: "flex",
    alignItems: "center",
    background: "transparent",
    border: `1px solid ${COLORS.line}`,
    borderRadius: 4,
    color: COLORS.textMuted,
    padding: "3px 7px",
    fontSize: 11,
    cursor: "pointer",
    fontWeight: 500,
  },
  collapsedSummaryRow: {
    marginTop: 10,
    padding: "8px 10px",
    borderRadius: 6,
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.line}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    gap: 8,
  },
  collapsedSummaryText: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  collapsedStatusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 7px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
  },
  mirrorBtn: {
    display: "inline-flex",
    alignItems: "center",
    background: COLORS.surface,
    border: `1px solid ${COLORS.teal}66`,
    color: COLORS.teal,
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  pillarPlannerBlock: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 8,
    padding: "12px 14px",
  },
  commentZone: { marginTop: 12 },
  commentToggle: {
    display: "flex",
    alignItems: "center",
    background: "transparent",
    border: "none",
    color: COLORS.teal,
    fontSize: 11.5,
    padding: 0,
  },
  closeWrap: {
    marginTop: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  warnText: { fontSize: 11, color: COLORS.rust },
  closeBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: COLORS.teal,
    color: "#052421",
    border: "none",
    borderRadius: 8,
    padding: "13px 26px",
    fontSize: 13.5,
    fontWeight: 700,
    fontFamily: "'Hanken Grotesk', sans-serif",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 4px 12px rgba(45, 212, 191, 0.2)",
  },
  stampWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "36px 10px",
    gap: 10,
    width: "100%",
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 10,
  },
  stamp: {
    border: `2px solid ${COLORS.teal}`,
    color: COLORS.teal,
    borderRadius: "50%",
    width: 100,
    height: 100,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    transform: "rotate(-8deg)",
    marginBottom: 8,
  },
  stampText: {
    fontSize: 9.5,
    letterSpacing: "0.1em",
    marginTop: 6,
    textAlign: "center",
    width: 75,
    fontWeight: 700,
  },
  summaryLine: { fontSize: 13, color: COLORS.textMuted },
  ghostBtn: {
    display: "flex",
    alignItems: "center",
    background: "transparent",
    border: `1px solid ${COLORS.line}`,
    color: COLORS.text,
    borderRadius: 6,
    padding: "7px 12px",
    fontSize: 12,
    marginTop: 4,
  },
  readonlyLine: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 6,
    lineHeight: 1.4,
  },
  calendarBox: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 10,
    padding: "14px",
  },
  calendarHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  calendarMonthLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: 12.5,
    fontWeight: 600,
    color: COLORS.text,
    fontFamily: "'Hanken Grotesk', sans-serif",
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    color: COLORS.textMuted,
    display: "flex",
    padding: 4,
  },
  weekRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    textAlign: "center",
    marginBottom: 6,
  },
  weekCell: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: 600,
  },
  calGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 2,
  },
  calCell: {
    position: "relative",
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    borderRadius: 6,
    fontSize: 11,
    padding: 0,
  },
  calDot: {
    position: "absolute",
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: "50%",
  },
  legendBox: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 8,
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  legendRow: { display: "flex", alignItems: "center", gap: 7 },
  legendDot: { width: 7, height: 7, borderRadius: "50%" },
  panelBox: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 10,
    padding: "14px 16px",
  },
  panelTitle: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 10,
  },
  emptyChart: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    padding: "30px 0",
    textAlign: "center",
  },

  // Tomorrow Highlight Card in Right Panel
  tomorrowPanel: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 10,
    padding: "14px 16px",
  },
  tomorrowHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  tomorrowDateLabel: {
    display: "flex",
    alignItems: "center",
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.text,
  },
  tomorrowCountBadge: {
    fontSize: 10.5,
    padding: "2px 8px",
    borderRadius: 10,
    background: COLORS.teal + "22",
    color: COLORS.teal,
    fontWeight: 600,
  },
  tomorrowCountBadgeBtn: {
    fontSize: 10.5,
    padding: "3px 9px",
    borderRadius: 10,
    background: COLORS.teal + "22",
    color: COLORS.teal,
    border: `1px solid ${COLORS.teal}44`,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  viewTomorrowFullBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 8,
    padding: "8px 12px",
    background: "transparent",
    border: `1px solid ${COLORS.line}`,
    borderRadius: 6,
    color: COLORS.teal,
    fontSize: 11.5,
    fontWeight: 600,
  },
  activeTomorrowBadge: {
    display: "flex",
    alignItems: "center",
    background: COLORS.surface,
    border: `1px solid ${COLORS.teal}55`,
    color: COLORS.teal,
    padding: "5px 12px",
    borderRadius: 16,
    fontSize: 11.5,
    fontWeight: 600,
  },
  tomorrowBanner: {
    background: `linear-gradient(135deg, ${COLORS.surface} 0%, #0D2633 100%)`,
    border: `1px solid ${COLORS.teal}44`,
    borderRadius: 8,
    padding: "14px 16px",
    marginBottom: 16,
  },
  tomorrowBannerTitle: {
    display: "flex",
    alignItems: "center",
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.teal,
    marginBottom: 6,
  },
  tomorrowBannerDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 1.5,
  },
  tomorrowSubDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  tomorrowTasksList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  tomorrowPillarGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  tomorrowPillarTitle: {
    display: "flex",
    alignItems: "center",
    fontSize: 10.5,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    fontWeight: 600,
  },
  tomorrowTaskCard: {
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.line}`,
    borderLeft: "3px solid",
    borderRadius: 5,
    padding: "7px 10px",
  },
  tomorrowTaskContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tomorrowTaskText: {
    fontSize: 12,
    color: COLORS.text,
  },
  emptyTomorrowBox: {
    textAlign: "center",
    padding: "14px 6px",
    border: `1px dashed ${COLORS.line}`,
    borderRadius: 6,
    background: COLORS.surfaceAlt + "66",
  },
  emptyTomorrowText: {
    fontSize: 12,
    color: COLORS.textMuted,
    margin: "0 0 4px",
  },
  emptyTomorrowSubText: {
    fontSize: 11,
    color: COLORS.textMuted,
    margin: 0,
  },

  // Backup & Export Styles
  backupHeaderBtn: {
    display: "flex",
    alignItems: "center",
    background: COLORS.surface,
    border: `1px solid ${COLORS.teal}55`,
    color: COLORS.teal,
    borderRadius: 20,
    padding: "6px 13px",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  sidebarBackupBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    color: COLORS.textMuted,
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
    transition: "all 0.15s ease",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(6, 14, 22, 0.82)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 16,
  },
  modalCard: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 14,
    width: "100%",
    maxWidth: 640,
    maxHeight: "92vh",
    overflowY: "auto",
    padding: "24px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.45)",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: `1px solid ${COLORS.line}`,
  },
  modalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: COLORS.teal + "18",
    border: `1px solid ${COLORS.teal}33`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  modalTitle: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    margin: "0 0 3px",
    color: COLORS.text,
  },
  modalSubTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    margin: 0,
    lineHeight: 1.4,
  },
  modalCloseBtn: {
    background: "transparent",
    border: "none",
    color: COLORS.textMuted,
    display: "flex",
    padding: 4,
    borderRadius: 4,
    cursor: "pointer",
  },
  modalStatsBar: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 18,
  },
  modalStatItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  modalStatLabel: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  modalStatVal: {
    fontSize: 16,
    fontWeight: 700,
    color: COLORS.text,
    fontFamily: "'Hanken Grotesk', sans-serif",
  },
  modalAlertBox: {
    display: "flex",
    alignItems: "center",
    borderRadius: 8,
    border: "1px solid",
    padding: "10px 14px",
    marginBottom: 16,
  },
  modalSectionHeading: {
    display: "flex",
    alignItems: "center",
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 13.5,
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: 10,
  },
  exportCardsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  exportCard: {
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 8,
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  exportCardTop: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  exportCardTitle: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: 2,
  },
  exportCardBadge: {
    display: "inline-block",
    fontSize: 9.5,
    padding: "1px 6px",
    borderRadius: 4,
    background: COLORS.teal + "15",
    color: COLORS.teal,
    border: `1px solid ${COLORS.teal}33`,
    fontWeight: 500,
  },
  exportCardDesc: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    lineHeight: 1.45,
    margin: "0 0 12px",
    flexGrow: 1,
  },
  exportActionBtnPrimary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: COLORS.teal,
    color: "#052421",
    border: "none",
    borderRadius: 6,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
  },
  exportActionBtnSecondary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: COLORS.surface,
    color: COLORS.gold,
    border: `1px solid ${COLORS.gold}66`,
    borderRadius: 6,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
  },
  importDropZone: {
    border: "2px dashed",
    borderRadius: 8,
    padding: "20px 16px",
    textAlign: "center",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
  },
  importIconCircle: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: COLORS.teal + "18",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  importDropTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: 4,
  },
  importDropSub: {
    fontSize: 11.5,
    color: COLORS.textMuted,
  },
  modalFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTop: `1px solid ${COLORS.line}`,
    display: "flex",
    justifyContent: "flex-end",
  },
  modalCloseFooterBtn: {
    background: "transparent",
    border: `1px solid ${COLORS.line}`,
    color: COLORS.textMuted,
    borderRadius: 6,
    padding: "7px 16px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
  },

  // Dica do Dia (Stoic Tip Card) Styles
  stoicCard: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 16,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  stoicCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  stoicCardBadge: {
    display: "inline-flex",
    alignItems: "center",
    background: COLORS.teal + "1c",
    color: COLORS.teal,
    border: `1px solid ${COLORS.teal}44`,
    borderRadius: 4,
    padding: "2px 7px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
  stoicCardTag: {
    fontSize: 11,
    color: COLORS.textMuted,
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.line}`,
    padding: "2px 7px",
    borderRadius: 4,
    fontWeight: 500,
  },
  stoicShuffleBtn: {
    display: "inline-flex",
    alignItems: "center",
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.line}`,
    color: COLORS.textMuted,
    borderRadius: 6,
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  stoicToggleBtn: {
    background: "transparent",
    border: "none",
    color: COLORS.textMuted,
    display: "flex",
    alignItems: "center",
    padding: "4px",
    borderRadius: 4,
    cursor: "pointer",
  },
  stoicCardBody: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    paddingTop: 4,
  },
  stoicQuoteRow: {
    display: "flex",
    alignItems: "flex-start",
  },
  stoicQuoteText: {
    fontFamily: "'Newsreader', serif",
    fontSize: 14.5,
    fontStyle: "italic",
    color: COLORS.text,
    lineHeight: 1.5,
    margin: 0,
    letterSpacing: "0.01em",
  },
  stoicAuthorRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    paddingLeft: 23,
    fontSize: 12,
  },
  stoicAuthorName: {
    color: COLORS.teal,
    fontWeight: 600,
  },
  stoicSource: {
    color: COLORS.textMuted,
    fontSize: 11.5,
  },
  stoicInsightBox: {
    display: "flex",
    alignItems: "flex-start",
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.gold}33`,
    borderRadius: 6,
    padding: "8px 10px",
    marginTop: 2,
  },
  stoicInsightText: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 1.45,
  },

  // Diagnostico dos Dados (Insights Summary) Styles
  insightsCard: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 10,
    padding: "14px 14px 12px",
    marginBottom: 16,
  },
  insightsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: `1px solid ${COLORS.line}`,
  },
  insightsTitleWrap: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  insightsTitle: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 12.5,
    fontWeight: 700,
    color: COLORS.text,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  insightsBadge: {
    fontSize: 10.5,
    fontWeight: 600,
    color: COLORS.teal,
    background: COLORS.teal + "15",
    border: `1px solid ${COLORS.teal}33`,
    padding: "1px 6px",
    borderRadius: 4,
  },
  insightsEmptyText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    lineHeight: 1.45,
    margin: 0,
  },
  insightsList: {
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },
  insightItemAttention: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    background: COLORS.rust + "12",
    border: `1px solid ${COLORS.rust}3a`,
    borderRadius: 6,
    padding: "8px 9px",
  },
  insightIconAttention: {
    marginTop: 2,
    flexShrink: 0,
  },
  insightHighlightRust: {
    color: "#f87171",
    fontWeight: 700,
  },
  insightItemSuccess: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    background: COLORS.teal + "12",
    border: `1px solid ${COLORS.teal}3a`,
    borderRadius: 6,
    padding: "8px 9px",
  },
  insightIconSuccess: {
    marginTop: 2,
    flexShrink: 0,
  },
  insightHighlightTeal: {
    color: COLORS.teal,
    fontWeight: 700,
  },
  insightItemNeutral: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.gold}33`,
    borderRadius: 6,
    padding: "8px 9px",
  },
  insightIconNeutral: {
    marginTop: 2,
    flexShrink: 0,
  },
  insightHighlightGold: {
    color: COLORS.gold,
    fontWeight: 700,
  },
  insightContent: {
    fontSize: 11.5,
    color: COLORS.text,
    lineHeight: 1.45,
  },
  insightStoicPrompt: {
    display: "flex",
    alignItems: "center",
    fontSize: 11,
    color: COLORS.textMuted,
    paddingTop: 4,
    borderTop: `1px dashed ${COLORS.line}`,
    marginTop: 2,
  },

  // Compact Selectable Add Component
  compactAddBox: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 8,
    padding: "10px 12px",
  },
  compactAddRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  compactPillarSelectWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 6,
    padding: "0 28px 0 32px",
    height: 38,
    minWidth: 180,
    flexShrink: 0,
  },
  compactPillarIcon: {
    position: "absolute",
    left: 10,
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  compactPillarSelect: {
    width: "100%",
    background: "transparent",
    border: "none",
    fontSize: 12.5,
    fontWeight: 600,
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  },
  compactPillarChevron: {
    position: "absolute",
    right: 8,
    pointerEvents: "none",
    opacity: 0.8,
  },
  compactAddInput: {
    flex: 1,
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 6,
    padding: "9px 12px",
    fontSize: 12.5,
    color: COLORS.text,
    height: 38,
  },
  compactAddBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: COLORS.teal,
    color: "#052421",
    border: "none",
    borderRadius: 6,
    padding: "0 14px",
    height: 38,
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    flexShrink: 0,
    transition: "all 0.15s ease",
  },
};
