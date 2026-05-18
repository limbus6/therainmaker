import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bug, ChevronDown, ChevronUp, Send, SkipForward } from 'lucide-react';
import { REVIEW_CHECKPOINTS } from '../config/reviewCheckpoints';
import { useGameStore } from '../store/gameStore';
import { PHASE_NAMES, type PhaseId } from '../types/game';

interface ReviewPayload {
  phase: PhaseId;
  phaseLabel: string;
  checkpointId: string;
  checkpointLabel: string;
  checkpointDescription: string;
  route: string;
  review: string;
}

function formatFixesEntry(payload: ReviewPayload): string {
  const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', ' UTC');

  return [
    `## ${timestamp}`,
    `- Fase: P${payload.phase} — ${payload.phaseLabel}`,
    `- Checkpoint: ${payload.checkpointLabel}`,
    `- Rota: ${payload.route}`,
    `- Contexto: ${payload.checkpointDescription}`,
    '',
    payload.review,
    '',
  ].join('\n');
}

export default function GameplayReviewBar() {
  const navigate = useNavigate();
  const debugJumpToCheckpoint = useGameStore((s) => s.debugJumpToCheckpoint);
  const addToast = useGameStore((s) => s.addToast);
  const currentPhase = useGameStore((s) => s.phase);

  const [selectedPhase, setSelectedPhase] = useState<PhaseId>(currentPhase);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState(
    REVIEW_CHECKPOINTS.find((checkpoint) => checkpoint.phase === currentPhase)?.id ?? REVIEW_CHECKPOINTS[0].id,
  );
  const [reviewText, setReviewText] = useState('');
  const [isJumping, setIsJumping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('gameplayReviewBarCollapsed') === 'true';
  });

  const phaseCheckpoints = REVIEW_CHECKPOINTS.filter((checkpoint) => checkpoint.phase === selectedPhase);
  const selectedCheckpoint = phaseCheckpoints.find((checkpoint) => checkpoint.id === selectedCheckpointId) ?? phaseCheckpoints[0];

  useEffect(() => {
    if (!phaseCheckpoints.some((checkpoint) => checkpoint.id === selectedCheckpointId) && phaseCheckpoints[0]) {
      setSelectedCheckpointId(phaseCheckpoints[0].id);
    }
  }, [phaseCheckpoints, selectedCheckpointId]);

  useEffect(() => {
    window.localStorage.setItem('gameplayReviewBarCollapsed', String(isCollapsed));
  }, [isCollapsed]);

  async function handleJump() {
    if (!selectedCheckpoint) return;

    setIsJumping(true);
    try {
      await debugJumpToCheckpoint(selectedCheckpoint.id);
      navigate(selectedCheckpoint.route);
      addToast(`Checkpoint carregado: P${selectedCheckpoint.phase} — ${selectedCheckpoint.label}`, 'info');
    } catch {
      addToast('Não foi possível carregar o checkpoint selecionado.', 'danger');
    } finally {
      setIsJumping(false);
    }
  }

  async function handleSubmitReview() {
    const trimmedReview = reviewText.trim();
    if (!trimmedReview || !selectedCheckpoint) {
      addToast('Escreve uma nota antes de enviar.', 'warning');
      return;
    }

    const payload: ReviewPayload = {
      phase: selectedCheckpoint.phase,
      phaseLabel: PHASE_NAMES[selectedCheckpoint.phase],
      checkpointId: selectedCheckpoint.id,
      checkpointLabel: selectedCheckpoint.label,
      checkpointDescription: selectedCheckpoint.description,
      route: selectedCheckpoint.route,
      review: trimmedReview,
    };

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Review submission failed');
      }

      setReviewText('');
      addToast('Nota adicionada ao Fixes.md.', 'success');
    } catch {
      const fixesEntry = formatFixesEntry(payload);
      const storedDrafts = JSON.parse(window.localStorage.getItem('fixesDrafts') ?? '[]') as string[];
      window.localStorage.setItem('fixesDrafts', JSON.stringify([...storedDrafts, fixesEntry]));

      try {
        await navigator.clipboard.writeText(fixesEntry);
        addToast('GitHub Pages não escreve ficheiros. A nota foi copiada e guardada em rascunhos locais.', 'warning');
      } catch {
        addToast('GitHub Pages não escreve ficheiros. A nota ficou guardada em rascunhos locais.', 'warning');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCollapsed) {
    return (
      <section className="shrink-0 border-b border-border-subtle bg-bg-panel/95">
        <div className="flex items-center justify-between gap-3 px-4 py-2 md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Bug size={14} className="text-text-accent" />
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-text-muted">Barra de revisão oculta</span>
            <span className="hidden truncate text-[11px] text-text-secondary sm:inline">
              Os checkpoints de teste e as notas para o Fixes.md continuam disponíveis.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border-subtle bg-surface-default px-3 py-1.5 text-[11px] font-semibold text-text-primary transition-colors hover:border-border-accent hover:text-text-accent"
          >
            <ChevronDown size={13} />
            Mostrar barra
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="shrink-0 border-b border-border-subtle bg-[radial-gradient(circle_at_top_left,rgba(240,79,165,0.18),transparent_34%),linear-gradient(90deg,rgba(13,10,33,0.96),rgba(30,16,64,0.92))]">
      <div className="px-4 py-3 md:px-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-accent bg-accent-soft text-text-accent shadow-[var(--shadow-glow-soft)]">
              <Bug size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-text-accent">Revisão de gameplay</p>
                <span className="rounded-full border border-border-subtle bg-surface-default px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                  Barra QA
                </span>
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-default px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-text-muted transition-colors hover:border-border-accent hover:text-text-accent"
                >
                  <ChevronUp size={12} />
                  Ocultar
                </button>
              </div>
              <p className="mt-1 text-[12px] text-text-secondary">
                Salta para fases e subfases coerentes para testes. Em local, as notas são gravadas em <span className="font-mono text-text-primary">Fixes.md</span>; em GitHub Pages ficam copiadas/guardadas como rascunho.
              </p>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-[minmax(0,180px)_minmax(0,280px)_auto] xl:min-w-[560px]">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">Fase</span>
              <div className="relative">
                <select
                  value={selectedPhase}
                  onChange={(event) => setSelectedPhase(Number(event.target.value) as PhaseId)}
                  className="w-full appearance-none rounded-[var(--radius-md)] border border-border-default bg-bg-panel px-3 py-2 pr-9 text-[12px] text-text-primary outline-none transition-colors focus:border-border-accent"
                >
                  {Object.entries(PHASE_NAMES).map(([phaseId, label]) => (
                    <option key={phaseId} value={phaseId}>
                      {`P${phaseId} — ${label}`}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
              </div>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">Subfase</span>
              <div className="relative">
                <select
                  value={selectedCheckpointId}
                  onChange={(event) => setSelectedCheckpointId(event.target.value)}
                  className="w-full appearance-none rounded-[var(--radius-md)] border border-border-default bg-bg-panel px-3 py-2 pr-9 text-[12px] text-text-primary outline-none transition-colors focus:border-border-accent"
                >
                  {phaseCheckpoints.map((checkpoint) => (
                    <option key={checkpoint.id} value={checkpoint.id}>
                      {checkpoint.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
              </div>
            </label>

            <button
              type="button"
              onClick={handleJump}
              disabled={isJumping || !selectedCheckpoint}
              className="mt-[18px] inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border-accent bg-accent-primary px-4 py-2 text-[12px] font-semibold text-white transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SkipForward size={14} />
              {isJumping ? 'A carregar...' : 'Ir para checkpoint'}
            </button>
          </div>
        </div>

        {selectedCheckpoint && (
          <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <div className="rounded-[var(--radius-md)] border border-border-subtle bg-surface-default px-3 py-3">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">Cenário selecionado</p>
              <p className="mt-1 text-[13px] font-semibold text-text-primary">
                {`P${selectedCheckpoint.phase} — ${selectedCheckpoint.label}`}
              </p>
              <p className="mt-1 text-[12px] text-text-secondary">{selectedCheckpoint.description}</p>
              <p className="mt-2 text-[11px] font-mono text-text-muted">
                Rota: <span className="text-text-primary">{selectedCheckpoint.route}</span>
              </p>
            </div>

            <div className="rounded-[var(--radius-md)] border border-border-subtle bg-surface-default px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">Nota de revisão</p>
                  <p className="mt-1 text-[12px] text-text-secondary">
                    Descreve bugs, casos-limite ou ajustes de UX encontrados neste checkpoint.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={isSubmitting}
                  className="inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-md)] border border-border-default bg-bg-panel px-3 py-2 text-[12px] font-semibold text-text-primary transition-colors hover:border-border-accent hover:text-text-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={14} />
                  {isSubmitting ? 'A enviar...' : 'Enviar para Fixes.md'}
                </button>
              </div>
              <textarea
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                placeholder={`Ex.: P${selectedCheckpoint.phase} / ${selectedCheckpoint.label} — o buyer state não refletiu a exclusivity, a trust caiu demasiado, o modal bloqueou o fluxo...`}
                className="mt-3 min-h-[92px] w-full rounded-[var(--radius-md)] border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-accent"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
