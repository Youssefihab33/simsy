import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'react-use';
import { UserContext } from './APIs/Context';
import axiosInstance from './APIs/Axios';
import LoadingSpinner from './snippets/LoadingSpinner';

export default function Logout() {
	const { setUser } = useContext(UserContext);
	const navigate = useNavigate();

	const [, , removeToken] = useLocalStorage('auth_token', null, { raw: true });

	useEffect(() => {
		const performLogout = async () => {
			try {
				await axiosInstance.post('/auth/logout/');
			} catch (error) {
				// We log the error but continue cleaning up locally so the user isn't "stuck" logged in
				console.error('Backend logout failed, proceeding with local cleanup', error);
			} finally {
				removeToken();
				setUser(null);
				navigate('/login/', { replace: true });
			}
		};

		performLogout();
	}, [navigate, removeToken, setUser]);

	// Show the spinner while the cleanup logic is running
	return <LoadingSpinner />;
}
