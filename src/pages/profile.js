import React from 'react';
import Axios from '../utils/axios';
import { Store } from '../utils/store';
import { useContext, useState, useReducer, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import LayoutFr from '../components/LayoutFr';
import NextLink from 'next/link';
import useStyles from '../utils/styles';
import { useSnackbar } from 'notistack';

import { ACTIONS } from '../utils/store/actions';
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
} from '@material-ui/core';

// --- COMPONENT DEFINITION --- //
function Profile() {
	const router = useRouter();
	const { state, dispatch } = useContext(Store);
	const classes = useStyles();
	const { userInfo } = state;

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const {
		handleSubmit,
		control,
		formState: { errors },
		setValue,
	} = useForm();
	useEffect(() => {
		if (!userInfo) {
			router.push('/login?redirect=/orders');
			return;
		}
		if (userInfo) {
			setValue('name', userInfo.name);
			setValue('email', userInfo.email);
		}
	}, []);
	async function onRegisterHandler({
		name,
		email,
		password,
		confirmPassword,
	}) {
		closeSnackbar();
		try {
			if (password !== confirmPassword) {
				enqueueSnackbar(`Passwordds don't match`, { variant: 'error' });
				return;
			}
			const { data } = await Axios.put(
				`/users/profile`,
				{
					name,
					email,
					password,
				},
				{ headers: { authorization: `Bearer ${userInfo.token}` } }
			);
			if (data.message) {
				enqueueSnackbar(data.message, { variant: 'error' });
				return;
			} else {
				enqueueSnackbar('Profile updated successfully', {
					variant: 'success',
				});
				console.log('res user', data);
				dispatch({
					type: ACTIONS.updateProfile,
					payload: { user: data.user },
				});
			}
		} catch (error) {
			console.log('catch errrrrr', error);
			enqueueSnackbar(error.message, { variant: 'error' });
		}
	}

	return (
		<LayoutFr title={`Profile`}>
			<Grid container spacing={1}>
				<Grid item md={3} xs={12}>
					<Card className={classes.section}>
						<List>
							<NextLink href='/profile'>
								<ListItem selected button component='a'>
									<ListItemText>Profile</ListItemText>
								</ListItem>
							</NextLink>
							<NextLink href='/orders'>
								<ListItem button component='a'>
									<ListItemText>Orders</ListItemText>
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
									Profile
								</Typography>
							</ListItem>
							<ListItem>
								<form
									onSubmit={handleSubmit(onRegisterHandler)}
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
														inputProps={{
															type: 'text',
														}}
														{...field}
													></TextField>
												)}
											></Controller>
										</ListItem>
										<ListItem>
											<Controller
												control={control}
												name='email'
												rules={{ required: true }}
												defaultValue=''
												render={({ field }) => (
													<TextField
														variant='outlined'
														fullWidth
														id='email'
														label='Email'
														error={Boolean(
															errors.email
														)}
														helperText={
															errors.email
																? errors.email
																		.type ===
																  'pattern'
																	? 'Invalid email address'
																	: 'Email is required'
																: ''
														}
														{...field}
														inputProps={{
															type: 'email',
														}}
													></TextField>
												)}
											></Controller>
										</ListItem>
										<ListItem>
											<Controller
												control={control}
												name='password'
												rules={{
													validate: (value) =>
														value === '' ||
														value.length > 5 ||
														'password must be atleast 6 characters',
												}}
												defaultValue=''
												render={({ field }) => (
													<TextField
														variant='outlined'
														fullWidth
														id='password'
														label='Password'
														error={Boolean(
															errors.password
														)}
														helperText={
															errors.password
																? 'Password must be atleast 6 characters'
																: ''
														}
														{...field}
														inputProps={{
															type: 'password',
														}}
													></TextField>
												)}
											></Controller>
										</ListItem>
										<ListItem>
											<Controller
												control={control}
												name='confirmPassword'
												rules={{
													validate: (value) =>
														value === '' ||
														value.length > 5 ||
														'Confirm password must be atleast 6 characters',
												}}
												defaultValue=''
												render={({ field }) => (
													<TextField
														variant='outlined'
														fullWidth
														id='confirmPassword'
														label='Confirm Password'
														error={Boolean(
															errors.confirmPassword
														)}
														helperText={
															errors.confirmPassword
																? 'Confirm password must be atleast 6 characters'
																: ''
														}
														{...field}
														inputProps={{
															type: 'password',
														}}
													></TextField>
												)}
											></Controller>
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

export default dynamic(() => Promise.resolve(Profile), { ssr: false });
