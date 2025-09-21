import { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query'
import CircularProgress from '@mui/material/CircularProgress';
import './App.scss'

const SearchForm = lazy(() => import('./components/SearchForm'));
const UserList   = lazy(() => import('./components/UserList'));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div><CircularProgress /><br />Loading…</div>}>
        <SearchForm />
        <UserList />
      </Suspense>
    </QueryClientProvider>
  )
}

export default App
