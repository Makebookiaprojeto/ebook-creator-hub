import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Imagens (serão enviadas e substituídas pelo usuário em breve)
import dashImg from "@/assets/preview-dashboard.jpg";
import step1Img from "@/assets/preview-step1.png";
import step2Img from "@/assets/preview-step2.png";
import step3Img from "@/assets/preview-step3.png";
import step4Img from "@/assets/preview-step4.png";
import step5Img from "@/assets/preview-step5.png";
import step5_1Img from "@/assets/preview-step5-1.png";

const slides = [
  { id: "dashboard", img: dashImg, alt: "Dashboard de Vendas" },
  { id: "step1", img: step1Img, alt: "Passo 1 - Escolha do Nicho" },
  { id: "step2", img: step2Img, alt: "Passo 2 - Definição de Preço" },
  { id: "step3", img: step3Img, alt: "Passo 3 - Criação do Ebook" },
  { id: "step4", img: step4Img, alt: "Passo 4 - Página de Vendas" },
  { id: "step5", img: step5Img, alt: "Passo 5 - Divulgação e Grupos" },
  { id: "step5-1", img: step5_1Img, alt: "Passo 5 - Vídeos Prontos" },
];

export function PreviewCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 1700); // 1.7 seconds per slide

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-4xl flex flex-col items-center gap-6">
      {/* Container Principal do Card animado */}
      <div className="relative w-full rounded-2xl overflow-hidden p-[2px] aspect-[16/10] sm:aspect-[16/10]">
        {/* Luz dourada girando (borda animada) */}
        <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_270deg,#facc15_360deg)] opacity-90" />
        
        {/* Container interno bloqueando o meio */}
        <div className="relative w-full h-full bg-[#0A0A0B] rounded-[14px] flex items-center justify-center overflow-hidden">
          {slides.map((slide, index) => (
            <img
              key={slide.id}
              src={slide.img}
              alt={slide.alt}
              loading={index === 0 ? "eager" : "lazy"}
              className={cn(
                "absolute inset-0 w-full h-full object-contain object-center transition-opacity duration-1000 ease-in-out",
                currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            />
          ))}
        </div>
      </div>

      {/* Indicadores (bolinhas) na parte externa inferior */}
      <div className="flex gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentSlide === index ? "bg-yellow-400 w-4" : "bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Ir para o slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
