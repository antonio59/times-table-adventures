import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { SolutionExplainer } from "@/components/SolutionExplainer";
import { useSound } from "@/contexts/SoundContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  Map,
  MousePointerClick,
  Play,
  Repeat,
  Square,
  X,
} from "lucide-react";
import { ALL_TABLES_WITH_ONE } from "@/lib/constants";

interface Fact {
  a: number;
  b: number;
}

const TABLES = ALL_TABLES_WITH_ONE;
/** The classic school chart goes to 12 — beyond that lives in Explorer tables. */
const CHART_MAX = 12;
const CHART_RANGE = Array.from({ length: CHART_MAX }, (_, i) => i + 1);
const SCHOOL_MAX = 12;

/** Tables grouped in the order kids usually learn them. */
const TABLE_GROUPS = [
  {
    id: "easy",
    label: "Start here",
    hint: "The friendly ones",
    tables: [1, 2, 5, 10],
    btnClass: "bg-success text-success-foreground",
  },
  {
    id: "next",
    label: "Next steps",
    hint: "Doubles and elevens",
    tables: [3, 4, 11],
    btnClass: "bg-info text-info-foreground",
  },
  {
    id: "tricky",
    label: "Trickier ones",
    hint: "Worth the extra practice",
    tables: [6, 7, 8, 9, 12],
    btnClass: "bg-accent text-accent-foreground",
  },
  {
    id: "explorer",
    label: "Explorer tables",
    hint: "Beyond 12 — for adventurers",
    tables: [13, 14, 15, 16, 17, 18, 19, 20],
    btnClass: "bg-secondary text-secondary-foreground",
  },
];

const Tables = () => {
  const [viewMode, setViewMode] = useState<"tables" | "chart">("tables");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [fact, setFact] = useState<Fact | null>(null);
  const [showExplorerFacts, setShowExplorerFacts] = useState(false);
  // Roving tabindex for arrow-key navigation inside the chart
  const [focusCell, setFocusCell] = useState<Fact>({ a: 1, b: 1 });
  const gridRef = useRef<HTMLTableElement>(null);
  const { play } = useSound();

  const pickTable = (num: number) => {
    play("click");
    setSelectedTable(num);
    setFact(null);
    setShowExplorerFacts(false);
  };

  const pickFact = (a: number, b: number) => {
    play("click");
    setFact((prev) => (prev?.a === a && prev?.b === b ? null : { a, b }));
  };

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    const delta: Record<string, [number, number]> = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
    };
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pickFact(focusCell.a, focusCell.b);
      return;
    }
    const d = delta[e.key];
    if (!d) return;
    e.preventDefault();
    const next = {
      a: Math.min(Math.max(focusCell.a + d[1], 1), CHART_MAX),
      b: Math.min(Math.max(focusCell.b + d[0], 1), CHART_MAX),
    };
    setFocusCell(next);
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-cell="${next.a}-${next.b}"]`)
      ?.focus();
  };

  const isSquare = fact && fact.a === fact.b;
  const isSymmetric = fact && fact.a !== fact.b;

  const factRow = (a: number, b: number, quiet = false) => (
    <button
      key={b}
      type="button"
      onClick={() => pickFact(a, b)}
      aria-label={`${a} times ${b} equals ${a * b} — tap to see it explained`}
      aria-pressed={fact?.a === a && fact?.b === b}
      className={`w-full flex items-center justify-between rounded-xl px-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        quiet ? "py-2 text-base" : "py-3 text-lg"
      } ${
        fact?.a === a && fact?.b === b
          ? "bg-primary text-primary-foreground"
          : "hover:bg-primary/10"
      }`}
    >
      <span
        className={`tabular-nums font-display font-bold ${
          quiet ? "text-base" : "text-xl"
        } ${fact?.a === a && fact?.b === b ? "" : "text-foreground"}`}
      >
        {a} × {b}
      </span>
      <span
        className={`tabular-nums font-bold ${
          fact?.a === a && fact?.b === b ? "" : "text-primary"
        } ${quiet ? "text-base" : "text-xl"}`}
      >
        = {a * b}
      </span>
    </button>
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Times Tables</h1>
          <p className="text-muted-foreground text-sm">
            Pick a table to learn it — tap any fact to see how it works
          </p>
        </div>

        {/* Fact detail panel — shared by every view */}
        <AnimatePresence>
          {fact && (
            <motion.div
              key={`${fact.a}-${fact.b}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-2xl shadow-card border border-border p-4 sm:p-6 mb-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-center flex-1">
                  <p className="font-display text-3xl sm:text-5xl font-bold tabular-nums">
                    {fact.a} × {fact.b} ={" "}
                    <span className="text-primary">{fact.a * fact.b}</span>
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {isSymmetric && (
                      <button
                        type="button"
                        onClick={() => setFact({ a: fact.b, b: fact.a })}
                        className="inline-flex items-center gap-1.5 bg-secondary/15 text-foreground text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-secondary/25 transition-colors min-h-[36px]"
                      >
                        <Repeat
                          className="w-3.5 h-3.5 text-secondary"
                          aria-hidden="true"
                        />
                        Same as {fact.b} × {fact.a} — learn one, get one free!
                      </button>
                    )}
                    {isSquare && (
                      <span className="inline-flex items-center gap-1.5 bg-accent/15 text-foreground text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full">
                        <Square
                          className="w-3.5 h-3.5 text-accent"
                          aria-hidden="true"
                        />
                        A square number — these come up a lot!
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFact(null)}
                  aria-label="Close fact details"
                  className="min-w-[40px] min-h-[40px] p-2 shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4">
                <SolutionExplainer a={fact.a} b={fact.b} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {viewMode === "tables" && selectedTable === null && (
          <>
            {/* Pick a table — grouped in learning order */}
            <div className="space-y-6">
              {TABLE_GROUPS.map((group) => (
                <section key={group.id} aria-labelledby={`tg-${group.id}`}>
                  <h2
                    id={`tg-${group.id}`}
                    className="font-display font-bold text-base mb-0.5"
                  >
                    {group.label}
                  </h2>
                  <p className="text-xs text-muted-foreground mb-3">
                    {group.hint}
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                    {group.tables.map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => pickTable(num)}
                        aria-label={`${num} times table`}
                        className={`${group.btnClass} rounded-2xl aspect-square font-display font-bold text-2xl shadow-soft hover:scale-105 hover:shadow-card transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2`}
                      >
                        ×{num}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => {
                  play("whoosh");
                  setViewMode("chart");
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors min-h-[44px] px-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Map className="w-4 h-4" aria-hidden="true" />
                Or explore the whole chart (up to 12 × 12)
              </button>
            </div>
          </>
        )}

        {viewMode === "tables" && selectedTable !== null && (
          <div>
            {/* Focused table view */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  play("whoosh");
                  setSelectedTable(null);
                  setFact(null);
                }}
                className="min-h-[44px] -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                All tables
              </Button>
              <Button
                asChild
                size="sm"
                className="min-h-[44px] rounded-xl font-display font-bold"
              >
                <Link to={`/practice?table=${selectedTable}`}>
                  <Play className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  Practise this table
                </Link>
              </Button>
            </div>

            <div className="bg-card rounded-2xl shadow-card border border-border p-3 sm:p-5">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-center mb-1">
                The {selectedTable} × Table
              </h2>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-4">
                <MousePointerClick className="w-3.5 h-3.5" aria-hidden="true" />
                Tap a fact to see it explained
              </p>

              <div className="space-y-1 max-w-sm mx-auto">
                {CHART_RANGE.map((b) => factRow(selectedTable, b))}
              </div>

              <div className="max-w-sm mx-auto mt-3 pt-3 border-t border-dashed border-border">
                <button
                  type="button"
                  onClick={() => setShowExplorerFacts(!showExplorerFacts)}
                  aria-expanded={showExplorerFacts}
                  className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors min-h-[44px] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Explorer facts ({SCHOOL_MAX + 1}–{TABLES[TABLES.length - 1]})
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showExplorerFacts ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {showExplorerFacts && (
                  <div className="space-y-0.5 mt-1">
                    {TABLES.filter((b) => b > SCHOOL_MAX).map((b) =>
                      factRow(selectedTable, b, true),
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === "chart" && (
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  play("whoosh");
                  setViewMode("tables");
                  setFact(null);
                }}
                className="min-h-[44px] -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                Pick a table
              </Button>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MousePointerClick className="w-3.5 h-3.5" aria-hidden="true" />
                Tap a square
              </p>
            </div>

            <div className="bg-card rounded-2xl p-2 sm:p-4 shadow-card border border-border overflow-x-auto">
              <table
                ref={gridRef}
                onKeyDown={onGridKeyDown}
                className="w-full text-xs sm:text-sm min-w-[480px] border-separate border-spacing-0.5"
                aria-label="Multiplication chart up to 12 times 12"
              >
                <thead>
                  <tr>
                    <th className="p-1.5 text-left font-bold text-muted-foreground sticky left-0 bg-card z-10">
                      ×
                    </th>
                    {CHART_RANGE.map((num) => (
                      <th
                        key={num}
                        scope="col"
                        className={`p-1.5 text-center font-bold rounded transition-colors ${
                          fact?.b === num
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {num}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CHART_RANGE.map((row) => (
                    <tr key={row}>
                      <th
                        scope="row"
                        className={`p-1.5 font-bold rounded text-center sticky left-0 z-10 transition-colors ${
                          fact?.a === row
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-muted-foreground"
                        }`}
                      >
                        {row}
                      </th>
                      {CHART_RANGE.map((col) => {
                        const isFact = fact?.a === row && fact?.b === col;
                        const isTwin = fact?.a === col && fact?.b === row;
                        const inFactLine =
                          fact && (fact.a === row || fact.b === col);
                        return (
                          <td key={col} className="p-0">
                            <button
                              type="button"
                              data-cell={`${row}-${col}`}
                              tabIndex={
                                focusCell.a === row && focusCell.b === col
                                  ? 0
                                  : -1
                              }
                              onFocus={() => setFocusCell({ a: row, b: col })}
                              onClick={() => pickFact(row, col)}
                              aria-label={`${row} times ${col} equals ${row * col}`}
                              aria-pressed={isFact}
                              className={`w-full min-w-7 min-h-8 sm:min-h-9 rounded text-center tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                                isFact
                                  ? "bg-primary text-primary-foreground font-bold"
                                  : isTwin
                                    ? "bg-secondary/25 font-bold border border-dashed border-secondary"
                                    : inFactLine
                                      ? "bg-primary/10 font-semibold"
                                      : row === col
                                        ? "bg-accent/10 hover:bg-accent/20"
                                        : "hover:bg-muted/60"
                              }`}
                            >
                              {row * col}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-accent/20 border border-accent/40" />
                Square numbers (like 7 × 7)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-primary/15" />
                Same fact line
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-semibold">
                  ↑↓←→
                </kbd>
                Arrow keys explore the chart
              </span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tables;
