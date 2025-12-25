import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { Printer, FileText, Shuffle } from "lucide-react";

type WorksheetType = "table" | "random" | "fill-blank";

const Print = () => {
  const [selectedTable, setSelectedTable] = useState(2);
  const [worksheetType, setWorksheetType] = useState<WorksheetType>("table");
  const [showAnswers, setShowAnswers] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const tables = Array.from({ length: 12 }, (_, i) => i + 1);

  const generateRandomProblems = () => {
    const problems = [];
    for (let i = 0; i < 20; i++) {
      const a = Math.floor(Math.random() * 12) + 1;
      const b = Math.floor(Math.random() * 12) + 1;
      problems.push({ a, b, answer: a * b });
    }
    return problems;
  };

  const generateFillBlank = () => {
    const problems = [];
    for (let i = 0; i < 20; i++) {
      const a = Math.floor(Math.random() * 12) + 1;
      const b = Math.floor(Math.random() * 12) + 1;
      const blankPosition = Math.floor(Math.random() * 3); // 0: first, 1: second, 2: answer
      problems.push({ a, b, answer: a * b, blankPosition });
    }
    return problems;
  };

  const [randomProblems] = useState(generateRandomProblems);
  const [fillBlankProblems] = useState(generateFillBlank);

  const handlePrint = () => {
    window.print();
  };

  const regenerateProblems = () => {
    window.location.reload();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 no-print">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            🖨️ Print Worksheets
          </h1>
          <p className="text-muted-foreground">
            Generate and print practice worksheets!
          </p>
        </div>

        {/* Controls */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border mb-6 no-print">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Worksheet Type
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={worksheetType === "table" ? "default" : "game"}
                  size="sm"
                  onClick={() => setWorksheetType("table")}
                >
                  <FileText className="w-4 h-4" />
                  Single Table
                </Button>
                <Button
                  variant={worksheetType === "random" ? "default" : "game"}
                  size="sm"
                  onClick={() => setWorksheetType("random")}
                >
                  <Shuffle className="w-4 h-4" />
                  Mixed
                </Button>
                <Button
                  variant={worksheetType === "fill-blank" ? "default" : "game"}
                  size="sm"
                  onClick={() => setWorksheetType("fill-blank")}
                >
                  ❓ Fill Blank
                </Button>
              </div>
            </div>

            {worksheetType === "table" && (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Select Table
                </label>
                <div className="flex flex-wrap gap-1">
                  {tables.map((num) => (
                    <Button
                      key={num}
                      variant={selectedTable === num ? "secondary" : "game"}
                      size="sm"
                      className="w-9 h-9"
                      onClick={() => setSelectedTable(num)}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">Options</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={showAnswers ? "success" : "game"}
                  size="sm"
                  onClick={() => setShowAnswers(!showAnswers)}
                >
                  {showAnswers ? "✓ Answers" : "Hide Answers"}
                </Button>
                {worksheetType !== "table" && (
                  <Button variant="game" size="sm" onClick={regenerateProblems}>
                    <Shuffle className="w-4 h-4" />
                    New Problems
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Button onClick={handlePrint} size="lg" className="w-full">
            <Printer className="w-5 h-5" />
            Print Worksheet
          </Button>
        </div>

        {/* Printable Worksheet */}
        <div
          ref={printRef}
          className="bg-card rounded-2xl p-8 shadow-card border border-border print:shadow-none print:border-none print:rounded-none"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-1">
              {worksheetType === "table"
                ? `${selectedTable} Times Table`
                : worksheetType === "random"
                ? "Mixed Multiplication Practice"
                : "Fill in the Blank"}
            </h2>
            <p className="text-muted-foreground text-sm">
              Name: _________________ Date: _________________
            </p>
          </div>

          {worksheetType === "table" && (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((multiplier) => (
                <div
                  key={multiplier}
                  className="flex items-center justify-between py-2 px-4 border-b border-border"
                >
                  <span className="text-lg">
                    {selectedTable} × {multiplier} =
                  </span>
                  <span className="text-lg font-bold min-w-12 text-right">
                    {showAnswers ? selectedTable * multiplier : "_____"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {worksheetType === "random" && (
            <div className="grid grid-cols-2 gap-4">
              {randomProblems.map((problem, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 px-4 border-b border-border"
                >
                  <span className="text-lg">
                    {idx + 1}. {problem.a} × {problem.b} =
                  </span>
                  <span className="text-lg font-bold min-w-12 text-right">
                    {showAnswers ? problem.answer : "_____"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {worksheetType === "fill-blank" && (
            <div className="grid grid-cols-2 gap-4">
              {fillBlankProblems.map((problem, idx) => (
                <div
                  key={idx}
                  className="flex items-center py-2 px-4 border-b border-border"
                >
                  <span className="text-lg">
                    {idx + 1}.{" "}
                    {problem.blankPosition === 0 ? (
                      <>
                        <span className="font-bold">
                          {showAnswers ? problem.a : "___"}
                        </span>{" "}
                        × {problem.b} = {problem.answer}
                      </>
                    ) : problem.blankPosition === 1 ? (
                      <>
                        {problem.a} ×{" "}
                        <span className="font-bold">
                          {showAnswers ? problem.b : "___"}
                        </span>{" "}
                        = {problem.answer}
                      </>
                    ) : (
                      <>
                        {problem.a} × {problem.b} ={" "}
                        <span className="font-bold">
                          {showAnswers ? problem.answer : "___"}
                        </span>
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          {showAnswers && (
            <div className="mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground">
              Answer Key
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Print;
