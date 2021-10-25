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
	Card,
	CircularProgress,
} from '@material-ui/core';
import dynamic from 'next/dynamic';
import Cookies from 'js-cookie';
import NextLink from 'next/link';
import Image from 'next/image';
import LayoutFr from '../components/LayoutFr';
import CheckoutWizard from '../components/CheckoutWizard';
import { Store } from '../utils/store';
import { useContext, useState, useEffect } from 'react';
import { ACTIONS } from '../utils/store/actions';
import { useRouter } from 'next/router';
import useStyles from '../utils/styles';
import Axios from '../utils/axios';
import { useSnackbar } from 'notistack';
function PlaceOrder() {
	const classes = useStyles();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const { state, dispatch } = useContext(Store);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const {
		userInfo,
		cart: { cartItems, shippingAddress, paymentMethod },
	} = state;

	const format = (num) => {
		return Math.round(num * 100 + Number.EPSILON) / 100;
	};

	const itemsPrice = format(
		cartItems.reduce((acc, item) => {
			return acc + item.price * item.quantity;
		}, 0)
	);
	useEffect(() => {
		if (!paymentMethod) {
			router.push('/payment');
		}
		if (cartItems.length == 0) {
			router.push('/cart');
		}
	}, []);

	const taxPrice = format(itemsPrice * 0.15);
	const totalPrice = format(itemsPrice + taxPrice);
	console.log('innn', userInfo.token);
	async function placeOrderHandler(e) {
		closeSnackbar();
		try {
			setLoading(true);
			const { data } = await Axios.post(
				'/orders',
				{
					orderItems: cartItems,
					shippingAddress,
					totalAmount: totalPrice,
					taxAmount: taxPrice,
					itemsAmount: itemsPrice,
					paymentMethod: paymentMethod,
				},
				{
					headers: {
						authorization: `Bearer ${userInfo.token}`,
					},
				}
			);
			console.log('data', data);
			if (data.status === 201) {
				dispatch({ type: ACTIONS.clearCart });
				Cookies.remove('cartItems');
				setLoading(false);
				router.push(`orders/${data.order._id}`);
			} else {
				enqueueSnackbar(data.message, { variant: 'error' });
			}
		} catch (error) {
			setLoading(false);
			enqueueSnackbar(error.toString(), { variant: 'error' });
		}
	}
	return (
		<LayoutFr title='Place Order'>
			<CheckoutWizard activeStep={3} />

			<Typography component='h1' variant='h1'>
				Place Order
			</Typography>

			<Grid container spacing={1}>
				<Grid item md={9} xs={12}>
					<Card className={classes.section}>
						<List>
							<ListItem>
								<Typography component='h1' variant='h1'>
									Shipping Address
								</Typography>
							</ListItem>
							<ListItem>
								{shippingAddress.address},{shippingAddress.city}
								,{shippingAddress.postalCode},
								{shippingAddress.country}
							</ListItem>
						</List>
					</Card>
					<Card className={classes.section}>
						<List>
							<ListItem>
								<Typography component='h1' variant='h1'>
									Payment Method
								</Typography>
							</ListItem>
							<ListItem>{paymentMethod}</ListItem>
						</List>
					</Card>
					<Card className={classes.section}>
						<List>
							<ListItem>
								<Typography component='h1' variant='h1'>
									Order Items
								</Typography>
							</ListItem>
							<ListItem>
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
											</TableRow>
										</TableHead>
										<TableBody>
											{cartItems.map((item, idx) => {
												return (
													<TableRow key={idx}>
														<TableCell>
															<NextLink
																href={`/product/${item.slug}`}
																passHref
															>
																<Link>
																	<Image
																		src={
																			item.image
																		}
																		alt={
																			item.name
																		}
																		width={
																			50
																		}
																		height={
																			50
																		}
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
															<Typography>
																{item.quantity}
															</Typography>
														</TableCell>
														<TableCell align='right'>
															<Typography>
																{`${item.price}`}
															</Typography>
														</TableCell>
														<TableCell align='right'></TableCell>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								</TableContainer>
							</ListItem>
						</List>
					</Card>
				</Grid>
				<Grid item md={3} xs={12}>
					<Card className={classes.section}>
						<List>
							<ListItem>
								<Typography variant='h2' component='h2'>
									Order Summary
								</Typography>
							</ListItem>
							<ListItem>
								<Grid container>
									<Grid item xs={6}>
										Items:
									</Grid>
									<Grid item xs={6}>
										<Typography align='right'>
											{`$${itemsPrice}`}
										</Typography>
									</Grid>
								</Grid>
							</ListItem>
							<ListItem>
								<Grid container>
									<Grid item xs={6}>
										Tax:
									</Grid>
									<Grid item xs={6}>
										<Typography align='right'>
											{`$${taxPrice}`}
										</Typography>
									</Grid>
								</Grid>
							</ListItem>
							<ListItem>
								<Grid container>
									<Grid item xs={6}>
										<Typography>
											<strong>Total:</strong>
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography align='right'>
											<strong>{`$${totalPrice}`}</strong>
										</Typography>
									</Grid>
								</Grid>
							</ListItem>
							<ListItem>
								<Button
									onClick={placeOrderHandler}
									variant='contained'
									color='primary'
								>
									Place Order
								</Button>
							</ListItem>
							{loading && (
								<ListItem>
									<CircularProgress />
								</ListItem>
							)}
						</List>
					</Card>
				</Grid>
			</Grid>
		</LayoutFr>
	);
}
export default dynamic(() => Promise.resolve(PlaceOrder), { ssr: false });
