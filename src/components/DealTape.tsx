// ============================================
// Deal Tape Animated Progression Component
// ============================================
// Displays a visual timeline ticker of turn events with staggered GSAP reveals and causal deltas.

import React, { useEffect, useRef } from 'react';
import { CheckCircle2, Mail, Users, AlertTriangle, ArrowRight } from 'lucide-react';
import type { WeekResult } from '../engine/weekEngine';
import { staggerReveal } from '../utils/motion';

interface DealTapeProps {
  result: WeekResult;
  fromDay: number;
  toDay: number;
}

export default function DealTape({ result, fromDay, toDay }: DealTapeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const tapeItems: { id: string; icon: React.ComponentType<{ size?: number; className?: string }>; title: string; subtitle: string; color: string }[] = [];

  // Completed tasks
  result.tasksCompleted.forEach((t) => {
    tapeItems.push({
      id: `task-${t.id}`,
      icon: CheckCircle2,
      title: t.name,
      subtitle: 'Task Completed',
      color: 'text-state-success',
    });
  });

  // Buyer changes
  result.buyerChanges.forEach((bc) => {
    tapeItems.push({
      id: `buyer-${bc.buyerId}-${bc.field}`,
      icon: Users,
      title: bc.buyerId,
      subtitle: `${bc.field}: ${bc.from} → ${bc.to}`,
      color: 'text-text-accent',
    });
  });

  // New urgent/high emails
  result.newEmails
    .filter((e) => e.priority === 'urgent' || e.priority === 'high')
    .forEach((e) => {
      tapeItems.push({
        id: `email-${e.id}`,
        icon: Mail,
        title: e.subject,
        subtitle: `From: ${e.sender}`,
        color: 'text-state-warning',
      });
    });

  // New risks
  result.newRisks.forEach((r) => {
    tapeItems.push({
      id: `risk-${r.id}`,
      icon: AlertTriangle,
      title: r.name,
      subtitle: `Risk Flagged (${r.severity})`,
      color: 'text-state-danger',
    });
  });

  useEffect(() => {
    if (containerRef.current) {
      const children = Array.from(containerRef.current.children) as HTMLElement[];
      staggerReveal(children, 0.1, 0.4);
    }
  }, [result]);

  return (
    <div className="rounded-[var(--radius-md)] border border-border-subtle bg-surface-default p-3 space-y-3">
      {/* Day Progress Ticker */}
      <div className="flex items-center justify-between text-[11px] font-mono text-text-muted border-b border-border-subtle pb-2">
        <span>Day {fromDay}</span>
        <div className="flex items-center gap-1 text-text-accent">
          <span>Advancing +{result.daysAdvanced}d</span>
          <ArrowRight size={12} />
        </div>
        <span>Day {toDay}</span>
      </div>

      {/* Sequenced Tape Items */}
      {tapeItems.length === 0 ? (
        <p className="text-[12px] text-text-muted italic py-1">Smooth progress — background workstreams advancing on schedule.</p>
      ) : (
        <div ref={containerRef} className="space-y-2">
          {tapeItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-center gap-2.5 text-[12px]">
                <Icon size={14} className={`${item.color} shrink-0`} />
                <span className="font-medium text-text-primary truncate">{item.title}</span>
                <span className="text-[10px] font-mono text-text-muted ml-auto shrink-0">{item.subtitle}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
