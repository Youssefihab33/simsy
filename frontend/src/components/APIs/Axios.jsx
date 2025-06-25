import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
	timeout: 45000, // Set a timeout of n seconds
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

axiosInstance.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Token ${token}`;
	} else {
		config.headers.Authorization = '';
	}
	return config;
});

axiosInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response.status === 401) {
			localStorage.removeItem('token');
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;
