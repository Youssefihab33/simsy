import { Routes, Route, useLocation } from 'react-router-dom';
import './app.css';
import ProtectedRoutes from './components/ProtectedRoutes';
import Header from './components/Header';
import Homepage from './components/Homepage';
import Register from './components/Register';
import Login from './components/Login';
import Footer from './components/Footer';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

export default function App() {
	const location = useLocation();
	// const noNavbar = ['/register/', '/login/'];

	return (
		<>
			<Header />
			<Routes>
				<Route path='/login/' element={<Login />} />
				<Route path='/register/' element={<Register />} />
				<Route path='/forgot-password/' element={<ForgotPassword />} />
				<Route path='/reset-password/:token' element={<ResetPassword />} />

				<Route element={<ProtectedRoutes />}>
					<Route path='/' element={<Homepage />} />
					{/* <Route path='/about' element={<About />} /> */}
				</Route>

			</Routes>
			<Footer />
		</>
	);
}
