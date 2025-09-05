import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // custom
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // CUKUP HAPUS TOKEN
      localStorage.removeItem('user_token');
      // JANGAN redirect, biar logic FE yang handle
      // window.location.href = '/user/auth/login';
    }
    return Promise.reject(error); // error tetap dilempar ke .catch
  }
);

export default axiosClient;
