import { useState } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";

const Tables = () => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const tables = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            📊 Times Tables Reference
          </h1>
          <p className="text-muted-foreground">
            Click on a number to see its times table, or view them all!
          </p>
        </div>

        {/* Table Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={selectedTable === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTable(null)}
          >
            All Tables
          </Button>
          {tables.map((num) => (
            <Button
              key={num}
              variant={selectedTable === num ? "secondary" : "game"}
              size="sm"
              onClick={() => setSelectedTable(num)}
              className="w-12"
            >
              {num}
            </Button>
          ))}
        </div>

        {/* Tables Display */}
        <div className={`grid gap-4 ${
          selectedTable 
            ? "grid-cols-1 max-w-md mx-auto" 
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        }`}>
          {(selectedTable ? [selectedTable] : tables).map((tableNum) => (
            <div
              key={tableNum}
              className="bg-card rounded-2xl p-4 md:p-6 shadow-card border border-border hover:border-primary transition-all duration-300 animate-pop"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    {tableNum}
                  </span>
                </div>
                <h2 className="text-xl font-bold">× Table</h2>
              </div>

              <div className="space-y-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((multiplier) => (
                  <div
                    key={multiplier}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                      {tableNum} × {multiplier}
                    </span>
                    <span className="font-bold text-foreground">
                      = {tableNum * multiplier}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Tables;
