import React from 'react';
import { Box } from '@mui/material';

export default function AnimatedFace({ state = 'default' }) {
	// state can be: 'default', 'typing', 'hiding'

	const isHiding = state === 'hiding';
	const isTyping = state === 'typing';

	return (
		<Box
			sx={{
				width: 100,
				height: 100,
				margin: '0 auto 20px',
				position: 'relative',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<svg width='100' height='100' viewBox='0 0 100 100'>
				{/* Face Background */}
				<circle cx='50' cy='50' r='45' fill='rgba(255, 255, 255, 0.05)' stroke='rgba(255, 255, 255, 0.2)' strokeWidth='2' />

				{/* Eyes */}
				<g style={{ transition: 'transform 0.3s ease' }} transform={isTyping ? 'translate(0, 5)' : 'translate(0, 0)'}>
					{/* Left Eye */}
					<g transform='translate(35, 45)'>
						{isHiding ?
							<path d='M-8,0 Q0,8 8,0' fill='none' stroke='white' strokeWidth='3' strokeLinecap='round' />
						:	<>
								<circle r='8' fill='white' opacity='0.2' />
								<circle r='4' fill='white' style={{ transition: 'transform 0.2s ease' }} transform={isTyping ? 'translate(2, 2)' : 'translate(0, 0)'} />
							</>
						}
					</g>

					{/* Right Eye */}
					<g transform='translate(65, 45)'>
						{isHiding ?
							<path d='M-8,0 Q0,8 8,0' fill='none' stroke='white' strokeWidth='3' strokeLinecap='round' />
						:	<>
								<circle r='8' fill='white' opacity='0.2' />
								<circle r='4' fill='white' style={{ transition: 'transform 0.2s ease' }} transform={isTyping ? 'translate(-2, 2)' : 'translate(0, 0)'} />
							</>
						}
					</g>
				</g>

				{/* Mouth */}
				<path
					d={isHiding ? 'M40,70 Q50,65 60,70' : isTyping ? 'M40,70 Q50,75 60,70' : 'M40,70 Q50,72 60,70'}
					fill='none'
					stroke='white'
					strokeWidth='3'
					strokeLinecap='round'
					style={{ transition: 'd 0.3s ease' }}
				/>

				{/* Hands (only visible when hiding) */}
				<g style={{ opacity: isHiding ? 1 : 0, transition: 'opacity 0.3s ease, transform 0.3s ease' }} transform={isHiding ? 'translate(0, 0)' : 'translate(0, 20)'}>
					<circle cx='30' cy='50' r='12' fill='rgba(255, 255, 255, 0.1)' stroke='rgba(255, 255, 255, 0.3)' strokeWidth='1' />
					<circle cx='70' cy='50' r='12' fill='rgba(255, 255, 255, 0.1)' stroke='rgba(255, 255, 255, 0.3)' strokeWidth='1' />
				</g>
			</svg>
		</Box>
	);
}
