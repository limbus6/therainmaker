import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
const SLIDES = [
    {
        title: 'Bem-vindo ao M&A Rainmaker',
        body: `És um banker de M&A sell-side na Clearwater Advisory. O teu cliente, Ricardo Mendes, contratou-te para conduzir o processo de venda da Solara Systems, a sua empresa de automação industrial.\n\nO teu objetivo: encontrar o comprador certo, gerir o processo e fechar o deal nas melhores condições possíveis.`,
        cta: 'Percebi →',
    },
    {
        title: 'Como o jogo funciona',
        body: `O deal avança ao longo de 11 fases, desde a originação até ao closing. Em cada semana deves:\n\n• Concluir tarefas para empurrar o processo\n• Responder a emails do cliente, equipa e compradores\n• Mitigar riscos antes de descarrilarem o deal\n• Avançar a semana quando estiveres pronto\n\nOs teus recursos — orçamento, momentum, confiança e capacidade da equipa — determinam se o deal chega ao fim.`,
        cta: 'Entendido →',
    },
    {
        title: 'Fase 0 — Originação do deal',
        body: `Começas na Fase 0: Originação do deal.\n\nObjetivos imediatos:\n1. Analisar o mercado e confirmar que a Solara está pronta para vender\n2. Reunir com Ricardo e avaliar as suas motivações\n3. Alinhar internamente se vale a pena perseguir o mandato\n4. Preparar a entrada na Fase 1 (Pitch & Mandate)\n\nComeça pela Inbox e pelas Tarefas. Boa sorte.`,
        cta: 'Começar o deal →',
    },
];
export default function OnboardingOverlay({ onComplete }) {
    const [slide, setSlide] = useState(0);
    const markOnboardingSeen = useGameStore((s) => s.markOnboardingSeen);
    const playerName = useGameStore((s) => s.playerName);
    const current = SLIDES[slide];
    const isLast = slide === SLIDES.length - 1;
    const handleNext = () => {
        if (isLast) {
            markOnboardingSeen();
            onComplete();
        }
        else {
            setSlide(slide + 1);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[300]", children: _jsxs("div", { className: "bg-bg-secondary border border-border-subtle rounded-xl shadow-2xl w-[480px] max-w-[90vw] overflow-hidden", children: [_jsx("div", { className: "flex gap-1.5 px-6 pt-5", children: SLIDES.map((_, i) => (_jsx("div", { className: `h-1 rounded-full flex-1 transition-all duration-300 ${i <= slide ? 'bg-accent-primary' : 'bg-border-subtle'}` }, i))) }), _jsxs("div", { className: "px-6 py-6", children: [slide === 0 && playerName && (_jsxs("p", { className: "text-[12px] font-mono text-text-accent mb-3", children: ["Ol\u00E1, ", playerName, "."] })), _jsx("h2", { className: "text-[20px] font-bold font-display text-text-primary mb-4", children: current.title }), _jsx("p", { className: "text-[13px] text-text-secondary leading-relaxed whitespace-pre-line", children: current.body })] }), _jsxs("div", { className: "px-6 pb-6 flex items-center justify-between", children: [_jsxs("span", { className: "text-[11px] font-mono text-text-muted", children: [slide + 1, " / ", SLIDES.length] }), _jsx("button", { onClick: handleNext, className: "px-6 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-primary/90 active:scale-95 transition-all duration-150 text-[13px] font-semibold text-text-primary", children: current.cta })] })] }) }));
}
//# sourceMappingURL=OnboardingOverlay.js.map