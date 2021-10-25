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
				users: action.payload,
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

		default:
			return state;
	}
}

// --- COMPONENT DEFINITION --- //
function AdminUsers() {
	const router = useRouter();
	const { state } = useContext(Store);
	const classes = useStyles();
	const { userInfo } = state;
	const [{ loading, error, users, successDelete, loadingDelete }, dispatch] =
		useReducer(reducer, {
			loading: true,
			error: '',
			users: [],
		});
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	useEffect(() => {
		if (!userInfo) {
			router.push('/login?redirect=/users');
		}
		async function fetchUsers() {
			try {
				dispatch({ type: 'FETCH_REQUEST' });
				const { data } = await Axios.get('/admin/users', {
					headers: { authorization: `Bearer ${userInfo.token}` },
				});
				if (!data.message) {
					dispatch({ type: 'FETCH_SUCCESS', payload: data.users });
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
			fetchUsers();
		}
	}, [successDelete]);

	// DELETE USER
	async function deleteHandler(userId) {
		if (!window.alert('Are you sure you want to delete this user')) {
			return;
		}
		try {
			dispatch({ type: 'DELETE_REQUEST ' });
			const { data } = await Axios.delete(
				`/admin/users/${userId}`,

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
				enqueueSnackbar('User deleted successfully', {
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
		<LayoutFr title={`Users`}>
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
									Users
								</Typography>
								{loadingDelete && (
									<CircularProgress></CircularProgress>
								)}
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

													<TableCell>EMAIL</TableCell>
													<TableCell>
														isAdmin
													</TableCell>

													<TableCell>
														ACTIONS
													</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{users.map((user) => {
													return (
														<TableRow
															key={user._id}
														>
															<TableCell>
																{user._id}
															</TableCell>

															<TableCell>
																{user.name}
															</TableCell>
															<TableCell>
																{user.email}
															</TableCell>
															<TableCell>
																{user.isAdmin
																	? 'Yes'
																	: 'No'}
															</TableCell>

															<TableCell>
																<Button
																	size='small'
																	varaint='contained'
																	onClick={() => {
																		router.push(
																			`/admin/users/${user._id}`
																		);
																	}}
																>
																	Edit
																</Button>
																<Button
																	size='small'
																	varaint='contained'
																	onClick={() => {
																		deleteHandler(
																			user._id
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

export default dynamic(() => Promise.resolve(AdminUsers), { ssr: false });
