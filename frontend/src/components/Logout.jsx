import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocalStorage } from 'react-use';
import { logout } from './APIs/AuthRequests';

import LoadingSpinner from './snippets/LoadingSpinner';

export default function Logout() {
	const [token, setToken, removeToken] = useLocalStorage('auth_token');
	const navigate = useNavigate();
	useEffect(() => {
		logout(token, removeToken).finally(() => {
			navigate('/login/');
		});
	}, [navigate, token, removeToken]);
	return <LoadingSpinner />;
}
