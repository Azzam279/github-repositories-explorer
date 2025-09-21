
import { useQuery } from '@tanstack/react-query';
import { useGithubStore } from '../stores/github';
import Skeleton from '@mui/material/Skeleton';
import Repository from './Repository';
import githubService from '../api/services/github-service';

interface GithubUser {
  login: string;
  id: number;
}

interface GithubUserSearchResult {
  total_count: number;
  items: GithubUser[];
}

// eslint-disable-next-line react-refresh/only-export-components
export const fetchUsers = async (username: string): Promise<GithubUserSearchResult | string> => {
  try {
    const response = await githubService.getListUsers(username);
    return response.data as GithubUserSearchResult;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }

    return 'An unknown error occurred';
  }
};

export default function UserList() {
  const githubStore = useGithubStore() as { username: string };
  const username = githubStore.username;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['username', username],
    queryFn: () => fetchUsers(username),
    enabled: !!username,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  return (
    <>
      {isError && <p style={{ color: 'crimson' }}>{(error as Error).message}</p>}
      {isLoading ? (
        <>
          <br />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="skeleton-loader"
              animation="wave"
              variant="rounded"
              height={50}
            />
          ))}
        </>
      ) : <>
        <div className="user-list">
          {typeof data === 'object' && data !== null && 'total_count' in data && data.total_count > 0 ?
            <>
              <p>Showing users for "{username}"</p>
              {data.items.map((item) => (<Repository item={item} key={item.id} />))}
            </>
          : <p>{username ? `No users found for "${username}".`: ''}</p>}
        </div>
      </>}
    </>
  );
}
