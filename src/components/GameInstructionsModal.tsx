import { X, ArrowRight, Mail, ListChecks, ShieldAlert, Gauge, Users } from 'lucide-react';

interface GameInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function GameInstructionsModal({ isOpen, onClose }: GameInstructionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-bg-secondary shadow-[var(--shadow-heavy)]">
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-5">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-text-accent">Instruções do jogo</p>
            <h2 className="mt-1 font-display text-[22px] font-semibold text-text-primary">Como conduzir o deal</h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-text-secondary">
              O objetivo é fechar a venda da Solara Systems sem perder compradores, confiança do cliente ou controlo do processo.
              O jogo deve viver numa tensão saudável: nem checklist automática, nem caos injusto.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-md)] p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
          {CORE_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-[var(--radius-md)] border border-border-subtle bg-bg-primary p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-text-accent">
                    <Icon size={16} />
                  </div>
                  <h3 className="text-[14px] font-semibold text-text-primary">{step.title}</h3>
                </div>
                <p className="mt-3 text-[12px] leading-relaxed text-text-secondary">{step.body}</p>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border-subtle bg-bg-primary/60 px-6 py-5">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <div>
              <div className="flex items-center gap-2 text-[12px] font-semibold text-text-primary">
                <Users size={14} className="text-text-accent" />
                O que observar
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
                Mantém momentum e confiança altos, orçamento e capacidade sob controlo, risco abaixo de níveis críticos,
                e compradores suficientes no processo para preservar tensão competitiva.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[12px] font-semibold text-text-primary">
                <ArrowRight size={14} className="text-text-accent" />
                Como progredir
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
                Cada fase tem um gate. Completa os requisitos principais, avança a semana para resolver consequências,
                e passa de fase quando o gate indicar que o processo está pronto.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Voltar ao jogo
          </button>
        </div>
      </div>
    </div>
  );
}
