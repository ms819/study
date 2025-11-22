"use client";

import { useEffect, useMemo, useState } from "react";

type SessionType = "focus" | "break";

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

type CalendarCell = {
  label: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  key: string;
};

function buildCalendarGrid(anchor: Date): CalendarCell[] {
  const startOfMonth = new Date(
    anchor.getFullYear(),
    anchor.getMonth(),
    1
  );
  const endOfMonth = new Date(
    anchor.getFullYear(),
    anchor.getMonth() + 1,
    0
  );

  const startDay = startOfMonth.getDay();
  const firstVisibleDay = new Date(startOfMonth);
  firstVisibleDay.setDate(startOfMonth.getDate() - startDay);

  const cells: CalendarCell[] = [];

  for (let i = 0; i < 42; i += 1) {
    const cellDate = new Date(firstVisibleDay);
    cellDate.setDate(firstVisibleDay.getDate() + i);

    cells.push({
      label: cellDate.getDate(),
      isToday:
        cellDate.toDateString() === anchor.toDateString(),
      isCurrentMonth: cellDate.getMonth() === anchor.getMonth(),
      key: cellDate.toISOString(),
    });
  }

  return cells;
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function Home() {
  const [mode, setMode] = useState<SessionType>("focus");
  const [secondsLeft, setSecondsLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [today] = useState(() => new Date());

  const calendarCells = useMemo(
    () => buildCalendarGrid(today),
    [today]
  );

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ja-JP", {
        month: "long",
        year: "numeric",
      }).format(today),
    [today]
  );

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    if (secondsLeft === 0) {
      const nextMode = mode === "focus" ? "break" : "focus";
      setMode(nextMode);
      setSecondsLeft(
        nextMode === "focus" ? WORK_DURATION : BREAK_DURATION
      );
      return;
    }

    const tick = setTimeout(
      () => setSecondsLeft((prev) => prev - 1),
      1000
    );

    return () => clearTimeout(tick);
  }, [secondsLeft, isRunning, mode]);

  const handleToggle = () => {
    setIsRunning((prev) => !prev);
  };

  const resetLabel =
    mode === "focus" ? "25分の学習タイム" : "5分の休憩タイム";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 px-6 py-12 text-slate-100">
      <main className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">
                今日のスケジュール
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">
                {monthLabel}
              </h1>
            </div>
            <span className="rounded-full bg-cyan-500/20 px-4 py-2 text-xs font-medium text-cyan-200">
              カレンダー
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
            <div className="grid grid-cols-7 border-b border-white/5 bg-white/5 text-center text-xs font-semibold uppercase tracking-wide text-slate-200">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day) => (
                  <div key={day} className="p-2">
                    {day}
                  </div>
                )
              )}
            </div>
            <div className="grid grid-cols-7 gap-1 p-3 text-center text-sm">
              {calendarCells.map((cell) => (
                <div
                  key={cell.key}
                  className={`flex h-14 items-center justify-center rounded-xl border border-transparent transition ${
                    cell.isToday
                      ? "border-cyan-300/40 bg-cyan-400/10 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.3)]"
                      : cell.isCurrentMonth
                      ? "bg-white/5 text-slate-100"
                      : "bg-slate-800/30 text-slate-500"
                  }`}
                >
                  {cell.label}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-200/20 bg-gradient-to-r from-cyan-900/40 via-slate-900 to-indigo-900/40 p-6 shadow-xl">
            <div className="flex items-start gap-6">
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleToggle}
                  className={`w-28 rounded-xl px-4 py-2 text-left text-sm font-semibold tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    isRunning
                      ? "bg-amber-500 text-slate-900 focus-visible:outline-amber-300"
                      : "bg-cyan-400 text-slate-900 focus-visible:outline-cyan-200"
                  }`}
                >
                  {isRunning ? "Stop" : "Start"}
                </button>
                <div className="text-5xl font-semibold tabular-nums">
                  {formatTime(secondsLeft)}
                </div>
                <p className="text-sm text-slate-300">{resetLabel}</p>
              </div>

              <div className="flex-1">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
                    進行状況
                  </p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-400 transition-[width]"
                      style={{
                        width: `${
                          ((mode === "focus"
                            ? WORK_DURATION - secondsLeft
                            : BREAK_DURATION - secondsLeft) /
                            (mode === "focus"
                              ? WORK_DURATION
                              : BREAK_DURATION)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="mt-3 text-slate-300">
                    現在は{mode === "focus" ? "集中" : "休憩"}中です。
                    スタート/ストップで一時停止できます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">
            マスコットスペース
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Mascot Playground</h2>
          <p className="mt-2 text-sm text-slate-300">
            ここにアニメーションするマスコットを配置できます。
            十分な余白を確保しています。
          </p>
          <div className="mt-6 flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-slate-900/60">
            <span className="text-slate-500">
              Mascot area (640×360目安)
            </span>
          </div>
        </aside>
      </main>
    </div>
  );
}
