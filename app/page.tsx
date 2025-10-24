"use client";
import { useEffect, useState } from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, Coins, Award } from "lucide-react";
import Confetti from "react-confetti";
import { usePsychologyCoins, useActionStatus } from "@/hooks/usePsychologyCoins";

export default function Home() {
  const { 
    balance, 
    completeAction, 
    isLoading, 
    isConnected, 
    isCorrectNetwork, 
    switchToBaseSepolia, 
    isSwitching 
  } = usePsychologyCoins();

  const [step, setStep] = useState(0);
  const [tab, setTab] = useState("leccion");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);

  const onboardingScreens = [
    {
      title: "Construir tu MVP y escala tu salud mental",
      text:
        "En la construcción de una startup cada paso tiene un desafío emocional. Descubrí una guía, con lecciones, acciones y actividades para avanzar de manera saludable y eficiente.",
    },
    {
      title: "Progreso + Recompensas",
      text:
        "Completá los pasos, ganá monedas y desbloqueá logros. Cada avance es una inversión en vos mismo.",
    },
  ];

  const etapas = [
    {
      title: "Cómo construir un MVP",
      story:
        "Esta etapa explora el proceso de crear un producto mínimo viable, desde encontrar el problema real hasta medir el impacto. En paralelo, vas a trabajar los obstáculos emocionales que surgen en cada paso.",
      startup: {
        lesson:
          "Todo proyecto nace de un problema. Esta etapa busca identificar un dolor real, específico y urgente que vive tu usuario ideal. Cuanto más claro esté el problema, más efectiva será tu solución.",
        actions: [
          "Anotá una situación concreta que te hizo pensar: 'acá hay un problema'.",
          "Escribí quién lo sufre más y por qué.",
          "Redactá la pregunta que te gustaría hacerle a esa persona.",
        ],
        tool: "📄 Guía práctica para identificar problemas reales.",
      },
      mind: {
        lesson:
          "Ansiedad por elegir el problema correcto, miedo a equivocarte o perder tiempo. La presión por acertar rápido puede bloquearte. Este paso busca reconocer esa ansiedad sin que te frene.",
        actions: [
          "Anotá 3 momentos recientes en los que sentiste tensión emocional mientras trabajabas.",
          "Observá qué emoción se repite más (ansiedad, culpa, enojo, frustración...).",
          "Elegí una de esas emociones y escribí: ¿Qué situación la dispara? ¿Qué necesidad hay detrás?",
        ],
        tool: "🧠 Diario emocional para detectar patrones de ansiedad.",
      },
    },
  ];

  const etapa = etapas[step];

  // Check completion status for specific actions to determine coin rewards
  const startup0Status = useActionStatus(`startup-0`);
  const startup1Status = useActionStatus(`startup-1`);
  const startup2Status = useActionStatus(`startup-2`);
  
  const interna0Status = useActionStatus(`interna-0`);
  const interna1Status = useActionStatus(`interna-1`);
  const interna2Status = useActionStatus(`interna-2`);

  // Determine if user has completed any actions in each section before
  const hasCompletedStartupActions = startup0Status.hasCompleted || startup1Status.hasCompleted || startup2Status.hasCompleted;
  const hasCompletedMindActions = interna0Status.hasCompleted || interna1Status.hasCompleted || interna2Status.hasCompleted;

  type ColorKey = 'blue' | 'pink';
  
  const colorStyles: Record<ColorKey, {
    card: string;
    title: string;
    filled: string;
    border: string;
    check: string;
  }> = {
    blue: {
      card: "bg-blue-50 border-blue-200",
      title: "text-blue-700",
      filled: "bg-blue-100 border-blue-300 text-blue-700",
      border: "border-blue-200",
      check: "text-blue-600",
    },
    pink: {
      card: "bg-pink-50 border-pink-200",
      title: "text-pink-700",
      filled: "bg-pink-100 border-pink-300 text-pink-700",
      border: "border-pink-200",
      check: "text-pink-600",
    },
  };

  useEffect(() => {
    setCompleted({});
    setProgress(0);
    setShowBadge(false);
  }, [step]);

  useEffect(() => {
    const totalActions = etapa.startup.actions.length + etapa.mind.actions.length;
    const done = Object.keys(completed).filter((k) => completed[k]).length;
    setProgress(Math.min((done / totalActions) * 100, 100));
    setShowBadge(done === totalActions && totalActions > 0);
  }, [completed, etapa]);

  const toggleAction = async (key: string) => {
    if (isLoading) return;
    
    const isCurrentlyCompleted = completed[key];
    console.log(balance);

    const newCompleted = {
      ...completed,
      [key]: !completed[key]
    };
    setCompleted(newCompleted);
    
    const [sectionKey] = key.split('-'); 
    const sectionActions = etapa[sectionKey === 'startup' ? 'startup' : 'mind'].actions;
    
    const sectionCompletedCount = sectionActions.reduce((count, _, index) => {
      const actionKey = `${sectionKey}-${index}`;
      return count + (newCompleted[actionKey] ? 1 : 0);
    }, 0);
    
    const allSectionActionsCompleted = sectionCompletedCount === sectionActions.length;
    
    if (!isCurrentlyCompleted && allSectionActionsCompleted) {
      try {    
        await completeAction(key);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1200);
      } catch (error) {
        console.error('Error completing action:', error);
        setCompleted(completed);
      }
    }
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { setMiniAppReady, isMiniAppReady } = useMiniKit();

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  return (
    <div className="w-full min-h-screen mx-auto bg-white shadow-2xl overflow-hidden border border-gray-200 relative">
       <header className='flex flex-end p-4'>
         <Wallet />
       </header>

      {showConfetti && <Confetti numberOfPieces={180} recycle={false} width={390} height={844} />}

      {showOnboarding && (
        <div className="absolute inset-0 z-20 bg-white">
          <div className="flex flex-col h-full items-center justify-between p-6 text-center max-w-[600px] mx-auto">
            <div />
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {onboardingScreens[onboardingStep].title}
              </h2>
              <p className="text-gray-600 text-base">
                {onboardingScreens[onboardingStep].text}
              </p>
            </motion.div>
            <div className="w-full">
              <div className="flex items-center justify-center gap-2 mb-4">
                {onboardingScreens.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i === onboardingStep ? "bg-gray-900" : "bg-gray-300"}`}
                  />
                ))}
              </div>
              <div className="flex gap-3 justify-center">
                {onboardingStep === onboardingScreens.length - 1 ? (
                  <Button className="h-10 rounded-xl text-sm" onClick={() => setShowOnboarding(false)}>
                    Comenzar
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="h-10 rounded-xl text-sm" onClick={() => setShowOnboarding(false)}>
                      Omitir
                    </Button>
                    <Button className="h-10 rounded-xl text-sm" onClick={() => setOnboardingStep((s) => s + 1)}>
                      Siguiente →
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connection Required Screen */}
      {!showOnboarding && !isConnected && (
        <div className="absolute inset-0 z-20 bg-white">
          <div className="flex flex-col h-full items-center justify-center p-6 text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-pink-500 rounded-full flex items-center justify-center mb-6 mx-auto">
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Conectá tu Wallet
              </h2>
              <p className="text-gray-600 text-base max-w-sm mb-8">
                Para empezar Psychology for Founders y guardar tu progreso, necesitás conectar tu wallet primero.
              </p>
              <div className="w-full max-w-sm flex justify-center">
                <Wallet />
              </div>
              <button 
                onClick={() => setShowOnboarding(true)}
                className="mt-6 text-sm text-gray-500 underline"
              >
                ← Volver al tutorial
              </button>
            </motion.div>
          </div>
        </div>
      )}

      {/* Network Switch Required Screen */}
      {!showOnboarding && isConnected && !isCorrectNetwork && (
        <div className="absolute inset-0 z-20 bg-white">
          <div className="flex flex-col h-full items-center justify-center p-6 text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-pink-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Cambiar a Base Sepolia
              </h2>
              <p className="text-gray-600 text-base max-w-sm mb-8">
                Para usar Psychology for Founders, necesitás cambiar tu wallet a la red Base Sepolia donde están los contratos.
              </p>
              <Button 
                onClick={switchToBaseSepolia}
                disabled={isSwitching}
                className="w-full max-w-sm bg-linear-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600"
              >
                {isSwitching ? "Cambiando red..." : "Cambiar a Base Sepolia"}
              </Button>
              <button 
                onClick={() => setShowOnboarding(true)}
                className="mt-6 text-sm text-gray-500 underline"
              >
                ← Volver al tutorial
              </button>
            </motion.div>
          </div>
        </div>
      )}

      {/* Main App Content - Only show when onboarding is done AND wallet is connected AND correct network */}
      {!showOnboarding && isConnected && isCorrectNetwork && (
        <>
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100  md:w-[80%] md:mx-auto">
            <div className="px-4 md:px-8 py-3 md:py-10 ">
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 mt-6">
                Etapa {step + 1}: {etapa.title}
              </h1>
              <p className="text-gray-500 text-xs md:text-md leading-relaxed max-h-20 overflow-hidden mt-4">
                {etapa.story}
              </p>
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-2 bg-linear-to-r from-blue-500 to-pink-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] md:text-[15px] text-gray-500">
                  {Math.round(progress)}% — {Object.values(completed).filter(Boolean).length}/
                  {etapa.startup.actions.length + etapa.mind.actions.length} acciones
                </span>
                <span className="text-[12px] text-amber-500 font-semibold flex items-center gap-1">
                  <Coins className="w-4 h-4" /> {parseFloat(balance).toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          <div className="h-[calc(844px-148px)] md:h-auto overflow-y-auto  md:w-[80%] md:mx-auto">
            <div className="px-4 pt-4 md:mt-8">
              <Tabs value={tab} onValueChange={(v) => setTab(v)} className="w-full">
                <TabsList className="grid grid-cols-3 h-9 md:h-12 mx-auto">
                  <TabsTrigger value="leccion" className="text-xs md:text-sm">Lección</TabsTrigger>
                  <TabsTrigger value="accion" className="text-xs md:text-sm">Acción</TabsTrigger>
                  <TabsTrigger value="herramienta" className="text-xs md:text-sm">Herramienta</TabsTrigger>
                </TabsList>

                <TabsContent value="leccion" className="mt-3 md:mt-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <motion.div className="bg-blue-50 border border-blue-200 rounded-xl p-4" whileHover={{ scale: 1.01 }}>
                      <h2 className="text-blue-700 font-semibold text-sm mb-1">🚀 Versión Startup</h2>
                      <p className="text-gray-700 text-sm leading-relaxed">{etapa.startup.lesson}</p>
                    </motion.div>
                    <motion.div className="bg-pink-50 border border-pink-200 rounded-xl p-4" whileHover={{ scale: 1.01 }}>
                      <h2 className="text-pink-700 font-semibold text-sm mb-1">💥 Obstáculo emocional</h2>
                      <p className="text-gray-700 text-sm leading-relaxed">{etapa.mind.lesson}</p>
                    </motion.div>
                  </div>
                </TabsContent>

                <TabsContent value="accion" className="mt-3 md:mt-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { color: "blue" as ColorKey, key: "startup", data: etapa.startup },
                      { color: "pink" as ColorKey, key: "interna", data: etapa.mind },
                    ].map((block, i) => {
                      const styles = colorStyles[block.color];
                      
                      // Determine coin reward: 5 for first time, 1 for repeat
                      const coinReward = block.key === "startup" 
                        ? (hasCompletedStartupActions ? 1 : 5)
                        : (hasCompletedMindActions ? 1 : 5);
                      
                      return (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.005 }}
                          className={`rounded-xl p-4 border ${styles.card}`}
                        >
                          <h2 className={`${styles.title} font-semibold text-sm md:text-xl mb-2`}>
                            {block.key === "startup" ? "🚀 Versión Startup" : "🧠 Versión Interna"}
                          </h2>
                          <ul className="space-y-2">
                            {block.data.actions.map((act, j) => {
                              const k = `${block.key}-${j}`;
                              const isDone = !!completed[k];
                              return (
                                <motion.button
                                  whileTap={{ scale: 0.98 }}
                                  key={k}
                                  onClick={() => toggleAction(k)}
                                  disabled={isLoading}
                                  className={`flex items-center justify-between w-full px-3 py-2 border rounded-lg transition ${
                                    isDone ? styles.filled : styles.border
                                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <span className="text-[13px] md:text-[16px] text-left pr-2">{act}</span>
                                  {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin shrink-0" />
                                  ) : (
                                    isDone && <CheckCircle2 className={`w-4 h-4 shrink-0 ${styles.check}`} />
                                  )}
                                </motion.button>
                              );
                            })}
                          </ul>
                          <p className="text-[11px] md:text-[15px] text-gray-500 mt-2 text-center">
                            Completá las acciones y ganá {coinReward} 🪙
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="herramienta" className="mt-3 md:mt-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:w-[80%] md:mx-auto">
                    <motion.div whileHover={{ scale: 1.01 }} className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                      <h2 className="text-blue-700 font-semibold text-sm md:text-[16px] mb-2">🚀 Versión Startup</h2>
                      <p className="text-gray-700 text-sm md:text-[16px] mb-3">{etapa.startup.tool}</p>
                      <Button variant="outline" className="h-9 text-sm md:text-[16px]" onClick={() => handleDownload("guia-problemas.md", etapa.startup.tool)}>
                        Descargar
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.01 }} className="bg-pink-50 border border-pink-200 rounded-xl p-4 text-center">
                      <h2 className="text-pink-700 font-semibold text-sm md:text-[16px] mb-2">🧠 Versión Interna</h2>
                      <p className="text-gray-700 text-sm md:text-[16px] mb-3">{etapa.mind.tool}</p>
                      <Button variant="outline" className="h-9 text-sm md:text-[16px]" onClick={() => handleDownload("diario-emocional.md", etapa.mind.tool)}>
                        Descargar
                      </Button>
                    </motion.div>
                  </div>
                </TabsContent>
              </Tabs>

              {showBadge && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mt-3 flex items-center justify-center">
                  <div className="flex items-center bg-yellow-100 border border-yellow-300 px-4 py-2 rounded-full shadow">
                    <Award className="text-yellow-600 w-4 h-4 mr-2" />
                    <span className="text-yellow-700 text-sm font-semibold">¡Logro desbloqueado!</span>
                  </div>
                </motion.div>
              )}

              <div className="h-24" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 p-3 flex items-center justify-between">
            <Button variant="outline" className="h-10 rounded-xl text-sm" onClick={() => setStep(0)}>
              Reiniciar
            </Button>
            <Button className="h-10 rounded-xl text-sm" onClick={() => setShowOnboarding(true)}>
              Finalizar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
