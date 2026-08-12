import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Buyer, GameTask } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import { phase2Buyers } from '../../content/phase2';
import TasksScreen from '../TasksScreen';

describe('TasksScreen empty state', () => {
  it('routes a blocked P4 player to the direct shortlist decision', () => {
    useGameStore.setState({
      phase: 4,
      tasks: [
        { id: 'task-60', phase: 4, name: 'Score Buyer Seriousness', status: 'completed' } as GameTask,
        { id: 'task-61', phase: 4, name: 'Build Provisional Shortlist', status: 'completed' } as GameTask,
      ],
      buyers: [
        { ...phase2Buyers[0], status: 'active' } as Buyer,
        { ...phase2Buyers[1], status: 'reviewing' } as Buyer,
      ],
    });

    render(
      <MemoryRouter>
        <TasksScreen />
      </MemoryRouter>,
    );

    expect(screen.getByText('Task work is complete — the shortlist decision still needs you.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Choose Shortlist' }).getAttribute('href')).toBe('/buyers');
  });
});
