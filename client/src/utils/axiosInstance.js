import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true, 
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response && (response.status === 401 || response.status === 403)) {
      const navigate = useNavigate();
      localStorage.removeItem('token');
      document.cookie = 'token=; Max-Age=0;';

      navigate('/login');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
