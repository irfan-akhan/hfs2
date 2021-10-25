import {
	Button,
	Link,
	List,
	ListItem,
	TextField,
	Typography,
} from '@material-ui/core';
import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';

import NextLink from 'next/link';
import LayoutFr from '../components/LayoutFr';
import useStyles from '../utils/styles';
import Axios from '../utils/axios';
import { Store } from '../utils/store';
import { ACTIONS } from '../utils/store/actions';
import { Controller, useForm } from 'react-hook-form';

export default function Register() {
	const classes = useStyles();
	const { state, dispatch } = useContext(Store);
	const router = useRouter();
	const { redirect } = router.query;
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const {
		handleSubmit,
		control,
		formState: { errors },
	} = useForm();

	async function onRegisterHandler({
		name,
		email,
		password,
		confirmPassword,
	}) {
		closeSnackbar();

		if (password !== confirmPassword) {
			enqueueSnackbar(`Passwordds don't match`, { variant: 'error' });
			return;
		}
		const { data } = await Axios.post('/users/register', {
			name,
			email,
			password,
		});
		if (data.message) {
			enqueueSnackbar(data.message, { variant: 'error' });

			return;
		} else {
			enqueueSnackbar('Registered Successfully', { variant: 'success' });

			dispatch({ type: ACTIONS.userLogin, payload: { user: data.user } });
			router.push(redirect);
		}
	}
	return (
		<LayoutFr title='Register'>
			<form
				onSubmit={handleSubmit(onRegisterHandler)}
				className={classes.form}
			>
				<Typography>Register</Typography>
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
									error={Boolean(errors.name)}
									helperText={
										errors.name ? 'Name required' : ''
									}
									inputProps={{ type: 'text' }}
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
									error={Boolean(errors.email)}
									helperText={
										errors.email
											? errors.email.type === 'pattern'
												? 'Invalid email address'
												: 'Email is required'
											: ''
									}
									{...field}
									inputProps={{ type: 'email' }}
								></TextField>
							)}
						></Controller>
					</ListItem>
					<ListItem>
						<Controller
							control={control}
							name='password'
							rules={{ required: true, minLength: 6 }}
							defaultValue=''
							render={({ field }) => (
								<TextField
									variant='outlined'
									fullWidth
									id='password'
									label='Password'
									error={Boolean(errors.password)}
									helperText={
										errors.password
											? errors.password.type ==
											  'minLength'
												? 'Password must be atleast 6 characters'
												: 'Password is required'
											: ''
									}
									{...field}
									inputProps={{ type: 'password' }}
								></TextField>
							)}
						></Controller>
					</ListItem>
					<ListItem>
						<Controller
							control={control}
							name='confirmPassword'
							rules={{ required: true, minLength: 6 }}
							defaultValue=''
							render={({ field }) => (
								<TextField
									variant='outlined'
									fullWidth
									id='confirmPassword'
									label='Confirm Password'
									error={Boolean(errors.confirmPassword)}
									helperText={
										errors.confirmPassword
											? errors.confirmPassword.type ==
											  'minLength'
												? 'Confirm password must be atleast 6 characters'
												: 'Confirm password is required'
											: ''
									}
									{...field}
									inputProps={{ type: 'password' }}
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
							Register
						</Button>
					</ListItem>
					<ListItem>
						<Typography>
							Already have an account.? &nbsp;{' '}
							<NextLink
								href={`/login?redirect=${redirect}`}
								passHref
							>
								<Link color='primary'>Login</Link>
							</NextLink>
						</Typography>
					</ListItem>
				</List>
			</form>
		</LayoutFr>
	);
}
