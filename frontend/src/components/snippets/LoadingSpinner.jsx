import { Box, CircularProgress } from '@mui/material';
import { useTitle } from 'react-use';

export default function LoadingSpinner({ small = false }) {
	useTitle('Loading - SIMSY')
	if (small) {
		return <CircularProgress size={20} sx={{ color: '#9a0606' }} />;
	}

	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
			}}
		>
			<Box sx={{ display: 'flex', gap: 2 }}>
				<CircularProgress sx={{ color: '#9a0606' }} size={40} />
				<CircularProgress sx={{ color: '#54a9de' }} size={40} />
				<CircularProgress sx={{ color: '#5dd95d' }} size={40} />
			</Box>
		</Box>
	);
}
