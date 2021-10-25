import React from 'react';
import Axios from '../../../utils/axios';
import { Store } from '../../../utils/store';
import { useContext, useState, useReducer, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import LayoutFr from '../../../components/LayoutFr';
import NextLink from 'next/link';
import useStyles from '../../../utils/styles';
import {
	Button,
	Grid,
	Typography,
	Table,
	TableCell,
	TableContainer,
	ListItemText,
	TableBody,
	TableRow,
	TableHead,
	List,
	ListItem,
	Card,
	CircularProgress,
} from '@material-ui/core';

// REDUCER FUNCTION FOR STATE
function reducer(state, action) {
	switch (action.type) {
		case 'FETCH_REQUEST':
			return { ...state, error: '', loading: true };
		case 'FETCH_SUCCESS':
			return {
				...state,
				error: '',
				loading: false,
				orders: action.payload,
			};
		case 'FETCH_FAILED':
			return { ...state, error: action.payload, loading: false };
		default:
			return state;
	}
}

// --- COMPONENT DEFINITION --- //
function AdminOrders() {
	const router = useRouter();
	const { state } = useContext(Store);
	const classes = useStyles();
	const { userInfo } = state;
	const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
		loading: true,
		error: '',
		orders: [],
	});
	useEffect(() => {
		if (!userInfo) {
			router.push('/login?redirect=/orders');
		}
		async function fetchOrders() {
			try {
				dispatch({ type: 'FETCH_REQUEST' });
				const { data } = await Axios.get('/admin/orders', {
					headers: { authorization: `Bearer ${userInfo.token}` },
				});
				if (data.status === 200) {
					dispatch({ type: 'FETCH_SUCCESS', payload: data.orders });
				} else {
					dispatch({ type: 'FETCH_FAILED', payload: data.message });
				}
			} catch (error) {
				dispatch({ type: 'FETCH_FAILED', payload: error.message });
			}
		}
		fetchOrders();
	}, []);

	return (
		<LayoutFr title={`Order History`}>
			<Grid container spacing={1}>
				<Grid item md={3} xs={12}>
					<Card className={classes.section}>
						<List>
							<NextLink href='/admin/dashboard'>
								<ListItem button component='a'>
									<ListItemText primary='Admin Dashboard'></ListItemText>
								</ListItem>
							</NextLink>
							<NextLink href='/admin/orders'>
								<ListItem selected button component='a'>
									<ListItemText primary='Orders'></ListItemText>
								</ListItem>
							</NextLink>
							<NextLink href='/admin/products'>
								<ListItem button component='a'>
									<ListItemText primary='Products'></ListItemText>
								</ListItem>
							</NextLink>
							<NextLink href='/admin/users'>
								<ListItem selected button component='a'>
									<ListItemText primary='Users'></ListItemText>
								</ListItem>
							</NextLink>
						</List>
					</Card>
				</Grid>
				<Grid item md={9} xs={12}>
					<Card className={classes.section}>
						<List>
							<ListItem>
								<Typography variant='h1' component='h1'>
									Orders
								</Typography>
							</ListItem>
							<ListItem>
								{loading ? (
									<CircularProgress />
								) : error ? (
									<Typography
										variant='h2'
										component='h2'
										className={classes.error}
									>
										{error}
									</Typography>
								) : (
									<TableContainer>
										<Table>
											<TableHead>
												<TableRow>
													<TableCell>ID</TableCell>
													<TableCell>DATE</TableCell>
													<TableCell>USER</TableCell>
													<TableCell>TOTAL</TableCell>
													<TableCell>PAID</TableCell>
													<TableCell>
														DELIVERED
													</TableCell>
													<TableCell>
														ACTION
													</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{orders.map((order) => {
													return (
														<TableRow
															key={order._id}
														>
															<TableCell>
																{order._id}
															</TableCell>
															<TableCell>
																{order.user
																	? order.user
																			.name
																	: 'NOT PRESENT'}
															</TableCell>
															<TableCell>
																{
																	order.createdAt
																}
															</TableCell>
															<TableCell>
																{
																	order.totalAmount
																}
															</TableCell>
															<TableCell>
																{order.isPaid
																	? `paid ${order.paidAt}`
																	: 'not paid'}
															</TableCell>
															<TableCell>
																{order.isDelivered
																	? `delivered ${order.deliveredAt}`
																	: 'not delivered'}
															</TableCell>
															<TableCell>
																<Button
																	varaint='contained'
																	onClick={() => {
																		router.push(
																			`/admin/orders/${order._id}`
																		);
																	}}
																>
																	Details
																</Button>
															</TableCell>
														</TableRow>
													);
												})}
											</TableBody>
										</Table>
									</TableContainer>
								)}
							</ListItem>
						</List>
					</Card>
				</Grid>
			</Grid>
		</LayoutFr>
	);
}

export default dynamic(() => Promise.resolve(AdminOrders), { ssr: false });
