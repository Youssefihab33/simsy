import axios from 'axios';

const baseURL = 'http://127.0.0.1:8000';

const axiosInstance = axios.create({
	baseURL: baseURL,
	timeout: 5000, // Set a timeout of n seconds
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // 'Authorization': `Bearer ${local Storage.getItem('access_token')}`, // Add your token here
    }
})
export default axiosInstance;