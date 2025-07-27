import { Outlet, Navigate } from 'react-router-dom';
import { useLocalStorage } from 'react-use';
const ProtectedRoutes = () => {
	const [token] = useLocalStorage('auth_token', null, { raw: true });
	return token ? <Outlet /> : <Navigate to='/login' />;
};
export default ProtectedRoutes;
