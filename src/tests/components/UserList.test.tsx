import type { ComponentType } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, beforeEach, expect, type Mock } from 'vitest';
import '@testing-library/jest-dom';
import { fetchUsers } from '../../components/UserList';
import githubService from '../../api/services/github-service';

// Mock useGithubStore
const useGithubStoreMock = vi.fn();
vi.mock('../../stores/github', () => ({
  useGithubStore: () => useGithubStoreMock(),
}));

// Mock Repository component to avoid rendering its internals
vi.mock('../../components/Repository', () => ({
  __esModule: true,
  default: ({ item }: { item: { login: string } }) => <div data-testid="repository">{item.login}</div>,
}));

// Mock githubService
vi.mock('../../api/services/github-service', () => ({
  default: {
    getListUsers: vi.fn(),
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

describe('UserList (real useQuery)', () => {
  let UserList: ComponentType; // module imported after mocks are finalized

  beforeEach(async () => {
    vi.resetModules();
    ({ default: UserList } = await import('../../components/UserList'));
    vi.clearAllMocks();
  });

  it('calls fetchUsers via queryFn when username is set', async () => {
    useGithubStoreMock.mockReturnValue({ username: 'octocat' });
    const mockData = { total_count: 1, items: [{ id: 1, login: 'octocat' }] };
    (githubService.getListUsers as Mock).mockResolvedValue({ data: mockData });

    renderWithQueryClient(<UserList />);
    await waitFor(() => expect(screen.getByTestId('repository')).toHaveTextContent('octocat'));
    expect(githubService.getListUsers).toHaveBeenCalledWith('octocat');
  });
});

describe('UserList', () => {
  const useQueryMock = vi.fn();
  let UserList: ComponentType;

  beforeEach(async () => {
    vi.resetModules();
    useQueryMock.mockReset();

    // Mock react-query ONLY for this block
    vi.doMock('@tanstack/react-query', async () => {
      const actual = await vi.importActual<ComponentType>('@tanstack/react-query');
      return {
        ...actual,
        useQuery: (...args: unknown[]) => useQueryMock(...args),
      };
    });

    // Import AFTER doMock so the component sees the mocked hook
    ({ default: UserList } = await import('../../components/UserList'));
    vi.clearAllMocks();
  });

  it('returns data when API call is successful', async () => {
    const mockData = { total_count: 1, items: [{ id: 1, login: 'octocat' }] };
    (githubService.getListUsers as Mock).mockResolvedValue({ data: mockData });

    const result = await fetchUsers('octocat');
    expect(result).toEqual(mockData);
  });

  it('returns error message when API throws Error', async () => {
    (githubService.getListUsers as Mock).mockRejectedValue(new Error('API failed'));
    const result = await fetchUsers('octocat');
    expect(result).toBe('API failed');
  });

  it('returns unknown error message for non-Error rejection', async () => {
    (githubService.getListUsers as Mock).mockRejectedValue('fail');
    const result = await fetchUsers('octocat');
    expect(result).toBe('An unknown error occurred');
  });

  it('shows loading state', () => {
    useGithubStoreMock.mockReturnValue({ username: 'octocat' });
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    renderWithQueryClient(<UserList />);
    expect(screen.queryByTestId('repository')).not.toBeInTheDocument();
  });

  it('shows error message when query fails', () => {
    useGithubStoreMock.mockReturnValue({ username: 'octocat' });
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch'),
    });

    renderWithQueryClient(<UserList />);
    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });

  it('shows user repositories when data is loaded', () => {
    useGithubStoreMock.mockReturnValue({ username: 'octocat' });
    useQueryMock.mockReturnValue({
      data: {
        total_count: 1,
        items: [{ id: 1, login: 'octocat' }],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    renderWithQueryClient(<UserList />);
    expect(screen.getByText(/showing users for "octocat"/i)).toBeInTheDocument();
    expect(screen.getByTestId('repository')).toHaveTextContent('octocat');
  });

  it('shows "No users found" when data is empty', () => {
    useGithubStoreMock.mockReturnValue({ username: 'octocat' });
    useQueryMock.mockReturnValue({
      data: {
        total_count: 0,
        items: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    renderWithQueryClient(<UserList />);
    expect(screen.getByText(/no users found for "octocat"/i)).toBeInTheDocument();
  });

  it('renders nothing if username is empty', () => {
    useGithubStoreMock.mockReturnValue({ username: '' });
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    });

    renderWithQueryClient(<UserList />);
    expect(screen.queryByTestId('repository')).not.toBeInTheDocument();
    expect(screen.queryByText(/showing users for/i)).not.toBeInTheDocument();
  });
});
