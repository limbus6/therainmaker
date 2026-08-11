import type { Email, GameTask, PhaseId } from '../types/game';

/** Informational mail that carries no authored response or escalation choice. */
export function getRoutineEmails(emails: Email[], phase: PhaseId): Email[] {
  return emails.filter((email) =>
    email.phase === phase
    && email.state === 'unread'
    && (!email.responseOptions || email.responseOptions.length === 0)
    && (email.priority === 'low' || email.priority === 'normal')
    && (
      email.category === 'system'
      || email.category === 'market'
      || (email.category === 'internal' && email.priority === 'low')
    )
  );
}

/**
 * Queueable work is intentionally narrow: low-complexity, non-recommended
 * internal/document production. Relationship and strategic choices never
 * enter the batch.
 */
export function getRoutineTasks(tasks: GameTask[], phase: PhaseId): GameTask[] {
  return tasks.filter((task) =>
    task.phase === phase
    && task.status === 'available'
    && task.complexity === 'low'
    && (task.category === 'internal' || task.category === 'deliverable')
  );
}
