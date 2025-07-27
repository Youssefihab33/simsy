import { useLocalStorage } from 'react-use';
import axiosInstance from './Axios';

export async function logout() {
	const [token, setToken, removeToken] = useLocalStorage('auth_token', null, { raw: true });

	if (!token) {
		return;
	} else {
		axiosInstance
			.post('/auth/logout/')
			.then(() => {
				removeToken();
				window.location.reload();
			})
			.catch((error) => {
				alert('Logout failed!', error);
				console.error('Logout error:', error);
			});
	}
}
