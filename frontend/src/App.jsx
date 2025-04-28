import { Route, Switch } from 'wouter';
import './app.css'
import Header from './components/Header';
import Homepage from './components/Homepage';
import Login from './components/Login';
import Footer from './components/Footer';

export default function App() {
	return (
		<>
			<Header />
			<Switch>
				<Route path='/' component={Homepage} />

				<Route path='/login/' component={Login} />

				{/* <Route path='/about/' component={About} /> */}

				{/* <Route path='/detail/:id'>{(props) => <Detail product={products.find((product) => product.id == props.id)} />}</Route> */}

				<Route>404: No such page!</Route>
			</Switch>
			<Footer />
		</>
	);
}
