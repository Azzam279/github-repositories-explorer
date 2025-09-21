import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useQueryClient } from 'react-query';
import '@testing-library/jest-dom';

// Mock child components BEFORE importing App
vi.mock('../components/SearchForm.tsx', () => ({
  __esModule: true,
  default: () => {
    return <div data-testid="search-form">Search Form</div>;
  },
}));

vi.mock('../components/UserList.tsx', () => ({
  __esModule: true,
  default: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const qc = useQueryClient();
    return (
      <div data-testid="user-list">
        UserList {qc ? '(client-ok)' : '(no-client)'}
      </div>
    );
  },
}));

import App from '../App';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders SearchForm and UserList within a QueryClientProvider', async () => {
    render(<App />);

    expect(await screen.findByTestId('search-form')).toBeInTheDocument();
    const userList = screen.getByTestId('user-list');
    expect(userList).toBeInTheDocument();
    expect(userList).toHaveTextContent('(client-ok)');
  });
});
