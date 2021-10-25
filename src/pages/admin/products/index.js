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
import { useSnackbar } from 'notistack';

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
				products: action.payload,
			};
		case 'FETCH_FAILED':
			return { ...state, error: action.payload, loading: false };
		case 'DELETE_SUCCESS':
			return { ...state, loadingDelete: false, successDelete: true };
		case 'DELETE_FAIL':
			return { ...state, loadingDelete: false };
		case 'DELETE_RESET':
			return { ...state, loadingDelete: false, successDelete: false };
		case 'DELETE_REQUEST':
			return { ...state, loadingDelete: true };
		case 'CREATE_SUCCESS':
			return { ...state, loading: false };
		case 'CREATE_FAIL':
			return { ...state, loadingCreate: false };
		case 'CREATE_REQUEST':
			return { ...state, loadingCreate: true };
		default:
			return state;
	}
}

// --- COMPONENT DEFINITION --- //
function AdminProducts() {
	const router = useRouter();
	const { state } = useContext(Store);
	const classes = useStyles();
	const { userInfo } = state;
	const [
		{
			loading,
			error,
			products,
			loadingCreate,
			successDelete,
			loadingDelete,
		},
		dispatch,
	] = useReducer(reducer, {
		loading: true,
		error: '',
		products: [],
	});
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	useEffect(() => {
		if (!userInfo) {
			router.push('/login?redirect=/products');
		}
		async function fetchProducts() {
			try {
				dispatch({ type: 'FETCH_REQUEST' });
				const { data } = await Axios.get('/admin/products', {
					headers: { authorization: `Bearer ${userInfo.token}` },
				});
				if (data.status === 200) {
					dispatch({ type: 'FETCH_SUCCESS', payload: data.products });
				} else {
					dispatch({ type: 'FETCH_FAILED', payload: data.message });
				}
			} catch (error) {
				dispatch({ type: 'FETCH_FAILED', payload: error.message });
			}
		}
		if (successDelete) {
			dispatch({ type: 'DELETE_RESET' });
		} else {
			fetchProducts();
		}
	}, [successDelete]);
	async function createHandler() {
		if (!window.alert('Are you sure you want to create new product')) {
			return;
		}
		try {
			dispatch({ type: 'CREATE_REQUEST ' });
			const { data } = await Axios.post(
				'/admin/products',
				{},
				{
					headers: {
						authorization: `Bearer ${userInfo.token}`,
					},
				}
			);
			if (data.message) {
				dispatch({ type: 'CREATE_FAIL ' });
				enqueueSnackbar(data.message, {
					variant: 'error',
				});
			} else {
				dispatch({ type: 'CREATE_SUCCESS ' });
				enqueueSnackbar('Product Created successfully', {
					variant: 'success',
				});
				router.push(`/admin/products/${data.product._id}`);
			}
		} catch (error) {
			dispatch({ type: 'CREATE_FAIL ' });
			enqueueSnackbar(error.message, {
				variant: 'error',
			});
		}
	}
	// DELETE PRODUCT
	async function deleteHandler(productId) {
		if (!window.alert('Are you sure you want to delete this product')) {
			return;
		}
		try {
			dispatch({ type: 'DELETE_REQUEST ' });
			const { data } = await Axios.delete(
				`/admin/products/${productId}`,

				{
					headers: {
						authorization: `Bearer ${userInfo.token}`,
					},
				}
			);
			if (data.message) {
				dispatch({ type: 'DELETE_FAIL ' });
				enqueueSnackbar(data.message, {
					variant: 'error',
				});
			} else {
				dispatch({ type: 'DELETE_SUCCESS ' });
				enqueueSnackbar('Product deleted successfully', {
					variant: 'success',
				});
			}
		} catch (error) {
			dispatch({ type: 'DELETE_FAIL ' });
			enqueueSnackbar(error.message, {
				variant: 'error',
			});
		}
	}
	return (
		<LayoutFr title={`Products`}>
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
								<ListItem button component='a'>
									<ListItemText primary='Orders'></ListItemText>
								</ListItem>
							</NextLink>
							<NextLink href='/admin/products'>
								<ListItem selected button component='a'>
									<ListItemText primary='Products'></ListItemText>
								</ListItem>
							</NextLink>
							<NextLink href='/admin/users'>
								<ListItem  button component='a'>
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
								<Grid container alignItems='center'>
									<Grid item xs={6}>
										<Typography variant='h1' component='h1'>
											Products
										</Typography>
										{loadingDelete && (
											<CircularProgress></CircularProgress>
										)}
									</Grid>
									<Grid item xs={6} align='right'>
										<Button
											color='primary'
											variant='cobtainer'
											onClick={createHandler}
										>
											Create
										</Button>
										{loadingCreate ? (
											<CircularProgress />
										) : null}
									</Grid>
								</Grid>
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
													<TableCell>NAME </TableCell>

													<TableCell>PRICE</TableCell>
													<TableCell>
														CATEGORY
													</TableCell>
													<TableCell>
														RATING
													</TableCell>
													<TableCell>
														ACTIONS
													</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{products.map((product) => {
													return (
														<TableRow
															key={product._id}
														>
															<TableCell>
																{product._id}
															</TableCell>

															<TableCell>
																{product.name}
															</TableCell>
															<TableCell>
																{product.price}
															</TableCell>
															<TableCell>
																{
																	product.Cardcategory
																}
															</TableCell>
															<TableCell>
																{product.rating}
															</TableCell>
															<TableCell>
																<Button
																	size='small'
																	varaint='contained'
																	onClick={() => {
																		router.push(
																			`/admin/products/${product._id}`
																		);
																	}}
																>
																	Edit
																</Button>{' '}
																<Button
																	size='small'
																	varaint='contained'
																	onClick={() => {
																		deleteHandler(
																			product._id
																		);
																	}}
																>
																	Delete
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

export default dynamic(() => Promise.resolve(AdminProducts), { ssr: false });
