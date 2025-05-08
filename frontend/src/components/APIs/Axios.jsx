import axios from 'axios';

const baseURL = 'http://127.0.0.1:8000';

const axiosInstance = axios.create({
	baseURL: baseURL,
	timeout: 5000, // Set a timeout of n seconds
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
})

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if(token){
            config.headers.Authorization = `Token ${token}`
        }
        else{
            config.headers.Authorization = ''
        }
        return config;
    }
)

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response.status === 401) {
            localStorage.removeItem('token')
        }
        return Promise.reject(error);
    }
)

export default axiosInstance;