import { useState } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Grid3X3, List } from "lucide-react";

type ViewMode = "grid" | "compact";

const Tables = () => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const tables = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
            Times Tables Reference
          </h1>
          <p className="text-muted-foreground text-sm">
            Click a number to focus, or view all tables at once
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="flex gap-1 mr-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="px-2"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "compact" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("compact")}
              className="px-2"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant={selectedTable === null ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedTable(null)}
          >
            All
          </Button>
          {tables.map((num) => (
            <Button
              key={num}
              variant={selectedTable === num ? "default" : "ghost"}
              size="sm"
              onClick={() =>
                setSelectedTable(selectedTable === num ? null : num)
              }
              className="w-9 h-9 p-0"
            >
              {num}
            </Button>
          ))}
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div
            className={`grid gap-3 ${
              selectedTable
                ? "grid-cols-1 max-w-sm mx-auto"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
            }`}
          >
            {(selectedTable ? [selectedTable] : tables).map((tableNum) => (
              <motion.div
                key={tableNum}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-card rounded-xl p-3 shadow-soft border border-border hover:border-primary transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                  <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">
                      {tableNum}
                    </span>
                  </div>
                  <span className="font-bold text-sm">× Table</span>
                </div>

                <div className="space-y-0.5 text-sm">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(
                    (multiplier) => (
                      <div
                        key={multiplier}
                        className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-muted-foreground text-xs">
                          {tableNum} × {multiplier}
                        </span>
                        <span className="font-semibold">
                          {tableNum * multiplier}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Compact View - All tables in one grid */}
        {viewMode === "compact" && (
          <div className="bg-card rounded-xl p-4 shadow-soft border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left font-bold text-muted-foreground">
                    ×
                  </th>
                  {tables.map((num) => (
                    <th
                      key={num}
                      className={`p-2 text-center font-bold cursor-pointer hover:bg-primary/10 rounded transition-colors ${
                        selectedTable === num
                          ? "bg-primary/20 text-primary"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedTable(selectedTable === num ? null : num)
                      }
                    >
                      {num}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tables.map((row) => (
                  <tr key={row} className="border-t border-border/50">
                    <td
                      className={`p-2 font-bold cursor-pointer hover:bg-primary/10 rounded transition-colors ${
                        selectedTable === row
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground"
                      }`}
                      onClick={() =>
                        setSelectedTable(selectedTable === row ? null : row)
                      }
                    >
                      {row}
                    </td>
                    {tables.map((col) => {
                      const isHighlighted =
                        selectedTable === row || selectedTable === col;
                      return (
                        <td
                          key={col}
                          className={`p-2 text-center transition-colors ${
                            isHighlighted
                              ? "bg-primary/10 font-semibold text-primary"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          {row * col}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Quick reference tip */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Tip: Click any number in the header row or first column to highlight
            that table
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Tables;
