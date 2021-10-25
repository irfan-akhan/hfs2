import React from 'react';
import Axios from '../../utils/axios';
import { Store } from '../../utils/store';
import { useContext, useState, useReducer, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import LayoutFr from '../../components/LayoutFr';
import NextLink from 'next/link';
import useStyles from '../../utils/styles';
import { Bar } from 'react-chartjs-2';
import {
	Button,
	Grid,
	Typography,
	ListItemText,
	List,
	ListItem,
	Card,
	CardActions,
	CardContent,
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
				summary: action.payload,
			};
		case 'FETCH_FAILED':
			return { ...state, error: action.payload, loading: false };
		default:
			return state;
	}
}

// --- COMPONENT DEFINITION --- //
function AdminDashboard() {
	const router = useRouter();
	const { state } = useContext(Store);
	const classes = useStyles();
	const { userInfo } = state;
	const [{ loading, error, summary }, dispatch] = useReducer(reducer, {
		loading: true,
		error: '',
		summary: { salesData: [] },
	});
	useEffect(() => {
		if (!userInfo) {
			router.push('/login?redirect=/orders');
		}
		async function fetchData() {
			try {
				dispatch({ type: 'FETCH_REQUEST' });
				const { data } = await Axios.get('/admin/summary', {
					headers: { authorization: `Bearer ${userInfo.token}` },
				});
				if (data.status === 200) {
					dispatch({ type: 'FETCH_SUCCESS', payload: data.data });
				} else {
					dispatch({ type: 'FETCH_FAILED', payload: data.message });
				}
			} catch (error) {
				dispatch({ type: 'FETCH_FAILED', payload: error.message });
			}
		}
		fetchData();
	}, []);

	return (
		<LayoutFr title={`Admin Dashboard`}>
			<Grid container spacing={1}>
				<Grid item md={3} xs={12}>
					<Card className={classes.section}>
						<List>
							<NextLink href='/admin/dashboard'>
								<ListItem selected button component='a'>
									<ListItemText>Admin Dashboard</ListItemText>
								</ListItem>
							</NextLink>
							<NextLink href='/admin/orders'>
								<ListItem button component='a'>
									<ListItemText>Orders</ListItemText>
								</ListItem>
							</NextLink>
							<NextLink href='/admin/products'>
								<ListItem button component='a'>
									<ListItemText>Products</ListItemText>
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
								{loading ? (
									<CircularProgress />
								) : error ? (
									<Typography className={classes.error}>
										{error}
									</Typography>
								) : (
									<Grid container spacing={5}>
										<Grid item md={3}>
											<Card raised>
												<CardContent>
													<Typography variant='h1'>
														{`$${summary.ordersPrice}`}
													</Typography>
													<Typography>
														sales
													</Typography>
													<CardActions>
														<NextLink
															href='admin/orders'
															passHref
														>
															<Button
																size='small'
																color='primary'
															>
																View sales
															</Button>
														</NextLink>
													</CardActions>
												</CardContent>
											</Card>
										</Grid>
										<Grid item md={3}>
											<Card raised>
												<CardContent>
													<Typography variant='h1'>
														{`${summary.ordersCount}`}
													</Typography>
													<Typography>
														Orders
													</Typography>
													<CardActions>
														<NextLink
															href='admin/orders'
															passHref
														>
															<Button
																size='small'
																color='primary'
															>
																View Orders
															</Button>
														</NextLink>
													</CardActions>
												</CardContent>
											</Card>
										</Grid>
										<Grid item md={3}>
											<Card raised>
												<CardContent>
													<Typography variant='h1'>
														{`${summary.ordersCount}`}
													</Typography>
													<Typography>
														Products
													</Typography>
													<CardActions>
														<NextLink
															href='admin/Products'
															passHref
														>
															<Button
																size='small'
																color='primary'
															>
																View Products
															</Button>
														</NextLink>
													</CardActions>
												</CardContent>
											</Card>
										</Grid>
										<Grid item md={3}>
											<Card raised>
												<CardContent>
													<Typography variant='h1'>
														{`${summary.usersCount}`}
													</Typography>
													<Typography>
														Users
													</Typography>
													<CardActions>
														<NextLink
															href='admin/users'
															passHref
														>
															<Button
																size='small'
																color='primary'
															>
																View users
															</Button>
														</NextLink>
													</CardActions>
												</CardContent>
											</Card>
										</Grid>
									</Grid>
								)}
							</ListItem>
							<ListItem>
								<Typography variant='h1' component='h1'>
									Sales Report
								</Typography>
							</ListItem>
							<ListItem>
								<Bar
									data={{
										labels: summary.salesData.map(
											(item) => item._id
										),
										datasets: [
											{
												label: 'Sales',
												backgroundColor:
													'rgba(162, 222, 208, 1)',
												data: summary.salesData.map(
													(x) => x.totalSales
												),
											},
										],
									}}
									options={{
										legend: {
											display: true,
											position: 'right',
										},
									}}
								></Bar>
							</ListItem>
						</List>
					</Card>
				</Grid>
			</Grid>
		</LayoutFr>
	);
}

export default dynamic(() => Promise.resolve(AdminDashboard), { ssr: false });
