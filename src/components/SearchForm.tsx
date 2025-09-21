import { useForm, type SubmitHandler } from 'react-hook-form';
import { useGithubStore } from '../stores/github';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

type FormValues = {
  search: string;
};

export default function SearchForm() {
  const githubStore = useGithubStore() as { setUsername: (username: string) => void };
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const onSubmit: SubmitHandler<FormValues> = (data) => githubStore.setUsername(data.search.trim());

  return (
    <form className="search-form" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="Search"
        variant="outlined"
        className="search-field"
        fullWidth
        {...register("search", { required: true })}
        error={!!errors.search}
        helperText={errors.search ? 'This field is required' : ''}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        className="search-button"
        fullWidth
      >Search</Button>
    </form>
  );
}
