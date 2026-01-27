import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Fade, Box } from '@mui/material';
import { lazy, Suspense } from 'react';
import './app.css';

import { UserProvider } from './components/APIs/Context';
import ProtectedRoutes from './components/APIs/ProtectedRoutes';

import Header from './components/snippets/Header';
import Footer from './components/snippets/Footer';
import LoadingSpinner from './components/snippets/LoadingSpinner';

// Lazy load route components for better initial load performance
const Homepage = lazy(() => import('./components/Homepage'));
const Artist = lazy(() => import('./components/Artist'));
const Country = lazy(() => import('./components/Country'));
const Show = lazy(() => import('./components/Show'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
const Register = lazy(() => import('./components/Register'));
const Login = lazy(() => import('./components/Login'));
const Logout = lazy(() => import('./components/Logout'));
const Profile = lazy(() => import('./components/Profile'));

const PageLoader = () => (
	<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
		<LoadingSpinner />
	</Box>
);

const theme = createTheme({
	palette: {
		primary: { main: '#9a0606' },
		secondary: { main: '#5dd95d' },
		tertiary: { main: '#54a9de' },
		favorite: { main: '#D4AF37' },
		watchlist: { main: '#0dcaf0' },
	},
	components: {
		MuiTooltip: {
			defaultProps: {
				TransitionComponent: Fade,
				TransitionProps: { timeout: 300 },
				enterTouchDelay: 0,
			},
		},
	},
});

export default function App() {
	return (
		<ThemeProvider theme={theme}>
			<UserProvider>
				<Header />
				<Suspense fallback={<PageLoader />}>
					<Routes>
						{/* Public Routes */}
						<Route path='/register/' element={<Register />} />
						<Route path='/login/' element={<Login />} />
						<Route path='/logout/' element={<Logout />} />
						<Route path='/forgot-password/' element={<ForgotPassword />} />
						<Route path='/reset-password/:token' element={<ResetPassword />} />

						{/* Protected Routes */}
						<Route element={<ProtectedRoutes />}>
							<Route path='/' element={<Homepage />} />
							<Route path='/artist/:artist_id' element={<Artist />} />
							<Route path='/country/:country_id' element={<Country />} />
							<Route path='/show/:show_id' element={<Show />} />
							<Route path='/profile' element={<Profile />} />
						</Route>
					</Routes>
				</Suspense>
				<Footer />
			</UserProvider>
		</ThemeProvider>
	);
}
