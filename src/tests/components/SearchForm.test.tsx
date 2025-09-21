import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SearchForm from '../../components/SearchForm';

const setUsernameMock = vi.fn();

// Mock useGithubStore
vi.mock('../../stores/github', () => ({
  useGithubStore: () => ({
    setUsername: setUsernameMock,
  }),
}));

describe('SearchForm', () => {
  beforeEach(() => {
    setUsernameMock.mockClear();
  });

  it('renders input and button', () => {
    render(<SearchForm />);
    expect(screen.getByLabelText(/Enter username/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('shows validation error if submitted empty', async () => {
    render(<SearchForm />);
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(await screen.findByText(/this field is required/i)).toBeInTheDocument();
    expect(setUsernameMock).not.toHaveBeenCalled();
  });

  it('calls setUsername with trimmed value on submit', async () => {
    render(<SearchForm />);
    const input = screen.getByLabelText(/Enter username/i);
    fireEvent.change(input, { target: { value: '  octocat  ' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(setUsernameMock).toHaveBeenCalledWith('octocat');
    });
  });
});
