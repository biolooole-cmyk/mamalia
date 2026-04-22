/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TreePine, 
  ChevronRight, 
  Activity, 
  Users, 
  Coins, 
  Map as MapIcon,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Trophy,
  Leaf,
  Info
} from 'lucide-react';
import { LEVELS, Choice } from './data';

interface GameState {
  currentLevel: number;
  currentTaskIndex: number;
  biodiversity: number;
  economy: number;
  publicSupport: number;
  history: { level: number; taskId: string; choice?: Choice }[];
  isFinished: boolean;
  isStarted: boolean;
}

export default function App() {
  const [state, setState] = useState<GameState>({
    currentLevel: 0,
    currentTaskIndex: 0,
    biodiversity: 50,
    economy: 50,
    publicSupport: 50,
    history: [],
    isFinished: false,
    isStarted: false
  });

  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [calcValue, setCalcValue] = useState<string>('');
  const [reflectionValue, setReflectionValue] = useState<string>('');
  const [isCorrectCalc, setIsCorrectCalc] = useState<boolean | null>(null);

  const currentLevelData = useMemo(() => LEVELS[state.currentLevel], [state.currentLevel]);
  const currentTask = useMemo(() => currentLevelData.tasks[state.currentTaskIndex], [currentLevelData, state.currentTaskIndex]);

  const handleStart = () => {
    setState(prev => ({ ...prev, isStarted: true }));
  };

  const handleChoice = (choice: Choice) => {
    setSelectedChoice(choice);
    setShowFeedback(true);
  };

  const handleCalcSubmit = () => {
    const isCorrect = Number(calcValue) === currentTask.calculationAnswer;
    setIsCorrectCalc(isCorrect);
    setShowFeedback(true);
  };

  const handleReflectionSubmit = () => {
    setShowFeedback(true);
  };

  const nextStep = () => {
    const isChoice = currentTask.type !== 'calculation' && currentTask.type !== 'reflection';
    
    let newBio = state.biodiversity;
    let newEco = state.economy;
    let newPub = state.publicSupport;

    if (isChoice && selectedChoice) {
      newBio = Math.max(0, Math.min(100, state.biodiversity + selectedChoice.impact.biodiversity));
      newEco = Math.max(0, Math.min(100, state.economy + selectedChoice.impact.economy));
      newPub = Math.max(0, Math.min(100, state.publicSupport + selectedChoice.impact.publicSupport));
    } else if (currentTask.type === 'calculation' && isCorrectCalc) {
      newBio += 5;
      newEco += 5;
    }

    const isNextTask = state.currentTaskIndex + 1 < currentLevelData.tasks.length;
    const isNextLevel = state.currentLevel + 1 < LEVELS.length;

    if (isNextTask) {
      setState(prev => ({
        ...prev,
        biodiversity: newBio,
        economy: newEco,
        publicSupport: newPub,
        currentTaskIndex: prev.currentTaskIndex + 1
      }));
    } else if (isNextLevel) {
      setState(prev => ({
        ...prev,
        biodiversity: newBio,
        economy: newEco,
        publicSupport: newPub,
        currentLevel: prev.currentLevel + 1,
        currentTaskIndex: 0
      }));
    } else {
      setState(prev => ({
        ...prev,
        biodiversity: newBio,
        economy: newEco,
        publicSupport: newPub,
        isFinished: true
      }));
    }

    // Reset task-specific state
    setSelectedChoice(null);
    setShowFeedback(false);
    setCalcValue('');
    setReflectionValue('');
    setIsCorrectCalc(null);
  };

  const resetGame = () => {
    setState({
      currentLevel: 0,
      currentTaskIndex: 0,
      biodiversity: 50,
      economy: 50,
      publicSupport: 50,
      history: [],
      isFinished: false,
      isStarted: false
    });
  };

  const getEndingMessage = () => {
    const total = state.biodiversity + state.publicSupport + state.economy;
    if (state.biodiversity > 70 && state.publicSupport > 60) {
      return {
        title: "Золотий еколог",
        text: "Вам вдалося неможливе: зберегти дику природу та отримати підтримку людей. Ви справжній Майстер Балансу!",
        icon: <Trophy className="w-16 h-16 text-yellow-500" />
      };
    }
    if (state.biodiversity < 30) {
      return {
        title: "Екологічна катастрофа",
        text: "Природа програла. Ссавці зникають, а екосистема руйнується. Економічні вигоди виявилися тимчасовими.",
        icon: <AlertTriangle className="w-16 h-16 text-red-500" />
      };
    }
    return {
      title: "Адміністратор компромісів",
      text: "Ви втримали систему від краху, хоча ідеальним цей результат не назвеш. Природа потребує більшої уваги.",
      icon: <Activity className="w-16 h-16 text-blue-500" />
    };
  };

  const typeLabels: Record<TaskType, string> = {
    case: 'Ситуаційний кейс',
    analysis: 'Екологічний аналіз',
    modeling: 'Прогностичне моделювання',
    logic: 'Логічна задача',
    calculation: 'Розрахунок',
    reflection: 'Рефлексія'
  };

  if (!state.isStarted) {
    return (
      <div className="min-h-screen bg-[#f7f8f3] flex items-center justify-center p-4 font-sans text-[#2c3e50]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-white rounded-3xl shadow-md p-8 border border-[#e2e8d5]"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-[#8ba88e] rounded-2xl">
              <TreePine className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-center text-[#4a5d4e] mb-4 tracking-tight">БіоСфера 2.0</h1>
          <p className="text-xl text-center text-[#5a6a5d] font-medium mb-8 italic">Розширена симуляція: 30 завдань</p>
          
          <div className="space-y-4 mb-8">
            <div className="flex gap-4 p-4 bg-[#fefae0] rounded-xl items-start border border-[#e2e8d5]">
              <div className="mt-1"><ShieldCheck className="w-5 h-5 text-[#bc6c25]" /></div>
              <div>
                <h3 className="font-semibold text-[#4a5d4e]">Складні рівні</h3>
                <p className="text-sm text-[#5a6a5d]">Кожен рівень тепер містить мінімум 5 різнопланових завдань: від розрахунків до етики.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleStart}
            className="w-full bg-[#4a5d4e] hover:bg-[#3a4d3e] text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group"
          >
            Розпочати місію
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    );
  }

  if (state.isFinished) {
    const ending = getEndingMessage();
    return (
      <div className="min-h-screen bg-[#f7f8f3] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-3xl w-full bg-white rounded-3xl shadow-lg p-10 text-center border border-[#e2e8d5]"
        >
          <div className="flex justify-center mb-6">{ending.icon}</div>
          <h2 className="text-3xl font-bold text-[#4a5d4e] mb-2">{ending.title}</h2>
          <p className="text-[#5a6a5d] mb-8 max-w-lg mx-auto italic">{ending.text}</p>

          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="p-4 bg-[#e9edc9] rounded-2xl border border-[#e2e8d5]">
              <Leaf className="w-6 h-6 text-[#4a5d4e] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#4a5d4e]">{state.biodiversity}%</div>
              <div className="text-[10px] uppercase tracking-wider text-[#5a6a5d] font-bold">Біорізноманіття</div>
            </div>
            <div className="p-4 bg-[#fefae0] rounded-2xl border border-[#e2e8d5]">
              <Coins className="w-6 h-6 text-[#bc6c25] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#bc6c25]">{state.economy}%</div>
              <div className="text-[10px] uppercase tracking-wider text-[#5a6a5d] font-bold">Економіка</div>
            </div>
            <div className="p-4 bg-[#ccd5ae] rounded-2xl border border-[#e2e8d5]">
              <Users className="w-6 h-6 text-[#4a5d4e] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#4a5d4e]">{state.publicSupport}%</div>
              <div className="text-[10px] uppercase tracking-wider text-[#5a6a5d] font-bold">Підтримка</div>
            </div>
          </div>

          <button 
            onClick={resetGame}
            className="inline-flex items-center gap-2 text-[#4a5d4e] hover:text-[#bc6c25] font-bold py-2 border-b-2 border-[#e2e8d5] transition-all hover:border-[#bc6c25]"
          >
            <RotateCcw className="w-4 h-4" /> Спробувати ще раз
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8f3] flex flex-col items-center">
      {/* Header Dashboard */}
      <header className="w-full bg-[#4a5d4e] text-white p-4 flex flex-wrap items-center justify-between shadow-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-[#8ba88e] p-2 rounded-lg">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">БіоСфера: Симуляція</h1>
          </div>
        </div>

        <nav className="hidden lg:flex gap-1 items-center">
          {LEVELS.map((level, idx) => (
            <div 
              key={idx}
              className={`px-3 py-1 rounded text-[10px] font-bold transition-all flex flex-col items-center ${
                idx === state.currentLevel 
                  ? "bg-white text-[#4a5d4e]" 
                  : idx < state.currentLevel
                    ? "bg-white/40 text-white"
                    : "bg-white/10 text-white opacity-50"
              }`}
            >
              <span>Рівень {idx + 1}</span>
              {idx === state.currentLevel && (
                <div className="flex gap-0.5 mt-1">
                  {level.tasks.map((_, tIdx) => (
                    <div 
                      key={tIdx} 
                      className={`w-1.5 h-1.5 rounded-full ${tIdx <= state.currentTaskIndex ? 'bg-[#4a5d4e]' : 'bg-gray-300'}`} 
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ResourceItem 
            icon={<Leaf className="w-4 h-4" />} 
            label="Природа" 
            value={state.biodiversity} 
            color="green" 
          />
          <ResourceItem 
            icon={<Coins className="w-4 h-4" />} 
            label="Ресурси" 
            value={state.economy} 
            color="brown" 
          />
          <ResourceItem 
            icon={<Users className="w-4 h-4" />} 
            label="Громада" 
            value={state.publicSupport} 
            color="tan" 
          />
        </div>
      </header>

      {/* Main Content */}
      <main id="simulation-viewport" className="w-full max-w-5xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">
        <aside className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8d5]">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[#e9edc9] text-[#4a5d4e] px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                {currentLevelData.subtitle}
              </span>
            </div>
            <h2 className="text-xl font-bold mb-3 leading-tight text-[#4a5d4e]">
              {currentLevelData.title}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="text-xs font-bold text-[#8c7851] uppercase">Прогрес рівня:</div>
                 <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4a5d4e]" style={{ width: `${((state.currentTaskIndex + 1) / currentLevelData.tasks.length) * 100}%` }}></div>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-[#fefae0] rounded-2xl p-6 shadow-sm border border-[#e2e8d5]">
             <h4 className="text-[10px] font-bold text-[#8c7851] uppercase mb-4 tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Ваш екологічний шлях
             </h4>
             <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[#5a6a5d]">Виконано завдань:</span>
                  <span className="font-bold text-[#4a5d4e]">{state.currentLevel * 5 + state.currentTaskIndex} / 25</span>
                </div>
             </div>
          </div>
        </aside>

        <section className="md:col-span-8 flex flex-col gap-6">
          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-[#e2e8d5] p-8 md:p-10 flex flex-col min-h-[450px]">
            <div className="flex justify-between items-center mb-6">
              <div className="bg-[#4a5d4e] text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase">
                {typeLabels[currentTask.type]}
              </div>
              <div className="text-[#8c7851] font-mono text-xs">
                TASK_ID: {currentTask.id}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-[#2c3e50] mb-8 leading-snug">
               {currentTask.question}
            </h3>

            <div className="flex-1">
              {currentTask.type === 'calculation' ? (
                <div className="space-y-6">
                  <p className="text-sm text-[#5a6a5d] italic">Введіть числову відповідь для перевірки розрахунків.</p>
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      value={calcValue}
                      onChange={(e) => setCalcValue(e.target.value)}
                      placeholder="Ваш результат..."
                      className="bg-[#fefae0] border-2 border-[#e2e8d5] rounded-xl p-4 text-lg font-bold w-full max-w-[200px] outline-none focus:border-[#4a5d4e]"
                    />
                    <span className="font-bold text-[#8c7851]">{currentTask.unit}</span>
                  </div>
                  <button 
                    onClick={handleCalcSubmit}
                    disabled={!calcValue}
                    className="bg-[#4a5d4e] text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-[#3a4d3e] transition-all"
                  >
                    Перевірити
                  </button>
                </div>
              ) : currentTask.type === 'reflection' ? (
                <div className="space-y-6">
                   <p className="text-sm text-[#5a6a5d] italic">Це відкрите запитання. Спробуйте сформулювати аргумент, а потім порівняйте з експертною логікою.</p>
                   <textarea 
                     value={reflectionValue}
                     onChange={(e) => setReflectionValue(e.target.value)}
                     placeholder="Ваша думка..."
                     className="bg-[#fefae0] border-2 border-[#e2e8d5] rounded-xl p-4 w-full h-32 outline-none focus:border-[#4a5d4e]"
                   />
                   <button 
                    onClick={handleReflectionSubmit}
                    disabled={!reflectionValue}
                    className="bg-[#bc6c25] text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-[#a35d1d] transition-all"
                   >
                     Переглянути аналіз
                   </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {currentTask.choices?.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleChoice(choice)}
                      className="w-full text-left p-5 bg-[#fefae0] border-2 border-[#e2e8d5] hover:border-[#4a5d4e] hover:bg-white rounded-2xl transition-all group flex items-start justify-between gap-4 shadow-sm"
                    >
                      <span className="text-[#2c3e50] font-bold group-hover:text-[#4a5d4e]">{choice.text}</span>
                      <ChevronRight className="w-5 h-5 text-[#d4a373] group-hover:text-[#4a5d4e] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Feedback Modal Overlay */}
      <AnimatePresence>
        {showFeedback && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-3xl shadow-2xl z-50 p-8 border-4 border-[#4a5d4e]"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-[10px] font-bold text-[#8c7851] uppercase tracking-widest mb-1">Аналіз кроку</h3>
                  <p className="text-xl font-bold text-[#4a5d4e] leading-snug">
                     {currentTask.type === 'calculation' 
                       ? (isCorrectCalc ? 'Розрахунок вірний!' : 'Розрахунок потребує перевірки')
                       : currentTask.type === 'reflection' 
                         ? 'Експертний аналіз'
                         : 'Наслідки вибору'}
                  </p>
                </div>
                <div className={`p-3 rounded-2xl ${isCorrectCalc === false ? 'bg-red-50 text-red-600' : 'bg-[#e9edc9] text-[#4a5d4e]'}`}>
                  {(currentTask.type === 'calculation' && isCorrectCalc) || currentTask.type !== 'calculation' ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
              </div>

              <div className="p-6 bg-[#fefae0] rounded-2xl mb-8 border border-[#e2e8d5]">
                <h4 className="font-bold text-[#2c3e50] mb-3 flex items-center gap-2 uppercase text-xs">
                  <Leaf className="w-4 h-4 text-[#4a5d4e]" /> Біологічне обґрунтування:
                </h4>
                <p className="text-[#5a6a5d] leading-relaxed italic text-sm">
                  {currentTask.type === 'calculation' || currentTask.type === 'reflection' 
                    ? currentTask.correctLogic 
                    : selectedChoice?.feedback}
                </p>
              </div>

              {selectedChoice && (
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <ImpactStat label="Природа" val={selectedChoice.impact.biodiversity} color="green" />
                  <ImpactStat label="Бюджет" val={selectedChoice.impact.economy} color="brown" />
                  <ImpactStat label="Громада" val={selectedChoice.impact.publicSupport} color="tan" />
                </div>
              )}

              <button 
                onClick={nextStep}
                className="w-full bg-[#4a5d4e] hover:bg-[#3a4d3e] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                ПЕРЕЙТИ ДАЛІ <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="w-full bg-[#fefae0] px-6 py-2 border-t border-[#e2e8d5] flex justify-between items-center text-[11px] text-[#8c7851] font-bold uppercase mt-auto fixed bottom-0">
        <span>Статус: {state.isFinished ? 'Місію завершено' : 'Виконуються польові дослідження...'}</span>
        <span className="opacity-60">{state.currentLevel + 1}/{LEVELS.length} Рівень | Завдання {state.currentTaskIndex + 1}/5</span>
        <span>БіоСфера v2.0 - Масштабний проект</span>
      </footer>
    </div>
  );
}

function ResourceItem({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: 'green' | 'brown' | 'tan' }) {
  const colorMap = {
    green: 'text-white bg-white/20',
    brown: 'text-[#d4a373] bg-white/20',
    tan: 'text-white bg-white/20'
  };

  const barMap = {
    green: 'bg-[#8ba88e]',
    brown: 'bg-[#bc6c25]',
    tan: 'bg-[#d4a373]'
  };

  return (
    <div className={`hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg border border-white/20 ${colorMap[color]}`}>
      <div className="opacity-70">{icon}</div>
      <div className="w-20">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-[9px] font-bold uppercase tracking-tight opacity-70">{label}</span>
          <span className="text-[10px] font-bold">{value}%</span>
        </div>
        <div className="h-1 w-full bg-black/20 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            className={`h-full ${barMap[color]}`}
          />
        </div>
      </div>
    </div>
  );
}

function ImpactStat({ label, val, color }: { label: string, val: number, color: 'green' | 'brown' | 'tan' }) {
  const colorMap = {
    green: 'text-[#4a5d4e] bg-[#e9edc9]',
    brown: 'text-[#bc6c25] bg-[#fefae0]',
    tan: 'text-[#8c7851] bg-[#ccd5ae]'
  };
  
  return (
    <div className={`${colorMap[color]} p-2 rounded-xl text-center border border-[#e2e8d5]`}>
      <div className="text-[9px] font-bold uppercase opacity-60 tracking-tighter">{label}</div>
      <div className="font-bold text-sm">{val > 0 ? `+${val}` : val}</div>
    </div>
  );
}
