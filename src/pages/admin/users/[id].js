import React from 'react';
import Axios from '../../../utils/axios';
import { Store } from '../../../utils/store';
import { useContext, useState, useReducer, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import LayoutFr from '../../../components/LayoutFr';
import NextLink from 'next/link';
import useStyles from '../../../utils/styles';
import { useSnackbar } from 'notistack';

import { ACTIONS } from '../../../utils/store/actions';
import { Controller, useForm } from 'react-hook-form';
import {
	Button,
	Grid,
	Checkbox,
	FormControlLabel,
	Typography,
	ListItemText,
	List,
	ListItem,
	Card,
	TextField,
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
			};
		case 'UPDATE_FAILED':
			return {
				...state,
				errorUpdate: action.payload,
				loadingUpdate: false,
			};
		case 'UPDATE_REQUEST':
			return { ...state, errorUpdate: '', loadingUpdate: true };
		case 'UPDATE_SUCCESS':
			return { ...state, errorUpdate: '', loadingUpdate: false };
		default:
			return state;
	}
}

// --- COMPONENT DEFINITION --- //
function UserEdit({ userId }) {
	const router = useRouter();
	const { state } = useContext(Store);
	const classes = useStyles();
	const { userInfo } = state;
	const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
		loading: true,
		error: '',
	});

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const {
		handleSubmit,
		control,
		formState: { errors },
		setValue,
	} = useForm();
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		if (!userInfo) {
			router.push('/login?redirect=/users');
			return;
		} else {
			async function fetchUser() {
				try {
					dispatch({ type: 'FETCH_REQUEST' });
					const { data } = await Axios.get(`/admin/users/${userId}`, {
						headers: {
							authorization: `Bearer ${userInfo.token}`,
						},
					});
					if (data.status === 200) {
						setIsAdmin(data.user.isAdmin);
						dispatch({
							type: 'FETCH_SUCCESS',
						});
						setValue('name', data.name);
					} else {
						dispatch({
							type: 'FETCH_FAILED',
							payload: data.message,
						});
					}
				} catch (error) {
					dispatch({ type: 'FETCH_FAILED', payload: error.message });
				}
			}
			fetchUser();
		}
		if (userInfo) {
			setValue('name', userInfo.name);
			setValue('email', userInfo.email);
		}
	}, []);

	async function onSubmitHandler({ name }) {
		closeSnackbar();
		try {
			dispatch({ type: 'UPDAT_REQUEST' });

			const { data } = await Axios.put(
				`/admin/users/${userId}`,
				{
					name,
					isAdmin,
				},
				{ headers: { authorization: `Bearer ${userInfo.token}` } }
			);

			dispatch({ type: 'UPDATE_SUCCESS' });

			enqueueSnackbar('User updated successfully', {
				variant: 'success',
			});
			console.log('res user update', data);
			router.push('/admin/users');
		} catch (error) {
			dispatch({ type: 'UPDATE_FAIL' });

			console.log('catch errrrrr', error);
			enqueueSnackbar(error.message, { variant: 'error' });
		}
	}

	return (
		<LayoutFr title={`Edit User ${userId}`}>
			<Grid container spacing={1}>
				<Grid item md={3} xs={12}>
					<Card className={classes.section}>
						<List>
							<NextLink href='/admin/dashboard'>
								<ListItem button component='a'>
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
								<Typography variant='h1' component='h1'>
									{`Edit Product ${userId}`}
								</Typography>
							</ListItem>
							<ListItem>
								{loading && (
									<CircularProgress></CircularProgress>
								)}
								{error && (
									<Typography variant='h2'>
										{error}
									</Typography>
								)}
							</ListItem>
							<ListItem>
								<form
									onSubmit={handleSubmit(onSubmitHandler)}
									className={classes.form}
								>
									<List>
										<ListItem>
											<Controller
												name='name'
												defaultValue=''
												control={control}
												rules={{ required: true }}
												render={({ field }) => (
													<TextField
														variant='outlined'
														fullWidth
														id='name'
														label='Name'
														error={Boolean(
															errors.name
														)}
														helperText={
															errors.name
																? 'Name required'
																: ''
														}
														{...field}
													></TextField>
												)}
											></Controller>
										</ListItem>
										<ListItem>
											<FormControlLabel
												label='Is Admin'
												control={
													<Checkbox
														onClick={(e) => {
															setAdmin(
																e.target.checked
															);
														}}
														checked={isAdmin}
														name='isAdmin'
													/>
												}
											></FormControlLabel>
										</ListItem>

										<ListItem>
											<Button
												variant='contained'
												fullWidth
												color='primary'
												type='submit'
											>
												Update
											</Button>
											{loadingUpdate && (
												<CircularProgress></CircularProgress>
											)}
										</ListItem>
									</List>
								</form>
							</ListItem>
						</List>
					</Card>
				</Grid>
			</Grid>
		</LayoutFr>
	);
}

export async function getServerSideProps({ params }) {
	return {
		props: {
			userId: params.id,
		},
	};
}
export default dynamic(() => Promise.resolve(UserEdit), { ssr: false });
