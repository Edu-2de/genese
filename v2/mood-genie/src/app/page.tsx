"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, X, AlertCircle } from "lucide-react";

type Badge = {
  id: string;
  emocao: string;
  emoji: string;
  x: number;
  y: number;
  cor: string;
};
type AuraData = {
  cores: string[];
  velocidade: number;
  caos: boolean;
  emocao: string;
  frase?: string;
};

// ==========================================
// COMPONENTE: ESFERA 3D PREMIUM
// ==========================================
function EsferaMaterializada({ data }: { data: AuraData }) {
  const cores =
    data.cores?.length === 4
      ? data.cores
      : ["#0a0a0c", "#121215", "#0a0a0c", "#18181c"];
  const velocidade = data.velocidade || 5;
  const duracao = Math.max(3, 15 - velocidade);

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full blur-[80px] opacity-40 mix-blend-screen"
        animate={{ scale: data.caos ? [1, 1.2, 1] : [1, 1.05, 1] }}
        transition={{ duration: duracao, repeat: Infinity, ease: "easeInOut" }}
        style={{ backgroundColor: cores[0] }}
      />

      <div className="relative w-full h-full rounded-full overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_-20px_40px_rgba(0,0,0,0.9)] bg-black">
        <motion.div
          className="absolute -inset-[50%] opacity-80 blur-2xl"
          animate={{ rotate: 360 }}
          transition={{
            duration: duracao * 2,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            background: `conic-gradient(from 0deg, ${cores[0]}, ${cores[1]}, ${cores[2]}, ${cores[3]}, ${cores[0]})`,
          }}
        />
        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] pointer-events-none" />
        <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute top-[2%] left-[10%] w-[80%] h-[40%] rounded-[100%] bg-linear-to-b from-white/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================
export default function Home() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [input, setInput] = useState("");
  const [processando, setProcessando] = useState(false);
  const [materializado, setMaterializado] = useState<AuraData | null>(null);
  const [carregando, setCarregando] = useState(false);

  // Novo estado para gerenciar mensagens de erro de validação
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty("--mouse-x", `${x}%`);
      document.documentElement.style.setProperty("--mouse-y", `${y}%`);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  function lidarComDigitacao(e: React.ChangeEvent<HTMLInputElement>) {
    // Sempre que o usuário digita, limpamos o erro para não atrapalhar a visão
    if (erroValidacao) setErroValidacao(null);
    if (!e.target.value.includes(" ")) setInput(e.target.value.toLowerCase());
  }

  async function conjurarEmocao(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || processando) return;

    setProcessando(true);
    setErroValidacao(null); // Resetar erro ao iniciar nova busca
    const palavra = input;
    setInput("");

    try {
      const res = await fetch("/api/genio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "VALIDAR_EMOCAO", palavra }),
      });

      const dados = await res.json();

      if (dados.valido) {
        setBadges((p) => [
          ...p,
          {
            id: Math.random().toString(),
            emocao: dados.emocao,
            emoji: dados.emoji,
            cor: dados.cor,
            x: window.innerWidth / 2,
            y: window.innerHeight - 150,
          },
        ]);
      } else {
        // Se a API retornar que não é uma emoção, ativamos o feedback visual
        setErroValidacao(`"${palavra}" não parece ser uma essência emocional.`);

        // Timer opcional para sumir com o erro sozinho
        setTimeout(() => setErroValidacao(null), 4000);
      }
    } catch (e) {
      console.error(e);
      setErroValidacao("Ocorreu um erro na conexão com o gênio.");
    } finally {
      setProcessando(false);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function lidarComDrag(info: any, b: Badge) {
    const { x, y } = info.point;
    const centro = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const distCentro = Math.sqrt(
      Math.pow(x - centro.x, 2) + Math.pow(y - centro.y, 2),
    );

    if (distCentro < 140) {
      setCarregando(true);
      setBadges((p) => p.filter((item) => item.id !== b.id));
      try {
        const res = await fetch("/api/genio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ acao: "MATERIALIZAR", emocao: b.emocao }),
        });
        const dna = await res.json();
        setMaterializado(dna);
      } catch (e) {
        console.error(e);
      } finally {
        setCarregando(false);
      }
      return;
    }

    let houveFusao = false;
    for (const outro of badges.filter((item) => item.id !== b.id)) {
      const dist = Math.sqrt(
        Math.pow(x - outro.x, 2) + Math.pow(y - outro.y, 2),
      );
      if (dist < 80) {
        houveFusao = true;
        setProcessando(true);
        setBadges((p) =>
          p.filter((item) => item.id !== b.id && item.id !== outro.id),
        );
        try {
          const res = await fetch("/api/genio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              acao: "FUNDIR_EMOCOES",
              emocao1: b.emocao,
              emocao2: outro.emocao,
            }),
          });
          const d = await res.json();
          setBadges((p) => [
            ...p,
            {
              id: Math.random().toString(),
              emocao: d.emocao,
              emoji: d.emoji,
              cor: d.cor,
              x,
              y,
            },
          ]);
        } catch (e) {
          console.error(e);
        } finally {
          setProcessando(false);
        }
        break;
      }
    }

    if (!houveFusao)
      setBadges((p) =>
        p.map((item) => (item.id === b.id ? { ...item, x, y } : item)),
      );
  }

  return (
    <main className="w-screen h-screen overflow-hidden font-sans relative flex items-center justify-center bg-[#050505] selection:bg-white/20">
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-colors duration-1000"
        style={{
          backgroundImage: `radial-gradient(circle 60vw at var(--mouse-x, 50%) var(--mouse-y, 50%), ${materializado ? materializado.cores[0] + "15" : "#ffffff05"} 0%, transparent 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ÁREA CENTRAL */}
      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {!materializado || carregando ? (
            <motion.div
              key="idle"
              exit={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
              className="flex flex-col items-center pointer-events-auto"
            >
              <div className="relative w-48 h-48 rounded-full border border-white/5 bg-white/1 flex items-center justify-center shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] transition-all duration-700">
                <div className="absolute inset-0 rounded-full border border-white/10 opacity-10 animate-[spin_10s_linear_infinite] border-dashed" />
                {carregando && (
                  <Loader2
                    className="animate-spin text-white/30"
                    strokeWidth={1}
                    size={32}
                  />
                )}
              </div>
              <span className="mt-8 text-[9px] tracking-[0.5em] text-white/30 uppercase font-medium">
                Sintetizador
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="aura"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center pointer-events-auto"
            >
              <EsferaMaterializada data={materializado} />
              <div className="mt-8 flex flex-col items-center gap-4">
                <h1 className="text-[13px] md:text-sm font-bold tracking-[0.6em] text-white/90 uppercase drop-shadow-md ml-[0.6em]">
                  {materializado.emocao}
                </h1>
                {materializado.frase && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="mt-6 max-w-70 text-center text-sm font-medium text-white/50 italic leading-relaxed"
                  >
                    &quot;{materializado.frase}&quot;
                  </motion.p>
                )}
                <button
                  onClick={() => setMaterializado(null)}
                  className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BADGES REATIVOS */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        <AnimatePresence>
          {badges.map((b) => (
            <motion.div
              key={b.id}
              drag
              dragMomentum={false}
              onDragEnd={(e, info) => lidarComDrag(info, b)}
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                x: b.x - 70,
                y: [b.y - 25, b.y - 32, b.y - 25],
              }}
              transition={{
                y: {
                  duration: 4 + Math.random(),
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              whileDrag={{ scale: 1.05, cursor: "grabbing" }}
              className="absolute pointer-events-auto px-5 py-3 rounded-full bg-[#0a0a0c]/80 border border-white/5 backdrop-blur-xl flex items-center gap-3 shadow-2xl cursor-grab will-change-transform"
            >
              <div
                className="w-2.5 h-2.5 rounded-full shadow-inner"
                style={{ backgroundColor: b.cor }}
              />
              <span className="text-xs font-medium tracking-widest text-white/80 uppercase">
                {b.emocao}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* INPUT DOCK E MENSAGENS DE ERRO */}
      <div className="absolute bottom-12 z-50 w-full max-w-85 px-4 flex flex-col items-center gap-4">
        {/* MENSAGEM DE ERRO COM FRAMER MOTION */}
        <AnimatePresence>
          {erroValidacao && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 backdrop-blur-md"
            >
              <AlertCircle size={14} className="text-red-400" />
              <span className="text-[10px] text-red-200/80 font-medium tracking-wider uppercase">
                {erroValidacao}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          onSubmit={conjurarEmocao}
          animate={{
            opacity: materializado ? 0.2 : 1,
            y: materializado ? 10 : 0,
          }}
          whileHover={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="bg-[#0a0a0c]/60 backdrop-blur-3xl border border-white/5 rounded-full px-6 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.8)] flex items-center focus-within:border-white/20 transition-all">
            <input
              type="text"
              value={input}
              onChange={lidarComDigitacao}
              disabled={processando}
              placeholder="Sintetizar essência..."
              className="flex-1 bg-transparent outline-none text-xs font-medium text-white/90 placeholder:text-white/30 tracking-widest uppercase"
            />
            {processando ? (
              <Loader2 size={16} className="animate-spin text-white/40" />
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="text-white/40 hover:text-white transition-colors disabled:opacity-30"
              >
                <Plus size={18} strokeWidth={2} />
              </button>
            )}
          </div>
        </motion.form>
      </div>
    </main>
  );
}
