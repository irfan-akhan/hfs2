import {
	Button,
	Grid,
	Link,
	Typography,
	Table,
	TableCell,
	TableContainer,
	TableBody,
	TableRow,
	TableHead,
	Select,
	MenuItem,
	List,
	ListItem,
} from '@material-ui/core';

import NextLink from 'next/link';
import Image from 'next/image';
import LayoutFr from '../components/LayoutFr';
import { Store } from '../utils/store';
import { useContext } from 'react';
import { ACTIONS } from '../utils/store/actions';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

function CartScreen() {
	const router = useRouter();
	const { state, dispatch } = useContext(Store);
	const {
		cart: { cartItems },
	} = state;

	function updateQuantityHandler(productId, quantity) {
		dispatch({
			type: ACTIONS.updateProductQuantity,
			payload: { productId: productId, quantity: quantity },
		});
	}
	function removeFromCartHandler(product) {
		dispatch({ type: ACTIONS.removeFromCart, payload: product });
	}
	function checkoutHandler() {
		router.push('/shipping');
	}
	return (
		<LayoutFr title='Shopping Cart'>
			<Typography component='h1' variant='h1'>
				Shopping Cart
			</Typography>
			{cartItems.length === 0 ? (
				<div>
					<Typography component='h2'>
						Shopping Cart is Empty
						<NextLink href='/'>Shop Now</NextLink>
					</Typography>
				</div>
			) : (
				<Grid container spacing={1}>
					<Grid item md={9} xs={12}>
						<TableContainer>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>Image</TableCell>
										<TableCell>Name</TableCell>
										<TableCell align='right'>
											Quantity
										</TableCell>
										<TableCell align='right'>
											Price
										</TableCell>
										<TableCell align='right'>
											Action
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{cartItems.map((item, idx) => {
										return (
											<TableRow key={idx}>
												{console.log('slllllll', item)}
												<TableCell>
													<NextLink
														href={`/product/${item.slug}`}
														passHref
													>
														<Link>
															<Image
																src={item.image}
																alt={item.name}
																width={50}
																height={50}
															></Image>
														</Link>
													</NextLink>
												</TableCell>
												<TableCell>
													<Typography color='primary'>
														{item.name}
													</Typography>
												</TableCell>
												<TableCell align='right'>
													<Select
														value={item.quantity}
														onChange={(e) => {
															updateQuantityHandler(
																item._id,
																e.target.value
															);
														}}
													>
														{[
															1, 1, 1, 1, 1, 1, 1,
															1, 1,

															1,
														].map((item, idx) => (
															<MenuItem
																key={++idx}
																value={++idx}
															>
																{++idx}
															</MenuItem>
														))}
													</Select>
												</TableCell>
												<TableCell align='right'>
													{`${item.price}`}
												</TableCell>
												<TableCell align='right'>
													<Button
														varaint='contained'
														color='secondary'
														onClick={() =>
															removeFromCartHandler(
																item
															)
														}
													>
														X
													</Button>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</TableContainer>
					</Grid>
					<Grid item md={3} xs={12}>
						<List>
							<ListItem>
								<Typography>
									Cart Items {cartItems.length}
								</Typography>
							</ListItem>
							<ListItem>
								<Button
									variant='contained'
									color='primary'
									onClick={checkoutHandler}
								>
									Checkout
								</Button>
							</ListItem>
						</List>
					</Grid>
				</Grid>
			)}
		</LayoutFr>
	);
}

export default dynamic(() => Promise.resolve(CartScreen), { ssr: false });
