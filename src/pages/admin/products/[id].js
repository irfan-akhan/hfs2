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
		case 'LOADING_UPLOAD':
			return { ...state, loadingUpdate: true };
		default:
			return state;
	}
}

// --- COMPONENT DEFINITION --- //
function AdminProduct({ productId }) {
	const router = useRouter();
	const { state } = useContext(Store);
	const classes = useStyles();
	const { userInfo } = state;
	const [
		{ loading, error, loadingUpdate, errorUpdate, loadingUpload },
		dispatch,
	] = useReducer(reducer, {
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
	useEffect(() => {
		if (!userInfo) {
			router.push('/login?redirect=/products');
			return;
		} else {
			async function fetchProduct() {
				try {
					dispatch({ type: 'FETCH_REQUEST' });
					const { data } = await Axios.get(
						`/admin/products/${productId}`,
						{
							headers: {
								authorization: `Bearer ${userInfo.token}`,
							},
						}
					);
					if (data.status === 200) {
						dispatch({
							type: 'FETCH_SUCCESS',
						});
						setValue('name', data.name);
						setValue('brand', data.brand);
						setValue('slug', data.slug);
						setValue('price', data.price);
						setValue('image', data.image);
						setValue('category', data.category);
						setValue('countInStock', data.countInStock);
						setValue('description', data.description);
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
			fetchProduct();
		}
		if (userInfo) {
			setValue('name', userInfo.name);
			setValue('email', userInfo.email);
		}
	}, []);
	async function uploadHandler(e) {
		const file = e.target.files[0];
		let bodyFormData = new FormData();
		bodyFormData.append('file', file);
		try {
			dispatch({ type: 'UPLOAD_REQUEST' });
			const { data } = await axios.post('/admin/upload', bodyFormData, {
				'Content-Type': 'multipart/form-data',
				authorization: `Bearer  ${userInfo.token}`,
			});
			if (data.message) {
				enqueueSnackbar(data.message, { variant: 'error' });
				dispatch({ type: 'UPLOAD_FAILED', payload: data.message });
			} else {
				setValue('image', data.secure_url);
				dispatch({ type: 'UPLOAD_SUCCESS' });
				enqueueSnackbar('Uploaded successfully', {
					variant: 'success',
				});
			}
		} catch (error) {
			console.log('error upload', error);
			dispatch({ type: 'UPLOAD_FAILED', payload: error.message });

			enqueueSnackbar(error.message, { variant: 'error' });
		}
	}
	async function onSubmitHandler({
		name,
		slug,
		price,
		description,
		image,
		category,
		brand,
		countInStock,
	}) {
		closeSnackbar();
		try {
			dispatch({ type: 'UPDAT_REQUEST' });

			const { data } = await Axios.put(
				`/admin/products/${productId}`,
				{
					name,
					slug,
					price,
					description,
					image,
					category,
					brand,
					countInStock,
				},
				{ headers: { authorization: `Bearer ${userInfo.token}` } }
			);
			if (data.message) {
				dispatch({ type: 'UPDATE_FAIL' });

				enqueueSnackbar(data.message, { variant: 'error' });
				return;
			} else {
				dispatch({ type: 'UPDATE_SUCCESS' });

				enqueueSnackbar('Product updated successfully', {
					variant: 'success',
				});
				console.log('res product update', data);
				router.push('/admin/products');
			}
		} catch (error) {
			dispatch({ type: 'UPDATE_FAIL' });

			console.log('catch errrrrr', error);
			enqueueSnackbar(error.message, { variant: 'error' });
		}
	}

	return (
		<LayoutFr title={`Edit Product ${productId}`}>
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
								<Typography variant='h1' component='h1'>
									{`Edit Product ${productId}`}
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
											<Controller
												name='slug'
												defaultValue=''
												control={control}
												rules={{ required: true }}
												render={({ field }) => (
													<TextField
														variant='outlined'
														fullWidth
														id='slug'
														label='Slug'
														error={Boolean(
															errors.slug
														)}
														helperText={
															errors.slug
																? 'Slug required'
																: ''
														}
														{...field}
													></TextField>
												)}
											></Controller>
										</ListItem>
										<ListItem>
											<Controller
												name='price'
												defaultValue=''
												control={control}
												rules={{ required: true }}
												render={({ field }) => (
													<TextField
														variant='outlined'
														fullWidth
														id='price'
														label='Price'
														error={Boolean(
															errors.price
														)}
														helperText={
															errors.price
																? 'Price required'
																: ''
														}
														{...field}
													></TextField>
												)}
											></Controller>
										</ListItem>
										<ListItem>
											<Controller
												name='image'
												defaultValue=''
												control={control}
												rules={{ required: true }}
												render={({ field }) => (
													<TextField
														variant='outlined'
														fullWidth
														id='image'
														label='Image'
														error={Boolean(
															errors.image
														)}
														helperText={
															errors.image
																? 'Image required'
																: ''
														}
														{...field}
													></TextField>
												)}
											></Controller>
										</ListItem>
										<ListItem>
											{' '}
											<Button
												variant='contained'
												component='label'
											>
												Upload File
												<input
													type='file'
													onChange={uploadHandler}
													hidden
												></input>
											</Button>
											{loadingUpload && (
												<CircularProgress></CircularProgress>
											)}
										</ListItem>
										<ListItem>
											<Controller
												name='category'
												defaultValue=''
												control={control}
												rules={{ required: true }}
												render={({ field }) => (
													<TextField
														variant='outlined'
														fullWidth
														id='category'
														label='Category'
														error={Boolean(
															errors.category
														)}
														helperText={
															errors.category
																? 'Category required'
																: ''
														}
														{...field}
													></TextField>
												)}
											></Controller>
										</ListItem>
										<ListItem>
											<Controller
												name='brand'
												defaultValue=''
												control={control}
												rules={{ required: true }}
												render={({ field }) => (
													<TextField
														variant='outlined'
														fullWidth
														id='brand'
														label='Brand'
														error={Boolean(
															errors.brand
														)}
														helperText={
															errors.brand
																? 'Brand required'
																: ''
														}
														{...field}
													></TextField>
												)}
											></Controller>
										</ListItem>
										<ListItem>
											<Controller
												name='countInStock'
												defaultValue=''
												control={control}
												rules={{ required: true }}
												render={({ field }) => (
													<TextField
														variant='outlined'
														fullWidth
														id='countInStock'
														label='Count in stock is'
														error={Boolean(
															errors.countInStock
														)}
														helperText={
															errors.countInStock
																? 'Count in stock is required'
																: ''
														}
														{...field}
													></TextField>
												)}
											></Controller>
										</ListItem>
										<ListItem>
											<Controller
												name='description'
												defaultValue=''
												control={control}
												rules={{ required: true }}
												render={({ field }) => (
													<TextField
														variant='outlined'
														fullWidth
														multiline
														id='description'
														label='Description'
														error={Boolean(
															errors.description
														)}
														helperText={
															errors.description
																? 'Description required'
																: ''
														}
														{...field}
													></TextField>
												)}
											></Controller>
										</ListItem>
										<ListItem></ListItem>

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
			productId: { params },
		},
	};
}
export default dynamic(() => Promise.resolve(AdminProduct), { ssr: false });
