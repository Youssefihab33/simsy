import { useNavigate } from 'react-router-dom';
import $ from 'jquery';

export default function ShowCard({
	show = {
		id: 1,
		kind: 'film',
		year: 2023,
		languages: ['English'],
		countries: ['USA'],
		genres: ['Drama', 'Action'],
		rating: 8.5,
		captions: true,
		favorites: [],
		watchlist: [],
		updated: '2023-10-01T12:00:00Z',
		name: 'Show Name',
		sample: false,
		description: 'This is a brief description of the show.',
		image: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fencrypted-tbn0.gstatic.com%2Fimages%3Fq%3Dtbn%3AANd9GcQCAVNHSTMg1kboB9nLrl_xjF7cJQJsjj8fNPqkYwb8pc_mmpe9&psig=AOvVaw1drnveOAIfTpaxcIltJK22&ust=1750255082518000&source=images&cd=vfe&opi=89978449&ved=0CBAQjRxqFwoTCIjzsrXO-I0DFQAAAAAdAAAAABAE',
	},
}) {
	const navigate = useNavigate();

	function toggle_favorite(show_id) {
		$.ajax({
			type: 'GET',
			url: "/toggle_fav/",
			data: {
				showID: show_id,
			},
			success: function (data) {
				if (data.status == 500) {
					alert(data.message);
				}
				if (data.current_state == true) {
					$(`[id=favoriteBtn${show_id}]`).each(function () {
						$(this).removeclassName('text-secondary').addclassName('text-warning');
					});
				} else if (data.current_state == false) {
					$(`[id=favoriteBtn${show_id}]`).each(function () {
						$(this).removeclassName('text-warning').addclassName('text-secondary');
					});
				}
			},
		});
	}

	function toggle_watchlist(show_id) {
		$.ajax({
			type: 'GET',
			url: "/toggle_watchlist/",
			data: {
				showID: show_id,
			},
			success: function (data) {
				if (data.status == 500) {
					alert(data.message);
				}
				if (data.current_state == true) {
					$(`[id=watchlistBtn${show_id}]`).each(function () {
						$(this).removeclassName('text-secondary').addclassName('text-info');
					});
				} else if (data.current_state == false) {
					$(`[id=watchlistBtn${show_id}]`).each(function () {
						$(this).removeclassName('text-info').addclassName('text-secondary');
					});
				}
			},
		});
	}

	return (
		<>
			<div className='card d-inline-flex text-center text-light bg-transparent border-0 m-1'>
				<div className='showCard-container'>
					<div className='showCard'>
						<div className='showCard-front bg-dark img-container' onClick={() => navigate(`/show/${show.id}`)}>
							{show.sample && (
								<div className='ribbon ribbon-top-left'>
									<span>Sample</span>
								</div>
							)}
							<img className='showCard-image d-block' src={show.image} alt={show.name} />
							<div className='showCard-front-textbox'>
								<div className='showCard-front-text'>{show.name}</div>
							</div>
						</div>
						<div
							className='showCard-transparent-overlay'
							// onClick={(event) => {
							// 	event.stopPropagation();
							// 	event.stopDefault();
							// }}
						>
							{show.captions && <i className='bi-badge-cc me-1'></i>}
							<span
								id='favoriteBtn{{show.id}}'
								onClick={toggle_favorite(show.id)}
								className='bi-star-fill {% if request.user in show.favorites.all %}text-warning{% else %}text-secondary{% endif %} me-1'
							></span>
							<span
								id='watchlistBtn{{show.id}}'
								onClick={toggle_watchlist(show.id)}
								className='bi-watch {% if request.user in show.watchlist.all %}text-info{% else %}text-secondary{% endif %} me-1'
							></span>
							<span
								id='info{{show.id}}target'
								className='bi-info-circle me-1'
								tabIndex='0'
								style={{ cursor: 'help' }}
								data-bs-toggle='popover'
								data-bs-trigger='hover focus'
								data-bs-title='This Should Be Replaced By JavaScript!'
							></span>
						</div>
					</div>
				</div>
			</div>

			<div id='info{{show.id}}' className='d-none'>
				{/* id#{{show.id}} | {{show.kind|capfirst}} | {{show.year}}</br></br>
    {% for language in show.languages.all %}{% if forloop.counter > 1 %}, {% endif %}<span>{{language}}</span>{% endfor %}</br></br>
    {% for country in show.countries.all %}{% if forloop.counter > 1 %}, {% endif %}<span>{{country}}</span>{% endfor %}</br></br>
    {% for genre in show.genres.all %}{% if forloop.counter > 1 %}, {% endif %}{{genre}}{% endfor %}<br/></br>
    {{show.rating}}
    <hr> */}
				{/* <small className="text-muted">Last Edited {{show.updated|timesince}} ago</small><br/> */}
			</div>
		</>
	);
}

{
	/* <style>

</style>

{% for show in shows %}
<script>
    $(document).ready(function() {
        var options = {
            html: true,
            title: "{{show.name}}",
            content: $('[id=info{{show.id}}]').html()
        }
        $('[id=info{{show.id}}target]').each(function(){var popover = new bootstrap.Popover($(this), options)})
    });
</script>
{% endfor %}
<script>
    
</script>
 */
}

// import Card from '@mui/material/Card';
// import CardActions from '@mui/material/CardActions';
// import CardContent from '@mui/material/CardContent';
// import CardMedia from '@mui/material/CardMedia';
// import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';

// export default function ShowCard({ showName = "Show Name", showDescription = "This is a brief description of the show.", showImage = "https://www.google.com/url?sa=i&url=https%3A%2F%2Fencrypted-tbn0.gstatic.com%2Fimages%3Fq%3Dtbn%3AANd9GcQCAVNHSTMg1kboB9nLrl_xjF7cJQJsjj8fNPqkYwb8pc_mmpe9&psig=AOvVaw1drnveOAIfTpaxcIltJK22&ust=1750255082518000&source=images&cd=vfe&opi=89978449&ved=0CBAQjRxqFwoTCIjzsrXO-I0DFQAAAAAdAAAAABAE" }) {
//   return (
//     <Card sx={{ maxWidth: 250 }}>
//       <CardMedia
//         sx={{ height: 300 }}
//         image= {showImage}
//         title={showName}
//       />
//       <CardContent>
//         <Typography gutterBottom variant="h5" component="div">
//           {showName}
//         </Typography>
//         <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//           {showDescription}
//         </Typography>
//       </CardContent>
//       <CardActions>
//         <Button size="small">Details</Button>
//       </CardActions>
//     </Card>
//   );
// }
