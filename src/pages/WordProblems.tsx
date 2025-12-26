import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import {
  BookOpen,
  Check,
  X,
  RotateCcw,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

interface Problem {
  story: string;
  question: string;
  a: number;
  b: number;
  answer: number;
  hint: string;
}

const storyTemplates = [
  // Food & Cooking
  {
    template: (a: number, b: number) => ({
      story: `Tom has ${a} bags of apples. Each bag contains ${b} apples.`,
      question: "How many apples does Tom have in total?",
      hint: `Count ${a} groups of ${b} apples`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `Mia baked ${a} trays of cookies. She put ${b} cookies on each tray.`,
      question: "How many cookies did Mia bake?",
      hint: `${a} trays × ${b} cookies on each`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A pizza is cut into ${b} slices. Dad ordered ${a} pizzas for the party.`,
      question: "How many slices of pizza are there?",
      hint: `${a} pizzas × ${b} slices each`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `Mom bought ${a} cartons of eggs. Each carton has ${b} eggs.`,
      question: "How many eggs did Mom buy?",
      hint: `${a} cartons × ${b} eggs`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The baker made ${a} batches of muffins. Each batch has ${b} muffins.`,
      question: "How many muffins did the baker make?",
      hint: `${a} batches × ${b} muffins`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `There are ${a} fruit baskets. Each basket has ${b} oranges.`,
      question: "How many oranges are there in total?",
      hint: `${a} baskets × ${b} oranges`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `Grandma made ${a} jars of jam. Each jar needs ${b} strawberries.`,
      question: "How many strawberries did Grandma use?",
      hint: `${a} jars × ${b} strawberries`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The ice cream shop has ${a} flavors. Each flavor has ${b} toppings available.`,
      question: "How many flavor-topping combinations are possible?",
      hint: `${a} flavors × ${b} toppings`,
    }),
  },

  // School & Classroom
  {
    template: (a: number, b: number) => ({
      story: `There are ${a} rows of desks in the classroom. Each row has ${b} desks.`,
      question: "How many desks are there altogether?",
      hint: `Think of ${a} rows with ${b} desks each`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The school has ${a} classrooms. Each classroom has ${b} students.`,
      question: "How many students are in the school?",
      hint: `${a} classrooms × ${b} students`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `There are ${a} shelves in the library. Each shelf holds ${b} books.`,
      question: "How many books can the library hold?",
      hint: `${a} shelves × ${b} books`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The teacher gave ${a} students ${b} pencils each.`,
      question: "How many pencils did the teacher give out?",
      hint: `${a} students × ${b} pencils`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `There are ${a} tables in the art room. Each table has ${b} paintbrushes.`,
      question: "How many paintbrushes are there?",
      hint: `${a} tables × ${b} paintbrushes`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The music class has ${a} groups. Each group has ${b} instruments.`,
      question: "How many instruments does the class have?",
      hint: `${a} groups × ${b} instruments`,
    }),
  },

  // Animals & Nature
  {
    template: (a: number, b: number) => ({
      story: `A spider has 8 legs. There are ${a} spiders in the garden.`,
      question: "How many spider legs are there in total?",
      hint: `${a} spiders × 8 legs each`,
      fixedB: 8,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `An octopus has 8 arms. The aquarium has ${a} octopuses.`,
      question: "How many octopus arms are there altogether?",
      hint: `${a} octopuses × 8 arms`,
      fixedB: 8,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A cat has 4 legs. There are ${a} cats in the pet shop.`,
      question: "How many cat legs are there in total?",
      hint: `${a} cats × 4 legs`,
      fixedB: 4,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `Each bird has 2 wings. There are ${a} birds in the tree.`,
      question: "How many wings do all the birds have?",
      hint: `${a} birds × 2 wings`,
      fixedB: 2,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The farm has ${a} chicken coops. Each coop has ${b} chickens.`,
      question: "How many chickens are on the farm?",
      hint: `${a} coops × ${b} chickens`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `There are ${a} fish tanks. Each tank has ${b} fish.`,
      question: "How many fish are there altogether?",
      hint: `${a} tanks × ${b} fish`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The zoo has ${a} enclosures. Each enclosure has ${b} monkeys.`,
      question: "How many monkeys does the zoo have?",
      hint: `${a} enclosures × ${b} monkeys`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A bee visits ${b} flowers every minute. It flew for ${a} minutes.`,
      question: "How many flowers did the bee visit?",
      hint: `${a} minutes × ${b} flowers`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `There are ${a} nests in the tree. Each nest has ${b} eggs.`,
      question: "How many eggs are in the tree?",
      hint: `${a} nests × ${b} eggs`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A centipede has many legs! If ${a} centipedes have ${b} legs each...`,
      question: "How many legs do they have altogether?",
      hint: `${a} centipedes × ${b} legs`,
    }),
  },

  // Sports & Games
  {
    template: (a: number, b: number) => ({
      story: `There are ${a} teams in a football tournament. Each team has ${b} players.`,
      question: "How many players are there in total?",
      hint: `${a} teams × ${b} players`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A basketball team scored ${b} points in each quarter. The game has ${a} quarters.`,
      question: "How many points did the team score?",
      hint: `${a} quarters × ${b} points`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The gym has ${a} rows of lockers. Each row has ${b} lockers.`,
      question: "How many lockers does the gym have?",
      hint: `${a} rows × ${b} lockers`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `${a} friends played a video game. Each friend earned ${b} coins.`,
      question: "How many coins did they earn altogether?",
      hint: `${a} friends × ${b} coins`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The swimming pool has ${a} lanes. Each lane fits ${b} swimmers.`,
      question: "How many swimmers can the pool hold?",
      hint: `${a} lanes × ${b} swimmers`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A bowling alley has ${a} lanes. Each lane has ${b} pins.`,
      question: "How many bowling pins are there in total?",
      hint: `${a} lanes × ${b} pins`,
    }),
  },

  // Transportation
  {
    template: (a: number, b: number) => ({
      story: `A car has 4 wheels. There are ${a} cars in the car park.`,
      question: "How many wheels are there altogether?",
      hint: `${a} cars × 4 wheels`,
      fixedB: 4,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A bicycle has 2 wheels. The shop has ${a} bicycles.`,
      question: "How many wheels do all the bicycles have?",
      hint: `${a} bicycles × 2 wheels`,
      fixedB: 2,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A tricycle has 3 wheels. The playground has ${a} tricycles.`,
      question: "How many wheels are there?",
      hint: `${a} tricycles × 3 wheels`,
      fixedB: 3,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `Each bus can carry ${b} passengers. There are ${a} buses.`,
      question: "How many passengers can all the buses carry?",
      hint: `${a} buses × ${b} passengers`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A train has ${a} carriages. Each carriage has ${b} seats.`,
      question: "How many seats does the train have?",
      hint: `${a} carriages × ${b} seats`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The airport has ${a} planes. Each plane has ${b} windows.`,
      question: "How many windows are there on all the planes?",
      hint: `${a} planes × ${b} windows`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A motorcycle has 2 wheels. The showroom has ${a} motorcycles.`,
      question: "How many wheels are in the showroom?",
      hint: `${a} motorcycles × 2 wheels`,
      fixedB: 2,
    }),
  },

  // Shopping & Money
  {
    template: (a: number, b: number) => ({
      story: `${a} friends went to the cinema. Each ticket cost $${b}.`,
      question: "How much did all the tickets cost together?",
      hint: `${a} tickets × $${b} each`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `Emma bought ${a} packs of stickers. Each pack costs $${b}.`,
      question: "How much did Emma spend?",
      hint: `${a} packs × $${b}`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The toy store sold ${a} robots. Each robot costs $${b}.`,
      question: "How much money did the store make?",
      hint: `${a} robots × $${b}`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `Jake saves $${b} every week. He saved for ${a} weeks.`,
      question: "How much money did Jake save?",
      hint: `${a} weeks × $${b}`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A comic book costs $${b}. Lily bought ${a} comic books.`,
      question: "How much did Lily spend on comics?",
      hint: `${a} books × $${b}`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The bakery sells cupcakes for $${b} each. They sold ${a} cupcakes today.`,
      question: "How much money did the bakery earn from cupcakes?",
      hint: `${a} cupcakes × $${b}`,
    }),
  },

  // Home & Family
  {
    template: (a: number, b: number) => ({
      story: `Grandma gave ${a} grandchildren ${b} sweets each.`,
      question: "How many sweets did Grandma give out?",
      hint: `${a} children × ${b} sweets each`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `There are ${a} rooms in the house. Each room has ${b} windows.`,
      question: "How many windows does the house have?",
      hint: `${a} rooms × ${b} windows`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `Mom planted ${a} rows of flowers. Each row has ${b} flowers.`,
      question: "How many flowers did Mom plant?",
      hint: `${a} rows × ${b} flowers`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The apartment building has ${a} floors. Each floor has ${b} apartments.`,
      question: "How many apartments are in the building?",
      hint: `${a} floors × ${b} apartments`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `Each bookshelf has ${b} shelves. There are ${a} bookshelves in the study.`,
      question: "How many shelves are there in total?",
      hint: `${a} bookshelves × ${b} shelves`,
    }),
  },

  // Arts & Crafts
  {
    template: (a: number, b: number) => ({
      story: `Lily has ${a} sticker sheets. Each sheet has ${b} stickers.`,
      question: "How many stickers does Lily have?",
      hint: `${a} sheets × ${b} stickers`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `There are ${a} boxes of crayons. Each box has ${b} crayons.`,
      question: "How many crayons are there in all?",
      hint: `${a} boxes × ${b} crayons`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `Sophie made ${a} friendship bracelets. Each bracelet needs ${b} beads.`,
      question: "How many beads did Sophie use?",
      hint: `${a} bracelets × ${b} beads`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The art class made ${a} collages. Each collage used ${b} pieces of paper.`,
      question: "How many pieces of paper were used?",
      hint: `${a} collages × ${b} pieces`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `Max built ${a} LEGO towers. Each tower used ${b} bricks.`,
      question: "How many LEGO bricks did Max use?",
      hint: `${a} towers × ${b} bricks`,
    }),
  },

  // Time & Reading
  {
    template: (a: number, b: number) => ({
      story: `Sam reads ${b} pages every day. He reads for ${a} days.`,
      question: "How many pages does Sam read altogether?",
      hint: `${a} days × ${b} pages per day`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A clock chimes ${b} times every hour. How many times does it chime in ${a} hours?`,
      question: "How many chimes in total?",
      hint: `${a} hours × ${b} chimes`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `Emily practices piano for ${b} minutes each day. She practiced for ${a} days.`,
      question: "How many minutes did Emily practice?",
      hint: `${a} days × ${b} minutes`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A TV show has ${b} episodes. Oliver watched ${a} seasons.`,
      question: "How many episodes did Oliver watch?",
      hint: `${a} seasons × ${b} episodes`,
    }),
  },

  // Space & Science
  {
    template: (a: number, b: number) => ({
      story: `A rocket has ${a} engines. Each engine needs ${b} fuel tanks.`,
      question: "How many fuel tanks does the rocket need?",
      hint: `${a} engines × ${b} tanks`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The science lab has ${a} tables. Each table has ${b} test tubes.`,
      question: "How many test tubes are in the lab?",
      hint: `${a} tables × ${b} test tubes`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `${a} planets each have ${b} moons in our pretend solar system.`,
      question: "How many moons are there altogether?",
      hint: `${a} planets × ${b} moons`,
    }),
  },

  // Celebrations & Parties
  {
    template: (a: number, b: number) => ({
      story: `There are ${a} party bags. Each bag has ${b} treats inside.`,
      question: "How many treats are there in total?",
      hint: `${a} bags × ${b} treats`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `${a} tables at the party each have ${b} balloons.`,
      question: "How many balloons are there altogether?",
      hint: `${a} tables × ${b} balloons`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The birthday cake has ${a} layers. Each layer has ${b} candles.`,
      question: "How many candles are on the cake?",
      hint: `${a} layers × ${b} candles`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `${a} guests each brought ${b} presents to the party.`,
      question: "How many presents were brought?",
      hint: `${a} guests × ${b} presents`,
    }),
  },

  // Garden & Outdoors
  {
    template: (a: number, b: number) => ({
      story: `The garden has ${a} vegetable patches. Each patch has ${b} tomato plants.`,
      question: "How many tomato plants are in the garden?",
      hint: `${a} patches × ${b} plants`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `There are ${a} apple trees. Each tree has ${b} apples.`,
      question: "How many apples are there in total?",
      hint: `${a} trees × ${b} apples`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The park has ${a} benches. Each bench can seat ${b} people.`,
      question: "How many people can sit on all the benches?",
      hint: `${a} benches × ${b} people`,
    }),
  },

  // Fantasy & Fun
  {
    template: (a: number, b: number) => ({
      story: `A dragon has ${b} claws on each foot. It has ${a} feet.`,
      question: "How many claws does the dragon have?",
      hint: `${a} feet × ${b} claws`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A wizard has ${a} spell books. Each book contains ${b} spells.`,
      question: "How many spells does the wizard know?",
      hint: `${a} books × ${b} spells`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The fairy has ${a} wands. Each wand can grant ${b} wishes.`,
      question: "How many wishes can the fairy grant?",
      hint: `${a} wands × ${b} wishes`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `${a} pirates each found ${b} gold coins on the island.`,
      question: "How many gold coins did they find altogether?",
      hint: `${a} pirates × ${b} coins`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `The castle has ${a} towers. Each tower has ${b} guards.`,
      question: "How many guards protect the castle?",
      hint: `${a} towers × ${b} guards`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A unicorn gallops ${b} miles each hour. It ran for ${a} hours.`,
      question: "How many miles did the unicorn travel?",
      hint: `${a} hours × ${b} miles`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `${a} superheroes each saved ${b} people today.`,
      question: "How many people were saved in total?",
      hint: `${a} heroes × ${b} people`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A robot has ${a} arms. Each arm has ${b} buttons.`,
      question: "How many buttons does the robot have?",
      hint: `${a} arms × ${b} buttons`,
    }),
  },
];

const generateProblem = (selectedTables: number[]): Problem => {
  const a = selectedTables[Math.floor(Math.random() * selectedTables.length)];
  const templateIndex = Math.floor(Math.random() * storyTemplates.length);
  const template = storyTemplates[templateIndex];

  // Check if template has a fixed B value (for animals with specific legs, wheels, etc.)
  const templateResult = template.template(1, 1);
  const hasFixedB = "fixedB" in templateResult;

  let b: number;
  if (hasFixedB) {
    b = (templateResult as { fixedB: number }).fixedB;
  } else {
    b = Math.floor(Math.random() * 12) + 1;
  }

  const { story, question, hint } = template.template(a, b);

  return {
    story,
    question,
    a,
    b,
    answer: a * b,
    hint,
  };
};

const WordProblems = () => {
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 3, 4, 5]);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(
    null,
  );
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const allTables = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const toggleTable = (table: number) => {
    setSelectedTables((prev) => {
      if (prev.includes(table)) {
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== table);
      }
      return [...prev, table].sort((a, b) => a - b);
    });
  };

  const selectUpTo = (table: number) => {
    const tables = allTables.filter((t) => t <= table);
    setSelectedTables(tables);
  };

  const startPractice = useCallback(() => {
    setProblem(generateProblem(selectedTables));
    setUserAnswer("");
    setShowResult(null);
    setShowHint(false);
  }, [selectedTables]);

  const nextProblem = () => {
    setProblem(generateProblem(selectedTables));
    setUserAnswer("");
    setShowResult(null);
    setShowHint(false);
  };

  const checkAnswer = () => {
    if (!problem || userAnswer === "") return;

    const isCorrect = parseInt(userAnswer) === problem.answer;
    setShowResult(isCorrect ? "correct" : "wrong");
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (showResult) {
        nextProblem();
      } else {
        checkAnswer();
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {!problem ? (
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                📖 Word Problems
              </h1>
              <p className="text-muted-foreground">
                Practice multiplication with fun story problems!
              </p>
            </div>

            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border mb-6">
              <h2 className="text-xl font-bold mb-2">
                Which tables do you know?
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Problems will use these times tables
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {allTables.map((table) => (
                  <Button
                    key={table}
                    variant={
                      selectedTables.includes(table) ? "default" : "game"
                    }
                    size="sm"
                    onClick={() => toggleTable(table)}
                    className="w-12 h-12 text-lg font-bold"
                  >
                    {table}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <p className="w-full text-xs text-muted-foreground mb-1">
                  Quick select up to:
                </p>
                {[2, 3, 4, 5, 6, 10, 12].map((table) => (
                  <Button
                    key={table}
                    variant="outline"
                    size="sm"
                    onClick={() => selectUpTo(table)}
                    className="text-xs"
                  >
                    Up to {table}×
                  </Button>
                ))}
              </div>

              <Button size="xl" onClick={startPractice}>
                <BookOpen className="w-6 h-6" />
                Start Practice!
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {/* Score */}
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 bg-success/20 text-success px-4 py-2 rounded-full font-bold">
                Score: {score.correct}/{score.total}
              </span>
            </div>

            {/* Problem Card */}
            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border mb-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg md:text-xl leading-relaxed mb-4">
                  {problem.story}
                </p>
                <p className="text-xl md:text-2xl font-bold text-primary">
                  {problem.question}
                </p>
              </div>

              {/* Hint Button */}
              {!showHint && !showResult && (
                <div className="text-center mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(true)}
                    className="text-muted-foreground"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Need a hint?
                  </Button>
                </div>
              )}

              {showHint && !showResult && (
                <div className="bg-secondary/20 rounded-2xl p-4 mb-4 text-center">
                  <p className="text-sm">
                    <Lightbulb className="w-4 h-4 inline mr-2 text-secondary" />
                    <span className="font-semibold">Hint:</span> {problem.hint}
                  </p>
                  <p className="text-lg font-bold mt-2 text-secondary">
                    {problem.a} × {problem.b} = ?
                  </p>
                </div>
              )}

              {/* Answer Input */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">Answer:</span>
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={showResult !== null}
                    className="w-24 h-14 text-2xl font-bold text-center border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background"
                    autoFocus
                    aria-label="Your answer"
                  />
                </div>

                {showResult === null ? (
                  <Button
                    size="lg"
                    onClick={checkAnswer}
                    disabled={userAnswer === ""}
                  >
                    <Check className="w-5 h-5" />
                    Check Answer
                  </Button>
                ) : (
                  <div className="text-center">
                    <div
                      className={`flex items-center justify-center gap-2 text-2xl font-bold mb-4 ${
                        showResult === "correct"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {showResult === "correct" ? (
                        <>
                          <Check className="w-8 h-8" />
                          Correct! Well done! 🎉
                        </>
                      ) : (
                        <>
                          <X className="w-8 h-8" />
                          Not quite! The answer is {problem.answer}
                        </>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {problem.a} × {problem.b} = {problem.answer}
                    </p>
                    <Button size="lg" onClick={nextProblem}>
                      <ArrowRight className="w-5 h-5" />
                      Next Problem
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setProblem(null);
                  setScore({ correct: 0, total: 0 });
                }}
              >
                <RotateCcw className="w-4 h-4" />
                Change Tables
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WordProblems;
