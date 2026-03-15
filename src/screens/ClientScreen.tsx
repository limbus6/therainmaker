import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import KpiTile from '../components/ui/KpiTile';
import StatusChip from '../components/ui/StatusChip';
import CompetitorMitigationPanel from '../components/CompetitorMitigationPanel';
import { UserCircle, FileText } from 'lucide-react';

const sentimentColor: Record<string, string> = {
  positive: 'text-green-400',
  neutral: 'text-yellow-400',
  negative: 'text-red-400',
};

const sentimentDot: Record<string, string> = {
  positive: 'bg-green-400',
  neutral: 'bg-yellow-400',
  negative: 'bg-red-400',
};

export default function ClientScreen() {
  const client = useGameStore((s) => s.client);
  const phase = useGameStore((s) => s.phase);
  const qualificationNotes = useGameStore((s) => s.qualificationNotes);
  const competitorThreats = useGameStore((s) => s.competitorThreats);

  const activeThreats = competitorThreats.filter((t) => !t.resolved);
  const meetingNotes = qualificationNotes.filter((n) => n.source === 'meeting');

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-display font-semibold text-text-primary">Client</h1>
        <p className="text-[12px] text-text-muted mt-1">Manage the seller relationship</p>
      </div>

      {/* Competitor threat banner */}
      {activeThreats.length > 0 && <CompetitorMitigationPanel />}

      {/* Client Header */}
      <Panel variant="elevated">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-full bg-accent-soft border border-border-accent flex items-center justify-center shrink-0">
            <UserCircle size={28} className="text-text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-display font-semibold text-text-primary">{client.name}</h2>
            <p className="text-[13px] text-text-secondary">{client.companyName}</p>
            <p className="text-[11px] text-text-muted mt-1">{client.sector}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusChip label={`Risk: ${client.riskTolerance}`} variant={client.riskTolerance === 'aggressive' ? 'warning' : 'default'} size="md" />
            <StatusChip label={`Time: ${client.timeSensitivity}`} variant={client.timeSensitivity === 'high' ? 'danger' : 'default'} size="md" />
          </div>
        </div>
      </Panel>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile label="Trust" value={client.trust} color={client.trust > 60 ? 'success' : client.trust > 40 ? 'warning' : 'danger'} />
        <KpiTile label="Confidence" value={client.confidence} color={client.confidence > 60 ? 'success' : 'warning'} />
        <KpiTile label="Valuation Target" value={client.valuationExpectation} color="default" />
        <KpiTile label="Time Sensitivity" value={client.timeSensitivity} color={client.timeSensitivity === 'high' ? 'danger' : 'default'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="Company Overview">
          <p className="text-[13px] text-text-secondary leading-relaxed">{client.description}</p>
        </Panel>

        <Panel title="Client Objectives">
          <ul className="space-y-2">
            {client.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary mt-1.5 shrink-0" />
                <span className="text-[12px] text-text-secondary">{obj}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Qualification Notes — visible in Phase 0 */}
      {phase === 0 && (
        <Panel title="Qualification Notes">
          {qualificationNotes.length === 0 ? (
            <p className="text-[12px] text-text-muted italic">No qualification notes yet. Complete the company screening and client motivation assessment to generate notes.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {qualificationNotes.map((note) => (
                <div key={note.id} className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-surface-default border border-border-subtle">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${sentimentDot[note.sentiment]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono uppercase tracking-wider ${sentimentColor[note.sentiment]}`}>{note.sentiment}</span>
                      <span className="text-[10px] text-text-muted">·</span>
                      <span className="text-[10px] text-text-muted font-mono">{note.source.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-text-muted">· Week {note.week}</span>
                    </div>
                    <p className="text-[12px] text-text-secondary leading-relaxed">{note.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {/* Meeting Notes */}
      {meetingNotes.length > 0 && (
        <Panel title="Meeting Notes">
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {meetingNotes.map((note) => (
              <div key={note.id} className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-surface-default border border-border-subtle">
                <FileText size={14} className="text-text-muted mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-text-muted font-mono mb-1">Week {note.week}</div>
                  <p className="text-[12px] text-text-secondary leading-relaxed">{note.content}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
