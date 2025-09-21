import http from '../http';

export default {
  getListUsers: function (user: string | null, perPage: number = 5) {
    const params = user ? `?q=${user}+in:login&per_page=${perPage}` : `?per_page=${perPage}`;
    return http.get(`https://api.github.com/search/users${params}`);
  },
  getRepositoriesByUser: function (username: string) {
    return http.get(`https://api.github.com/users/${username}/repos`);
  }
}
