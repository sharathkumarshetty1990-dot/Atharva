"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Info, 
  Check, 
  X, 
  HelpCircle, 
  Star, 
  TrendingUp, 
  Flame, 
  BookOpen 
} from "lucide-react";

// --- Types ---
interface Question {
  id: number;
  type: "mcq" | "text";
  question: string;
  options?: string[];
  correctAnswer: string;
  image?: string;
  explanation: string;
}

// --- Quiz Questions Data ---
const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    type: "mcq",
    question: "What is the minimum number of players a team needs on the field to start a match?",
    options: ["6", "7", "8", "9"],
    correctAnswer: "7",
    explanation: "According to IFAB Law 3, a match may not start or continue if either team has fewer than seven players on the field. If a team has fewer than seven players because one or more players have deliberately left the field of play, the referee is not obliged to stop play immediately, but the match must not resume after the ball is out of play."
  },
  {
    id: 2,
    type: "mcq",
    question: "Which player has the most appearances in FIFA World Cup matches?",
    options: ["Lothar Matthäus", "Lionel Messi", "Cristiano Ronaldo", "Paolo Maldini"],
    correctAnswer: "Lionel Messi",
    explanation: "Lionel Messi surpassed Lothar Matthäus' long-standing record of 25 World Cup appearances during the 2022 FIFA World Cup in Qatar. Messi finished the tournament with 26 total appearances, leading Argentina to their historic third World Cup title."
  },
  {
    id: 3,
    type: "mcq",
    question: "Which club did Lionel Messi score his first senior goal against?",
    options: ["Real Madrid", "Valencia", "Albacete Balompié", "Sevilla"],
    correctAnswer: "Albacete Balompié",
    explanation: "On May 1, 2005, a 17-year-old Lionel Messi scored his first official senior goal for FC Barcelona against Albacete Balompié at the Camp Nou. He received a brilliant scooped pass from Ronaldinho and lobbed the ball over goalkeeper Raúl Valbuena."
  },
  {
    id: 4,
    type: "mcq",
    question: "What inspired Antoine Griezmann's famous 'L' celebration?",
    options: ["Childhood Coach", "Fortnite", "Friend", "None of these"],
    correctAnswer: "Fortnite",
    image: "/griezmann_celebration_real.jpg",
    explanation: "Antoine Griezmann's signature 'L' celebration is inspired by the popular battle royale video game Fortnite and its cheeky 'Take the L' dance emote. The emote is used by gamers to tease defeated opponents, and Griezmann brought it to the global football stage during Euro 2016 and the 2018 World Cup!"
  },
  {
    id: 5,
    type: "mcq",
    question: "Who is the youngest player ever to score in a FIFA World Cup?",
    options: ["Kylian Mbappé", "Michael Owen", "Pelé", "Diego Maradona"],
    correctAnswer: "Pelé",
    explanation: "The legendary Brazilian forward Pelé is the youngest player to score a goal in World Cup history. He was just 17 years and 239 days old when he scored against Wales in the quarter-finals of the 1958 World Cup in Sweden."
  },
  {
    id: 6,
    type: "mcq",
    question: "A player deliberately throws their boot at the ball to stop it from entering the goal. What is the referee's decision?",
    options: ["Play on", "Indirect free kick", "Red card and penalty", "Drop ball"],
    correctAnswer: "Red card and penalty",
    explanation: "According to the Laws of the Game, if a player throws an object (such as a boot) at the ball and denies an obvious goal-scoring opportunity, the referee must award a penalty kick (since the offense of throwing took place inside the penalty area) and send off the player with a straight red card."
  }
];

// --- Shuffling Helper ---
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Confetti Component (For High Scores) ---
function Confetti() {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; color: string; size: number; shape: 'circle' | 'square' | 'triangle' }>>([]);

  useEffect(() => {
    const colors = ["#10b981", "#34d399", "#3b82f6", "#f59e0b", "#ef4444", "#ec4899", "#ffffff"];
    const shapes: Array<"circle" | "square" | "triangle"> = ["circle", "square", "triangle"];
    const newParticles = Array.from({ length: 80 }).map((_, idx) => ({
      id: idx,
      left: Math.random() * 100,
      delay: Math.random() * 3.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 6,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));
    const timer = setTimeout(() => {
      setParticles(newParticles);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {particles.map((p) => {
        let borderRadius = "0%";
        if (p.shape === "circle") borderRadius = "50%";
        
        return (
          <div
            key={p.id}
            className="confetti-particle"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              backgroundColor: p.shape !== "triangle" ? p.color : "transparent",
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: borderRadius,
              borderLeft: p.shape === "triangle" ? `${p.size / 2}px solid transparent` : undefined,
              borderRight: p.shape === "triangle" ? `${p.size / 2}px solid transparent` : undefined,
              borderBottom: p.shape === "triangle" ? `${p.size}px solid ${p.color}` : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

// --- Main Application Component ---
export default function Page() {
  // Game state
  const [phase, setPhase] = useState<"welcome" | "playing" | "explanation" | "results">("welcome");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  
  // Answering state
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedInput, setTypedInput] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean | null>(null);
  const [answersHistory, setAnswersHistory] = useState<Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }>>([]);

  const currentQuestion = QUIZ_QUESTIONS[currentIdx];

  // Restart quiz
  const handleStartQuiz = () => {
    setPhase("playing");
    setCurrentIdx(0);
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setAnswersHistory([]);
    setSelectedOption(null);
    setTypedInput("");
    setIsSubmitted(false);
    setIsCurrentCorrect(null);
    
    const firstQ = QUIZ_QUESTIONS[0];
    if (firstQ && firstQ.type === "mcq" && firstQ.options) {
      setShuffledOptions(shuffleArray(firstQ.options));
    } else {
      setShuffledOptions([]);
    }
  };

  // Handle option selection for MCQs
  const handleOptionClick = (option: string) => {
    if (isSubmitted) return; // Prevent double clicking
    
    setSelectedOption(option);
    setIsSubmitted(true);
    
    const correct = option === currentQuestion.correctAnswer;
    setIsCurrentCorrect(correct);
    
    if (correct) {
      setScore((prev) => prev + 100);
      setCorrectCount((prev) => prev + 1);
    } else {
      setIncorrectCount((prev) => prev + 1);
    }

    // Save to history
    setAnswersHistory((prev) => [
      ...prev,
      {
        question: currentQuestion.question,
        userAnswer: option,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: correct,
        explanation: currentQuestion.explanation,
      }
    ]);
  };

  // Handle submitting typed input for Griezmann question
  const handleTypedSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitted || !typedInput.trim()) return;

    setIsSubmitted(true);
    const normalizedInput = typedInput.toLowerCase().trim();
    const correct = normalizedInput.includes("fortnite");
    setIsCurrentCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 100);
      setCorrectCount((prev) => prev + 1);
    } else {
      setIncorrectCount((prev) => prev + 1);
    }

    setAnswersHistory((prev) => [
      ...prev,
      {
        question: currentQuestion.question,
        userAnswer: typedInput.trim(),
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: correct,
        explanation: currentQuestion.explanation,
      }
    ]);
  };

  // Transition to the explanation (Breakdown) screen
  const handleContinue = () => {
    setPhase("explanation");
  };

  // Transition to the next question or results
  const handleNextQuestion = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < QUIZ_QUESTIONS.length) {
      setCurrentIdx(nextIdx);
      setPhase("playing");
      setSelectedOption(null);
      setTypedInput("");
      setIsSubmitted(false);
      setIsCurrentCorrect(null);
      
      const nextQ = QUIZ_QUESTIONS[nextIdx];
      if (nextQ && nextQ.type === "mcq" && nextQ.options) {
        setShuffledOptions(shuffleArray(nextQ.options));
      } else {
        setShuffledOptions([]);
      }
    } else {
      setPhase("results");
    }
  };

  // Progress percentage
  const progressPercent = ((currentIdx + (phase === "explanation" ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden geometric-gradient geometric-grid">
      {/* Decorative soccer stadium grid and modern glowing blobs */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#22c55e]/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] border border-white/[0.02] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-green-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Container holding cards */}
      <div className="w-full max-w-xl relative z-10">
        
        {/* APP HEADER - Styled according to "Geometric Balance" layout */}
        <header className="flex items-center justify-between mb-8 border-b border-white/5 pb-5">
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] font-bold tracking-[0.25em] text-green-500 uppercase">Pro League</span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white font-display">Elite Football IQ</h1>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-widest text-gray-500">Current Score</span>
              <span className="text-xl font-mono font-bold text-white tracking-tighter">
                {score.toString().padStart(4, "0")} <span className="text-green-500 text-xs">XP</span>
              </span>
            </div>
            <div className="w-[1px] bg-white/10 h-6"></div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-widest text-gray-500">Accuracy</span>
              <span className="text-xl font-bold tracking-tighter text-white font-mono">
                {answersHistory.length > 0 ? `${Math.round((correctCount / answersHistory.length) * 100)}%` : "0%"}
              </span>
            </div>
          </div>
        </header>

        {/* PROGRESS BAR CONTAINER - Styled according to "Geometric Balance" */}
        <div className="w-full bg-white/5 h-1.5 rounded-full mb-8 overflow-hidden relative shadow-inner">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          
          {/* 1. WELCOME SCREEN */}
          {phase === "welcome" && (
            <motion.div
              key="welcome-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white/[0.03] border border-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl text-center relative overflow-hidden"
              id="welcome-card"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/10 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                  <div className="relative bg-white/[0.02] border border-white/10 p-5 rounded-full text-green-400 animate-float">
                    <Trophy className="w-12 h-12" />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white mb-3">
                Kick-off Your Trivia Challenge!
              </h2>
              
              <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-sm mx-auto font-sans">
                Do you have the tactical knowledge to start a match or name World Cup legends? Answer 6 challenging questions to lift the virtual cup.
              </p>

              {/* Game Info Strip */}
              <div className="grid grid-cols-3 gap-3 mb-8 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <div className="text-center">
                  <div className="text-white font-extrabold font-display text-lg">6</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Questions</div>
                </div>
                <div className="text-center border-x border-white/5">
                  <div className="text-green-400 font-extrabold font-display text-lg">100</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">XP / Goal</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-extrabold font-display text-lg">Pro</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Difficulty</div>
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                id="btn-kickoff"
                className="w-full bg-white hover:bg-green-400 active:scale-95 text-black font-display font-bold py-4 px-6 rounded-xl transition duration-200 transform shadow-lg flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                KICK OFF
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* 2. PLAYING PHASE */}
          {phase === "playing" && (
            <motion.div
              key={`playing-${currentIdx}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white/[0.03] border border-white/10 backdrop-blur-md rounded-3xl p-5 md:p-8 shadow-2xl relative overflow-hidden"
              id={`question-card-${currentIdx}`}
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/10 blur-[80px] rounded-full pointer-events-none"></div>

              {/* Top Meta Stats Header */}
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Question {currentIdx + 1} / {QUIZ_QUESTIONS.length}
                </span>
                <span className="flex items-center gap-2 text-xs text-green-400 font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> 
                  {currentQuestion.type === "mcq" ? "Multiple Choice" : "Image Recognition"}
                </span>
              </div>

              {/* IMAGE FOR IMAGE QUESTION */}
              {currentQuestion.image && (
                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-6 border border-white/5 bg-[#10141A] shadow-inner group">
                  <Image
                    src={currentQuestion.image}
                    alt="Antoine Griezmann L Celebration"
                    fill
                    sizes="(max-width: 600px) 100vw, 600px"
                    className="object-cover group-hover:scale-102 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-transparent to-transparent opacity-70" />
                  <div className="absolute bottom-4 left-6 z-10">
                    <span className="text-xs text-white/40 italic">Source: 2018 World Cup Celebration</span>
                  </div>
                </div>
              )}

              {/* Question Text */}
              <h2 className="text-2xl md:text-3xl font-semibold leading-tight mb-8 text-white font-display" id={`question-text-${currentIdx}`}>
                {currentQuestion.question}
              </h2>

              {/* ANSWERS BLOCK */}
              {currentQuestion.type === "mcq" ? (
                /* MCQ Options Layout */
                <div className="space-y-4" id="mcq-options">
                  {shuffledOptions.map((option, index) => {
                    const alphabet = ["A", "B", "C", "D"][index];
                    const isSelected = selectedOption === option;
                    const isCorrectAnswer = option === currentQuestion.correctAnswer;
                    
                    // Geometric Balance style states
                    let btnStyle = "border-white/5 bg-white/[0.03] text-white hover:bg-white/[0.06] hover:border-white/10";
                    let badgeStyle = "bg-white/5 text-slate-300 group-hover:bg-green-500/20 group-hover:text-green-400";
                    let iconColor = "";

                    if (isSubmitted) {
                      if (isSelected) {
                        if (isCorrectAnswer) {
                          btnStyle = "border-green-500/50 bg-green-500/10 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                          badgeStyle = "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]";
                          iconColor = "text-green-500";
                        } else {
                          btnStyle = "border-rose-500/50 bg-rose-500/10 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.3)]";
                          badgeStyle = "bg-rose-500 text-white";
                          iconColor = "text-rose-500";
                        }
                      } else if (isCorrectAnswer) {
                        // Highlight correct one subtly if user missed it
                        btnStyle = "border-green-500/30 bg-green-500/5 text-green-100/80";
                        badgeStyle = "bg-green-500/20 text-green-400 border border-green-500/30";
                      } else {
                        btnStyle = "opacity-40 cursor-not-allowed border-white/5 bg-white/[0.01]";
                        badgeStyle = "bg-white/5 text-slate-500";
                      }
                    }

                    return (
                      <button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        disabled={isSubmitted}
                        id={`option-${alphabet}`}
                        className={`group relative w-full flex items-center p-5 rounded-2xl border-2 transition-all duration-200 text-left overflow-hidden ${
                          !isSubmitted ? "active:scale-[0.99] cursor-pointer" : "cursor-default"
                        } ${btnStyle}`}
                      >
                        {/* Alphabet Badge */}
                        <span className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold mr-4 shrink-0 transition-all ${badgeStyle}`}>
                          {alphabet}
                        </span>

                        {/* Text */}
                        <span className="flex-grow font-medium text-base select-none">{option}</span>

                        {/* Feedback Icons */}
                        {isSubmitted && isSelected && isCorrectAnswer && (
                          <svg className="ml-auto w-6 h-6 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                          </svg>
                        )}
                        {isSubmitted && isSelected && !isCorrectAnswer && (
                          <svg className="ml-auto w-6 h-6 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* TEXT INPUT QUESTION Layout */
                <div id="text-input-field" className="space-y-4">
                  <form onSubmit={handleTypedSubmit} className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={typedInput}
                        onChange={(e) => setTypedInput(e.target.value)}
                        disabled={isSubmitted}
                        placeholder="Type your answer (e.g. video game)..."
                        id="player-typed-answer"
                        className={`w-full px-5 py-5 bg-white/[0.03] border-2 rounded-2xl text-white placeholder-slate-500 font-sans text-base focus:outline-none focus:ring-2 transition duration-200 ${
                          isSubmitted
                            ? isCurrentCorrect
                              ? "border-green-500 bg-green-500/10 ring-green-500/20"
                              : "border-rose-500 bg-rose-500/10 ring-rose-500/20"
                            : "border-white/10 focus:border-green-500 focus:ring-green-500/10"
                        }`}
                        required
                      />
                      
                      {/* Checkmark/Cross overlays */}
                      {isSubmitted && (
                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                          {isCurrentCorrect ? (
                            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                            </svg>
                          )}
                        </div>
                      )}
                    </div>

                    {!isSubmitted && (
                      <button
                        type="submit"
                        id="btn-text-submit"
                        disabled={!typedInput.trim()}
                        className="w-full bg-white text-black hover:bg-green-400 active:scale-95 font-display font-bold py-4 px-6 rounded-xl transition duration-150 transform disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-sm tracking-wider"
                      >
                        SUBMIT ANSWER
                      </button>
                    )}
                  </form>
                </div>
              )}

              {/* FEEDBACK & CONTINUE BUTTON (FOOTER PATTERN) */}
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-5 rounded-2xl text-left">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isCurrentCorrect ? "bg-green-500/20 text-green-400" : "bg-rose-500/20 text-rose-400"}`}>
                        {isCurrentCorrect ? (
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <X className="w-5 h-5 stroke-[2.5]" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                        <strong className="text-white">{isCurrentCorrect ? "Correct!" : "Incorrect."}</strong>{" "}
                        {isCurrentCorrect ? "Fantastic job! Secured 100 XP." : `Answer was "${currentQuestion.correctAnswer}".`}
                      </p>
                    </div>
                    <button 
                      onClick={handleContinue}
                      id="btn-continue-to-debrief"
                      className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-green-400 transition-colors flex items-center justify-center gap-2 active:scale-95 shrink-0 cursor-pointer text-sm"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* 3. EXPLANATION (TACTICAL BREAKDOWN) DEBRIEF VIEW */}
          {phase === "explanation" && (
            <motion.div
              key={`explanation-${currentIdx}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white/[0.03] border border-white/10 backdrop-blur-md rounded-3xl p-5 md:p-8 shadow-2xl space-y-6 relative overflow-hidden"
              id={`debrief-card-${currentIdx}`}
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/10 blur-[80px] rounded-full pointer-events-none"></div>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-green-400">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <span className="font-display font-bold text-sm tracking-widest text-white uppercase">
                    TACTICAL DEBRIEF #{currentIdx + 1}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  PROGRESS {Math.round(progressPercent)}%
                </div>
              </div>

              {/* Debrief Banner Status */}
              <div className={`p-5 rounded-2xl border flex flex-col gap-1 items-center justify-center text-center ${
                isCurrentCorrect 
                  ? "bg-green-500/10 border-green-500/30" 
                  : "bg-rose-500/10 border-rose-500/30"
              }`}>
                <span className="text-[9px] tracking-[0.2em] font-mono text-slate-400 font-bold uppercase mb-1">YOUR ATTEMPT RECORD</span>
                {isCurrentCorrect ? (
                  <span className="text-xl font-display font-extrabold text-green-400 flex items-center gap-1.5 animate-success-pop">
                    🏆 +100 XP RECORDED
                  </span>
                ) : (
                  <span className="text-xl font-display font-extrabold text-rose-400 flex items-center gap-1.5">
                    🚫 NO SCORE ADDED
                  </span>
                )}
              </div>

              {/* Question Recap */}
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">The Question</span>
                <p className="text-white font-sans font-semibold text-base leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Correct Answer Badge */}
              <div className="bg-[#10141A] border border-white/5 p-4 rounded-xl space-y-1 text-left">
                <span className="text-[10px] font-mono uppercase tracking-widest text-green-400 font-bold">Correct Answer</span>
                <p className="text-white font-display font-extrabold text-lg">
                  {currentQuestion.correctAnswer}
                </p>
              </div>

              {/* In-Depth Explanation Column */}
              <div className="bg-green-500/5 border border-green-500/10 p-5 rounded-2xl space-y-2 text-left">
                <div className="flex items-center gap-1.5 text-green-400">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-display font-bold uppercase tracking-wider">Tactical Breakdown</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed font-sans">
                  {currentQuestion.explanation}
                </p>
              </div>

              {/* Actions */}
              <button
                onClick={handleNextQuestion}
                id="btn-next-question"
                className="w-full bg-white text-black font-display font-bold py-4 px-6 rounded-xl hover:bg-green-400 transition-colors flex items-center justify-center gap-2 active:scale-95 cursor-pointer text-base shadow-lg"
              >
                {currentIdx + 1 < QUIZ_QUESTIONS.length ? (
                  <>
                    NEXT QUESTION
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    FINISH AND VIEW TROPHY
                    <Trophy className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* 4. FINAL RESULTS SCREEN */}
          {phase === "results" && (
            <motion.div
              key="results-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/[0.03] border border-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
              id="results-card"
            >
              {/* Trigger confetti if they scored well (4 out of 6 correct or higher) */}
              {correctCount >= 4 && <Confetti />}

              <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/10 blur-[80px] rounded-full pointer-events-none"></div>

              {/* Icon Container */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className={`absolute inset-0 blur-2xl rounded-full ${correctCount >= 4 ? "bg-green-500/20" : "bg-rose-500/15"}`} />
                  <div className={`relative p-5 rounded-full border ${
                    correctCount >= 4 
                      ? "bg-white/[0.02] border-green-500/30 text-green-400" 
                      : "bg-white/[0.02] border-white/10 text-slate-400"
                  } animate-float`}>
                    <Trophy className="w-12 h-12" />
                  </div>
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-center text-2xl md:text-3xl font-display font-extrabold text-white mb-2">
                {correctCount === QUIZ_QUESTIONS.length 
                  ? "🏆 PERFECT MATCH!" 
                  : correctCount >= 4 
                    ? "✨ SPECTACULAR PLAY!" 
                    : "⚡ GAME OVER"}
              </h2>
              
              <p className="text-center text-slate-400 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
                {correctCount === QUIZ_QUESTIONS.length
                  ? "Flawless score! You are a world-class football historian."
                  : correctCount >= 4
                    ? "Fantastic performance! You cleared the group stage with flying colors."
                    : "Tough match. Hit the training grounds and attempt the challenge again."
                }
              </p>

              {/* Main Stat Block */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#10141A] border border-white/5 p-4 rounded-xl text-center">
                  <span className="text-[10px] tracking-widest font-mono text-slate-500 uppercase font-bold">TOTAL SCORE</span>
                  <div className="text-2xl font-display font-extrabold text-green-400 mt-1">{score} XP</div>
                </div>
                <div className="bg-[#10141A] border border-white/5 p-4 rounded-xl text-center">
                  <span className="text-[10px] tracking-widest font-mono text-slate-500 uppercase font-bold">ACCURACY</span>
                  <div className="text-2xl font-display font-extrabold text-white mt-1">
                    {Math.round((correctCount / QUIZ_QUESTIONS.length) * 100)}%
                  </div>
                </div>
              </div>

              {/* Breakdown Detail Rows */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-8 space-y-3 text-left">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-slate-400">CORRECT ANSWERS</span>
                  <span className="text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[2.5]" /> {correctCount} / 6
                  </span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-slate-400">INCORRECT ANSWERS</span>
                  <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <X className="w-3 h-3 stroke-[2.5]" /> {incorrectCount} / 6
                  </span>
                </div>
              </div>

              {/* ACCORDION REVIEW LIST */}
              <div className="space-y-3 mb-8 text-left">
                <h3 className="text-xs font-mono tracking-widest text-slate-400 font-bold uppercase mb-2">
                  🗒️ Match Summary Review
                </h3>
                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1" id="review-list">
                  {answersHistory.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-sans font-bold text-slate-300 pr-1">
                          {index + 1}. {item.question}
                        </span>
                        {item.isCorrect ? (
                          <span className="text-green-400 font-semibold uppercase flex items-center gap-0.5 shrink-0 bg-green-500/10 px-1.5 py-0.5 rounded-md border border-green-500/20 font-mono text-[9px]">
                            CORRECT
                          </span>
                        ) : (
                          <span className="text-rose-400 font-semibold uppercase flex items-center gap-0.5 shrink-0 bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-500/20 font-mono text-[9px]">
                            WRONG
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#10141A] p-2 rounded-xl font-mono">
                        <div>
                          <span className="text-slate-500">YOU ANSWERED:</span>
                          <p className={`font-bold font-sans mt-0.5 ${item.isCorrect ? "text-green-400" : "text-rose-400"}`}>
                            {item.userAnswer || "(Blank)"}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">CORRECT ANSWER:</span>
                          <p className="text-green-400 font-bold font-sans mt-0.5">
                            {item.correctAnswer}
                          </p>
                        </div>
                      </div>
                      <details className="group">
                        <summary className="text-[10px] text-green-500 font-medium font-mono hover:text-green-400 cursor-pointer list-none flex items-center gap-1 select-none">
                          <Info className="w-3 h-3 group-open:rotate-180 transition-transform" />
                          <span>{item.isCorrect ? "Read Context" : "See Why You Missed It"}</span>
                        </summary>
                        <p className="mt-2 text-[11px] leading-relaxed text-slate-400 font-sans border-t border-white/5 pt-2 pl-1">
                          {item.explanation}
                        </p>
                      </details>
                    </div>
                  ))}
                </div>
              </div>

              {/* Play Again Button */}
              <button
                onClick={handleStartQuiz}
                id="btn-play-again"
                className="w-full bg-white text-black font-display font-bold py-4 px-6 rounded-xl hover:bg-green-400 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                REPLAY QUIZ
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Outer Minimal footer elements strictly following "No tech-larping guidelines" */}
        <div className="text-center mt-6 text-slate-600 text-[10px] tracking-wide uppercase font-mono font-medium">
          ⚽ FOOTBALL RULES & TRIVIA ACCORDING TO IFAB REGULATIONS 🏆
        </div>

      </div>
    </main>
  );
}
