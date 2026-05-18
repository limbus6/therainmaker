import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X, ArrowRight, Mail, ListChecks, ShieldAlert, Gauge, Users } from 'lucide-react';
const CORE_STEPS = [
    {
        icon: Mail,
        title: 'Lê a Inbox',
        body: 'Os emails trazem pressão do cliente, pedidos da equipa, sinais de compradores e eventos que podem alterar o rumo do deal.',
    },
    {
        icon: ListChecks,
        title: 'Escolhe tarefas',
        body: 'As tarefas fazem avançar workstreams, entregáveis e gates de fase. Prioriza o que desbloqueia progresso sem rebentar a capacidade.',
    },
    {
        icon: ShieldAlert,
        title: 'Mitiga riscos',
        body: 'Riscos ignorados podem transformar-se em eventos negativos, perda de confiança ou quebra de momentum.',
    },
    {
        icon: Gauge,
        title: 'Avança a semana',
        body: 'Quando tiveres definido a tua jogada, avança o tempo. O jogo resolve tarefas, eventos, compradores e recursos.',
    },
];
export default function GameInstructionsModal({ isOpen, onClose }) {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-[320] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm", children: _jsxs("div", { className: "w-full max-w-3xl overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-bg-secondary shadow-[var(--shadow-heavy)]", children: [_jsxs("div", { className: "flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-5", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-mono uppercase tracking-[0.24em] text-text-accent", children: "Instru\u00E7\u00F5es do jogo" }), _jsx("h2", { className: "mt-1 font-display text-[22px] font-semibold text-text-primary", children: "Como conduzir o deal" }), _jsx("p", { className: "mt-2 max-w-2xl text-[13px] leading-relaxed text-text-secondary", children: "O objetivo \u00E9 fechar a venda da Solara Systems sem perder compradores, confian\u00E7a do cliente ou controlo do processo. O jogo deve viver numa tens\u00E3o saud\u00E1vel: nem checklist autom\u00E1tica, nem caos injusto." })] }), _jsx("button", { type: "button", onClick: onClose, className: "rounded-[var(--radius-md)] p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary", children: _jsx(X, { size: 18 }) })] }), _jsx("div", { className: "grid gap-4 px-6 py-6 md:grid-cols-2", children: CORE_STEPS.map((step) => {
                        const Icon = step.icon;
                        return (_jsxs("div", { className: "rounded-[var(--radius-md)] border border-border-subtle bg-bg-primary p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-text-accent", children: _jsx(Icon, { size: 16 }) }), _jsx("h3", { className: "text-[14px] font-semibold text-text-primary", children: step.title })] }), _jsx("p", { className: "mt-3 text-[12px] leading-relaxed text-text-secondary", children: step.body })] }, step.title));
                    }) }), _jsxs("div", { className: "border-t border-border-subtle bg-bg-primary/60 px-6 py-5", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-[1fr_1fr]", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 text-[12px] font-semibold text-text-primary", children: [_jsx(Users, { size: 14, className: "text-text-accent" }), "O que observar"] }), _jsx("p", { className: "mt-2 text-[12px] leading-relaxed text-text-secondary", children: "Mant\u00E9m momentum e confian\u00E7a altos, or\u00E7amento e capacidade sob controlo, risco abaixo de n\u00EDveis cr\u00EDticos, e compradores suficientes no processo para preservar tens\u00E3o competitiva." })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 text-[12px] font-semibold text-text-primary", children: [_jsx(ArrowRight, { size: 14, className: "text-text-accent" }), "Como progredir"] }), _jsx("p", { className: "mt-2 text-[12px] leading-relaxed text-text-secondary", children: "Cada fase tem um gate. Completa os requisitos principais, avan\u00E7a a semana para resolver consequ\u00EAncias, e passa de fase quando o gate indicar que o processo est\u00E1 pronto." })] })] }), _jsx("button", { type: "button", onClick: onClose, className: "mt-5 w-full rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent-hover", children: "Voltar ao jogo" })] })] }) }));
}
//# sourceMappingURL=GameInstructionsModal.js.map