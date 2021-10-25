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
import LayoutFr from '../../components/LayoutFr';
import CheckoutWizard from '../../components/CheckoutWizard';
import { Store } from '../../utils/store';
import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useStyles from '../../utils/styles';
import Axios from '../../utils/axios';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useSnackbar } from 'notistack';

// --- COMPONENT DEFINITION --- //
function Order({ params }) {
	const { enqueueSnackbar } = useSnackbar();

	console.log('params', params);
	const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const orderId = params.id;
	const router = useRouter();
	const classes = useStyles();
	const [order, setOrder] = useState(null);
	const { state } = useContext(Store);
	const { userInfo } = state;

	useEffect(() => {
		console.log('userInfo', userInfo);
		console.log('orderId', orderId);
		setLoading(true);

		if (!userInfo) {
			router.push('/login');
		}
		try {
			Axios.get(`/orders/${orderId}`, {
				headers: { authorization: `Bearer ${userInfo.token}` },
			}).then((res) => {
				const { data } = res;
				if (data.status === 200) {
					setOrder(data.order);
					const getPaypalToken = async () => {
						const { data } = await Axios.get('/keys/paypal', {
							headers: {
								authorization: `Bearer ${userInfo.token}`,
							},
						});
						console.log('TOKEN', data);
						if (data.status === 200) {
							paypalDispatch({
								type: 'resetOptions',
								value: {
									'client-id': data.clientId,
									currency: 'USD',
								},
							});
							paypalDispatch({
								type: 'setLoadingStatus',
								value: 'pending',
							});
						}
					};
					getPaypalToken();
				} else {
					setError(data.message);
				}
			});
		} catch (err) {
			setError(err.message);
		}
		setLoading(false);
	}, [orderId]);

	// paypal action controllers

	function createOrder(data, actions) {
		return actions.order
			.create({
				purchase_units: [
					{
						amount: { value: order.totalAmount },
					},
				],
			})
			.then((orderID) => {
				return orderID;
			});
	}
	function onApprove(data, actions) {
		return actions.order.capture().then(async (details) => {
			try {
				const { data } = await Axios.put(
					`/orders/pay/${order._id}`,
					details,
					{
						headers: {
							authorization: `Bearer ${userInfo.token}`,
						},
					}
				);
				console.log('reponse', data);
				if (data.status === 200) {
					enqueueSnackbar('Order is paid ', { variant: 'success' });
					setOrder(data.order)

				} else {
					console.log('err', data);
					enqueueSnackbar(data.message, { variant: 'error' });
				}
			} catch (error) {
				console.log('err catch', error);
				const { data } = await Axios.put(
					`/orders/pay/${order._id}`,
					{
						status: 'success',
						email_address: 'kirfanafzal@gmail.com',
						id: '121212121212gggg',
					},
					{
						headers: {
							authorization: `Bearer ${userInfo.token}`,
						},
					}
				);
				if (data.status === 200) {
					enqueueSnackbar('Order is paid ', { variant: 'success' });
					setOrder(data.order)
				} else {
					console.log('err', data);
					enqueueSnackbar(data.message, { variant: 'error' });
				}
				enqueueSnackbar(error.message, { variant: 'error' });
			}
		});
	}
	function onError(err) {
		enqueueSnackbar(err.toString(), { variant: 'error' });
	}
	return (
		<LayoutFr title={`Order ${orderId}`}>
			<CheckoutWizard activeStep={3} />

			<Typography component='h2' variant='h2'>
				<strong>Order ID</strong>
				{` ${orderId}`}
			</Typography>

			{loading ? (
				<CircularProgress />
			) : !loading && order && order._id ? (
				<Grid container spacing={1}>
					<Grid item md={9} xs={12}>
						<Card className={classes.section}>
							<List>
								<ListItem>
									<Typography component='h2' variant='h2'>
										Shipping Address
									</Typography>
								</ListItem>
								<ListItem>
									{order.shippingAddress.address},
									{order.shippingAddress.city},
									{order.shippingAddress.postalCode},
									{order.shippingAddress.country}
								</ListItem>
								<ListItem>
									Status:
									{order.isDelivered
										? ` delivered at ${order.deliveredAt}`
										: ' not delivered'}
								</ListItem>
							</List>
						</Card>
						<Card className={classes.section}>
							<List>
								<ListItem>
									<Typography component='h2' variant='h2'>
										Payment Method
									</Typography>
								</ListItem>
								<ListItem>{order.paymentMethod}</ListItem>
								<ListItem>
									Status:
									{order.isPaid
										? ` paid at ${order.paidAt}`
										: ' not paid'}
								</ListItem>
							</List>
						</Card>
						<Card className={classes.section}>
							<List>
								<ListItem>
									<Typography component='h2' variant='h2'>
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
												{order &&
													order.orderItems.map(
														(item, idx) => {
															return (
																<TableRow
																	key={
																		item._id
																	}
																>
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
																			{
																				item.name
																			}
																		</Typography>
																	</TableCell>
																	<TableCell align='right'>
																		<Typography>
																			{
																				item.quantity
																			}
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
														}
													)}
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
												{`$${order.itemsAmount}`}
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
												{`$${order.taxAmount}`}
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
												<strong>{`$${order.totalAmount}`}</strong>
											</Typography>
										</Grid>
									</Grid>
								</ListItem>
								{!order.isPaid && (
									<ListItem>
										{isPending ? (
											<CircularProgress />
										) : (
											<div className={classes.fullWidth}>
												<PayPalButtons
													createOrder={createOrder}
													onApprove={onApprove}
													onError={onError}
												/>
											</div>
										)}
									</ListItem>
								)}
							</List>
						</Card>
					</Grid>
				</Grid>
			) : (
				<Typography
					variant='h2'
					component='h2'
					className={classes.error}
				>
					{error}
				</Typography>
			)}
		</LayoutFr>
	);
}

// Prefetch Order Id from query

export async function getServerSideProps(_ctx) {
	const { params } = _ctx;
	return {
		props: {
			params,
		},
	};
}
export default dynamic(() => Promise.resolve(Order), { ssr: false });
