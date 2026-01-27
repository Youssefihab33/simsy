export default function LoadingSpinner({ small = false }) {
	if (small) {
		return <div className='spinner-grow spinner-grow-sm primaryColor' role='status' />;
	}

	return (
		<div className='d-flex justify-content-center align-items-center vh-100'>
			<div className='spinner-grow primaryColor mx-3 me-5'>
				<div className='spinner-grow tertiaryColor mx-3'>
					<div className='spinner-grow secondaryColor mx-3'></div>
				</div>
			</div>
		</div>
	);
}
