// This file is not using the useLocalStorage hook because it does not contain any function to summon the hook in...
import axios from 'axios';

const backendBaseUrl =
	import.meta.env.VITE_APP_ENV === 'production'
		? '/api/' // For Dockerized production, Nginx will proxy /api/
		: import.meta.env.VITE_BACKEND_URL; // For local development

const axiosInstance = axios.create({
	baseURL: backendBaseUrl,
	timeout: 45000, // Set a timeout of n seconds
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

axiosInstance.interceptors.request.use((config) => {
	const token = localStorage.getItem('auth_token');
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
			localStorage.removeItem('auth_token');
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;
