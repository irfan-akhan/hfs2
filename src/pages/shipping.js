import {
	Button,
	List,
	ListItem,
	TextField,
	Typography,
} from '@material-ui/core';
import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import LayoutFr from '../components/LayoutFr';
import CheckoutWizard from '../components/CheckoutWizard';
import useStyles from '../utils/styles';
import { Store } from '../utils/store';
import { ACTIONS } from '../utils/store/actions';
import { Controller, useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
export default function Shiping() {
	const classes = useStyles();
	const { state, dispatch } = useContext(Store);
	const {
		userInfo,
		cart: { shippingAddress },
	} = state;
	const router = useRouter();
	const {
		handleSubmit,
		control,
		formState: { errors },
		setValue,
	} = useForm();

	useEffect(() => {
		if (!userInfo) {
			router.push('/login?redirect=/shipping');
		}
		console.log('state', state);
		if (shippingAddress) {
			setValue('address', shippingAddress.address);
			setValue('city', shippingAddress.city);
			setValue('country', shippingAddress.country);
			setValue('postalCode', shippingAddress.postalCode);
		}
	}, []);
	async function onRegisterHandler({ address, city, country, postalCode }) {
		dispatch({
			type: ACTIONS.saveShippingAddress,
			payload: { address, city, country, postalCode },
		});
		Cookies.set(
			'shippingAddress',
			JSON.stringify({ address, city, country, postalCode })
		);
		router.push('/payment');
	}
	return (
		<LayoutFr title='Shipping Address'>
			<CheckoutWizard activeStep={1} />
			<form
				onSubmit={handleSubmit(onRegisterHandler)}
				className={classes.form}
			>
				<Typography component='h2' variant='h2'>
					Shipping Address
				</Typography>
				<List>
					<ListItem>
						<Controller
							name='address'
							defaultValue=''
							control={control}
							rules={{ required: true }}
							render={({ field }) => (
								<TextField
									variant='outlined'
									fullWidth
									id='address'
									label='Address'
									error={Boolean(errors.address)}
									helperText={
										errors.address ? 'Address required' : ''
									}
									inputProps={{ type: 'text' }}
									{...field}
								></TextField>
							)}
						></Controller>
					</ListItem>
					<ListItem>
						<Controller
							name='city'
							defaultValue=''
							control={control}
							rules={{ required: true }}
							render={({ field }) => (
								<TextField
									variant='outlined'
									fullWidth
									id='city'
									label='City'
									error={Boolean(errors.city)}
									helperText={
										errors.city ? 'City required' : ''
									}
									inputProps={{ type: 'text' }}
									{...field}
								></TextField>
							)}
						></Controller>
					</ListItem>
					<ListItem>
						<Controller
							name='country'
							defaultValue=''
							control={control}
							rules={{ required: true }}
							render={({ field }) => (
								<TextField
									variant='outlined'
									fullWidth
									id='country'
									label='Country'
									error={Boolean(errors.country)}
									helperText={
										errors.country ? 'Country required' : ''
									}
									inputProps={{ type: 'text' }}
									{...field}
								></TextField>
							)}
						></Controller>
					</ListItem>
					<ListItem>
						<Controller
							name='postalCode'
							defaultValue=''
							control={control}
							rules={{ required: true }}
							render={({ field }) => (
								<TextField
									variant='outlined'
									fullWidth
									id='postalCode'
									label='Postal code'
									error={Boolean(errors.postalCode)}
									helperText={
										errors.postalCode
											? 'Postal code required'
											: ''
									}
									inputProps={{ type: 'text' }}
									{...field}
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
							continue
						</Button>
					</ListItem>
				</List>
			</form>
		</LayoutFr>
	);
}
