import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, beforeEach, expect, type Mock } from 'vitest';
import * as reactQuery from '@tanstack/react-query';
import '@testing-library/jest-dom';
import Repository, { fetchRepos } from '../../components/Repository';
import githubService from '../../api/services/github-service';

// Mock githubService
vi.mock('../../api/services/github-service', () => ({
  default: {
    getRepositoriesByUser: vi.fn(),
  },
}));

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('Repository component', () => {
  const item = { id: 1, login: 'octocat' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns data when API call is successful', async () => {
    const mockData = [
      {
        id: 1,
        name: 'repo1',
        html_url: 'https://github.com/octocat/repo1',
        description: 'desc',
        stargazers_count: 10,
      },
    ];
    (githubService.getRepositoriesByUser as Mock).mockResolvedValue({ data: mockData });

    const result = await fetchRepos('octocat');
    expect(result).toEqual(mockData);
  });

  it('returns error message when API throws Error', async () => {
    (githubService.getRepositoriesByUser as Mock).mockRejectedValue(new Error('API failed'));

    const result = await fetchRepos('octocat');
    expect(result).toBe('API failed');
  });

  it('returns unknown error message for non-Error rejection', async () => {
    (githubService.getRepositoriesByUser as Mock).mockRejectedValue('fail');

    const result = await fetchRepos('octocat');
    expect(result).toBe('An unknown error occurred');
  });

  it('calls fetchRepos via queryFn when accordion is clicked', async () => {
    const mockData = [
      {
        id: 1,
        name: 'repo1',
        html_url: 'https://github.com/octocat/repo1',
        description: 'desc',
        stargazers_count: 10,
      },
    ];
    (githubService.getRepositoriesByUser as Mock).mockResolvedValue({ data: mockData });

    renderWithQueryClient(<Repository item={item} />);
    // Click to trigger fetch
    fireEvent.click(screen.getByRole('button', { name: /octocat/i }));

    // Wait for the repo to appear, which means fetchRepos was called by queryFn
    await waitFor(() => {
      expect(screen.getByText('repo1')).toBeInTheDocument();
    });

    expect(githubService.getRepositoriesByUser).toHaveBeenCalledWith('octocat');
  });

  it('shows skeletons when loading', () => {
    vi.spyOn(reactQuery, 'useQuery').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as never);

    render(<Repository item={item} />);
    fireEvent.click(screen.getByRole('button', { name: /octocat/i }));
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
  });

  it('shows error message on error', () => {
    vi.spyOn(reactQuery, 'useQuery').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch'),
    } as never);

    render(<Repository item={item} />);
    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });

  it('shows repositories when data is loaded', () => {
    const repos = [
      {
        id: 101,
        name: 'repo1',
        html_url: 'https://github.com/octocat/repo1',
        description: 'Test repo',
        stargazers_count: 42,
      },
    ];
    vi.spyOn(reactQuery, 'useQuery').mockReturnValue({
      data: repos,
      isLoading: false,
      isError: false,
      error: null,
    } as never);

    render(<Repository item={item} />);
    expect(screen.getByText('repo1')).toBeInTheDocument();
    expect(screen.getByText('Test repo')).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('shows "No repositories found" when data is empty', () => {
    vi.spyOn(reactQuery, 'useQuery').mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as never);

    render(<Repository item={item} />);
    expect(screen.getByText(/No repositories found/i)).toBeInTheDocument();
  });

  it('fetches repositories on accordion click', () => {
    render(<Repository item={item} />);
    const accordion = screen.getByRole('button');
    fireEvent.click(accordion);
  });
});
