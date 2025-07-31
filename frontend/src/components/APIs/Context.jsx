import { useNavigate } from 'react-router-dom';
import { createContext, useState, useEffect } from 'react';
import { useLocalStorage } from 'react-use';

import LoadingSpinner from '../snippets/LoadingSpinner';
import axiosInstance from './Axios';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const res = await axiosInstance.get('/users/user_info/');
				setUserData(res.data);
			} catch (err) {
				if (err.response && err.response.status === 401) {
					// Handle 401 Unauthorized specifically
					console.warn('User not authenticated. Redirecting to login.');
					// navigate('/login/');
				} else {
					// Handle other errors
					console.error('Error fetching user data:', err);
				}
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
	}, [navigate]);

	if (loading) return <LoadingSpinner />;

	return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
};
