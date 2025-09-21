import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Skeleton from '@mui/material/Skeleton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import githubService from '../api/services/github-service';

interface GithubRepository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
}

// eslint-disable-next-line react-refresh/only-export-components
export const fetchRepos = async (username: string): Promise<GithubRepository | string> => {
  try {
    const response = await githubService.getRepositoriesByUser(username);
    return response.data as GithubRepository;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }

    return 'An unknown error occurred';
  }
}

export default function Repository({ item }: { item: { id: number; login: string } }) {
  const [expanded, setExpanded] = useState(false);
  const username = item.login;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['u', username],
    queryFn: () => fetchRepos(username),
    enabled: expanded, // only fetch when expanded
    refetchOnWindowFocus: false, // prevent surprise refetches
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  return (
    <Accordion
      key={item.id}
      className='repository-accordion'
      expanded={expanded}
      onChange={(_, isExp) => setExpanded(isExp)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
      >
        <strong>{item.login}</strong>
      </AccordionSummary>
      <AccordionDetails>
        {isError && <p style={{ color: 'crimson' }}>{(error as Error).message}</p>}
        {isLoading ? (
          <>
            <Skeleton className='skeleton-loader' animation="wave" variant="rounded" height={50} role="progressbar" />
            <Skeleton className='skeleton-loader' animation="wave" variant="rounded" height={50} role="progressbar" />
            <Skeleton className='skeleton-loader' animation="wave" variant="rounded" height={50} role="progressbar" />
          </>
        ) : <>
          {typeof data === 'object' && data !== null && Array.isArray(data) && data.length > 0 ? (
            data.map((repo) => (
              <div key={repo.id} className="card-repository">
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  <h3>{repo.name}</h3>
                </a>
                <p>{repo.description}</p>
                <p>
                  <span>{repo.stargazers_count}</span>
                  <StarIcon />
                </p>
              </div>
            ))
          ) : (
            <p>No repositories found for "{username}".</p>
          )}
        </>}
      </AccordionDetails>
    </Accordion>
  )
}
