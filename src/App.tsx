import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Sparkles, Dumbbell, Brain, Home, Briefcase, Plus, X, Star,
  Flame, Check, Minus, Stamp, MessageSquarePlus, CalendarDays,
  Pencil, Save, CheckCircle2, Clock, ChevronLeft, ChevronRight, ArrowLeft
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";

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
  function addTodayTask(pillarKey: string) {
    const key = "today-" + pillarKey;
    const text = (newTaskText[key] || "").trim();
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
    <div style={styles.page}>
      <style>{FONT_IMPORT + GLOBAL_CSS}</style>

      {/* Header */}
      <header style={styles.header}>
        <div>
          <div style={styles.quoteWrap}>
            <span style={styles.quoteText}>
              “Comece fazendo o necessário, depois o possível — de repente você faz o impossível.”
            </span>
            <span style={styles.quoteAuthor}>— São Francisco de Assis</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h1 style={styles.title}>
              {selectedKey === todayKey
                ? cap(longDate(today))
                : selectedKey === tomorrowKey
                ? `Amanhã · ${cap(longDate(tomorrow))}`
                : cap(longDate(new Date(selectedKey + "T00:00:00")))}
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
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
        </div>
      </header>

      {/* 3-Column Layout: Left (Calendar), Center (Main Flow), Right (Tomorrow & Charts) */}
      <div style={styles.grid}>
        {/* Left Column: Calendar & Streak */}
        <aside style={styles.sidebar}>
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
        </aside>

        {/* Center Column: Main flow */}
        <main style={styles.main}>
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

        {/* Right Column: Tomorrow Tasks + Trend & Pillar Charts */}
        <aside style={styles.rightPanel}>
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
          />

          {/* Charts */}
          <TrendChart historyMap={historyMap} />
          <PillarChart historyMap={historyMap} />
        </aside>
      </div>
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
}: {
  entry: DayEntry;
  onNotesChange: (val: string) => void;
  onSaveNotes: () => void;
  notesSavedAlert: boolean;
  updateReview: (id: string, patch: Partial<TaskReviewItem>) => void;
  addTomorrowTask: (pillarKey: string) => void;
  removeTomorrowTask: (id: string) => void;
  addTodayTask: (pillarKey: string) => void;
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
}) {
  if (entry.closed) {
    return <ClosedView entry={entry} onReopen={reopen} />;
  }

  return (
    <>
      <div style={styles.saveIndicator}>{saving ? "salvando alterações…" : "salvo"}</div>

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
        <BootstrapAdd
          newTaskText={newTaskText}
          setNewTaskText={setNewTaskText}
          onAdd={addTodayTask}
        />
      </Section>

      {/* Section 3: Plano de amanhã */}
      <Section
        title="Plano de amanhã"
        subtitle="O que você se propõe a fazer amanhã, por pilar. Visível imediatamente no painel lateral."
      >
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
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHead}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        {subtitle && <p style={styles.sectionSub}>{subtitle}</p>}
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
    <div style={{ ...styles.card, borderLeftColor: pillar.color }}>
      <div style={styles.cardHeaderRow}>
        <div style={{ ...styles.pillarTag, color: pillar.color }}>
          <Icon size={13} style={{ marginRight: 5 }} />
          {pillar.label}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
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

      <div style={styles.statusRow}>
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
          <div style={styles.trioRow}>
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
          <div style={styles.trioRow}>
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
    </div>
  );
}

function BootstrapAdd({
  newTaskText,
  setNewTaskText,
  onAdd,
}: {
  newTaskText: Record<string, string>;
  setNewTaskText: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onAdd: (pillarKey: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {PILLARS.map((p) => {
        const Icon = p.icon;
        const key = "today-" + p.key;
        return (
          <div key={p.key} style={styles.addRow}>
            <div style={{ color: p.color, display: "flex", width: 22, alignItems: "center" }}>
              <Icon size={13} />
            </div>
            <input
              style={styles.inputFlex}
              placeholder={`Registrar algo feito hoje em ${p.label.toLowerCase()}…`}
              value={newTaskText[key] || ""}
              onChange={(e) => setNewTaskText((s) => ({ ...s, [key]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") onAdd(p.key);
              }}
            />
            <button
              type="button"
              style={styles.addBtn}
              onClick={() => onAdd(p.key)}
              title={`Adicionar em ${p.label}`}
            >
              <Plus size={15} />
            </button>
          </div>
        );
      })}
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
              <div key={task.id} style={{ ...styles.card, borderLeftColor: pillar.color }}>
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
                    <div style={styles.statusRow}>
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
  body { margin: 0; background: ${COLORS.bg}; }
  textarea, input { font-family: 'Inter', sans-serif; }
  textarea::placeholder, input::placeholder { color: #55708A; }
  textarea:focus, input:focus { outline: none; border-color: ${COLORS.teal} !important; }
  button { cursor: pointer; font-family: inherit; }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.line}; border-radius: 4px; }
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
};
