import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from './APIs/AuthRequests';

export default function Logout() {
	const navigate = useNavigate();
	useEffect(() => {
		logout().finally(() => {
			navigate('/login/');
		});
	}, []);
}
