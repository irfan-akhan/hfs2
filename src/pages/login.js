import {
	Button,
	Link,
	List,
	ListItem,
	TextField,
	Typography,
} from '@material-ui/core';
import React, { useContext, useEffect } from 'react';
import LayoutFr from '../components/LayoutFr';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import Axios from '../utils/axios';
import useStyles from '../utils/styles';
import { Store } from '../utils/store';
import { ACTIONS } from '../utils/store/actions';
import { Controller, useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';

// --- COMPONENT DEFINITION
export default function Login() {
	const classes = useStyles();
	const router = useRouter();
	const {
		handleSubmit,
		control,
		formState: { errors },
	} = useForm();
	console.log(useSnackbar());
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const { state, dispatch } = useContext(Store);
	const userInfo = state.userInfo;

	console.log('router', router.query);
	const { redirect } = router.query;
	useEffect(() => {
		if (userInfo) {
			router.push('/');
		}
	}, []);
	async function loginHandler({ email, password }) {
		closeSnackbar();
		try {
			const response = await Axios.post('/users/auth/login', {
				email: email,
				password: password,
			});
			console.log('response', response);
			if (response.data.status == 200) {
				enqueueSnackbar('Login successfull, Please wait.', {
					variant: 'success',
				});

				dispatch({
					type: ACTIONS.userLogin,
					payload: { user: response.data.user },
				});
				router.push(redirect || '/');
			} else {
				enqueueSnackbar(response.data.message, { variant: 'error' });
			}
		} catch (err) {
			console.log('rtt', err);
			enqueueSnackbar(err.toString(), { variant: 'error' });
		}
	}
	return (
		<LayoutFr title='login'>
			<form
				onSubmit={handleSubmit(loginHandler)}
				className={classes.form}
			>
				<Typography component='h2' variant='h2'>
					Login
				</Typography>
				<List>
					<ListItem>
						<Controller
							control={control}
							name='email'
							defaultValue=''
							rules={{ required: true }}
							render={({ field }) => (
								<TextField
									variant='outlined'
									fullWidth
									label='Email'
									id='email'
									inputProps={{ type: 'email' }}
									error={Boolean(errors.email)}
									helperText={
										errors.email
											? errors.email.type === 'pattern'
												? 'Invalid email address'
												: 'Email is required'
											: ''
									}
									{...field}
								></TextField>
							)}
						></Controller>
					</ListItem>
					<ListItem>
						<Controller
							control={control}
							defaultValue=''
							name='password'
							rules={{ required: true, minLength: 6 }}
							render={({ field }) => (
								<TextField
									variant='outlined'
									fullWidth
									label='Password'
									id='password'
									inputProps={{ type: 'password' }}
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
								></TextField>
							)}
						></Controller>
					</ListItem>

					<ListItem>
						<Button
							type='submit'
							variant='contained'
							color='primary'
							fullWidth
						>
							Login
						</Button>
					</ListItem>
					<ListItem>
						{`Don't have an account.?`} &nbsp;
						<NextLink
							href={`/register?redirect=${redirect || '/'}`}
							passHref
						>
							<Link>Register Now</Link>
						</NextLink>
					</ListItem>
				</List>
			</form>
		</LayoutFr>
	);
}
