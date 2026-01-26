import { UserContext } from '../APIs/Context';
import { useContext } from 'react';

export default function Footer() {
	const currentYear = new Date().getFullYear();
	const user = useContext(UserContext);

	const lastLogin = user?.last_login ? new Date(user.last_login).toDateString() : 'N/A';
	const joinYear = user?.date_joined ? new Date(user.date_joined).toDateString() : 'N/A';

	const getDaysUntilBirthday = (birthdayStr) => {
		if (!birthdayStr) return 'N/A';

		const today = new Date();
		const birthday = new Date(birthdayStr);

		birthday.setFullYear(today.getFullYear());

		if (today > birthday) {
			birthday.setFullYear(today.getFullYear() + 1);
		}

		const diffInMs = birthday - today;
		return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
	};

	const days_till_bd = getDaysUntilBirthday(user?.birthday);

	return (
		<footer>
			<hr className='m-4' />
			<div className='container-lg d-flex flex-wrap'>
				<p className='col-lg-4'>
					© SIMSY - {currentYear}
					<br/>
					Enjoy your time here!❤️
				</p>

				<p className='col-lg-4 text-center'>
					🟢 Last Login: {lastLogin}
					<br />
					📅 Joined on {joinYear}
					<br />
					🎂 {days_till_bd} days till your BD!
				</p>

				<p className='col-lg-4 text-end'>
					🪪 {user?.first_name} {user?.last_name}
					<br/>
					💌 {user?.username} {user?.nickname}
					<br/>
					📧 {user?.email}
				</p>
			</div>
		</footer>
	);
}
