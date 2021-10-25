import {
	Button,
	FormControl,
	FormControlLabel,
	Link,
	List,
	ListItem,
	RadioGroup,
	TextField,
	Typography,
	Radio,
} from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import LayoutFr from '../components/LayoutFr';
import CheckoutWizard from '../components/CheckoutWizard';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import Axios from '../utils/axios';
import useStyles from '../utils/styles';
import { Store } from '../utils/store';
import { ACTIONS } from '../utils/store/actions';
import { Controller, useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import Cookies from 'js-cookie';

// --- COMPONENT DEFINITION --- //
export default function Payment() {
	const classes = useStyles();
	const [paymentMethod, setPaymentMethod] = useState('');
	const router = useRouter();
	const { state, dispatch } = useContext(Store);
	const {
		cart: { shippingAddress },
	} = state;

	const selectedPaymentMethod = state.cart.paymentMethod;
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	useEffect(() => {
		console.log('state', state);
		if (!shippingAddress || !shippingAddress.address) {
			router.push('/shipping');
		}

		if (selectedPaymentMethod) {
			setPaymentMethod(selectedPaymentMethod);
		}
	}, []);

	function onSubmitHandler(e) {
		e.preventDefault();
		closeSnackbar();
		console.log(paymentMethod);
		if (!paymentMethod) {
			enqueueSnackbar('Payment method is required', { variant: 'error' });
		} else {
			dispatch({
				type: ACTIONS.addpaymentMethod,
				payload: paymentMethod,
			});
			Cookies.set('paymentMethod', JSON.stringify(paymentMethod));
			router.push('/place-order');
		}
	}
	return (
		<LayoutFr title='Payment'>
			<CheckoutWizard activeStep={2} />
			<form onSubmit={onSubmitHandler} className={classes.form}>
				<Typography component='h2' variant='h2'>
					Payment Method
				</Typography>
				<List>
					<ListItem>
						<FormControl component='fieldset'>
							<RadioGroup
								aria-label='Payment method'
								name='paymentMethod'
								value={paymentMethod}
								onChange={(e) =>
									setPaymentMethod(e.target.value)
								}
							>
								<FormControlLabel
									label='Paypal'
									control={<Radio />}
									value='paypal'
								></FormControlLabel>
								<FormControlLabel
									label='Stripe'
									control={<Radio />}
									value='stripe'
								></FormControlLabel>
								<FormControlLabel
									label='Cash on delivery'
									control={<Radio />}
									value='cash'
								></FormControlLabel>
							</RadioGroup>
						</FormControl>
					</ListItem>
					<ListItem>
						<Button
							type='submit'
							variant='contained'
							color='primary'
							fullWidth
						>
							Continue
						</Button>
					</ListItem>
					<ListItem>
						<Button
							fullWidth
							type='button'
							variant='contained'
							onClick={() => router.push('/shipping')}
						>
							Back
						</Button>
					</ListItem>
				</List>
			</form>
		</LayoutFr>
	);
}
