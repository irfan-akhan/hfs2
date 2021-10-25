import React, { useContext } from 'react';
import Axios from '../../utils/axios';
import Head from 'next/head';
import NextLink from 'next/link';
import Image from 'next/image';
import {
	Link,
	Typography,
	Grid,
	List,
	ListItem,
	Card,
	Button,
} from '@material-ui/core';
import LayoutFr from '../../components/LayoutFr';
import useStyles from '../../utils/styles';
import { Store } from '../../utils/store';
import { ACTIONS } from '../../utils/store/actions';
import dynamic from 'next/dynamic';

// --- Component Definition --- //
const SingleProduct = (props) => {
	const classes = useStyles();
	console.log('props', props);
	function addToCartHandler() {
		console.log(state);
		dispatch({
			type: ACTIONS.addToCart,
			payload: { ...product, quantity: 1 },
		});
	}
	function removeFromCartHandler() {
		console.log(state);
		dispatch({ type: ACTIONS.removeFromCart, payload: product });
	}
	const { state, dispatch } = useContext(Store);
	let product = null;
	if (!props.error) {
		console.log('props.', props.error);
		product = props.product;
	}
	if (!product)
		return (
			<div>
				<Head>
					<title>404 - Not found</title>
				</Head>
				<Typography>No Product Found</Typography>
			</div>
		);

	return (
		<LayoutFr title={product.name} description={product.description}>
			<section className={classes.section}>
				<NextLink href='/' passHref>
					<Link>Back</Link>
				</NextLink>
				<Grid container>
					<Grid item md={4} xs={12}>
						<Image
							width={640}
							height={640}
							layout='responsive'
							alt={product.name}
							src='/assets/images/shirt1.jpeg'
						></Image>
					</Grid>
					<Grid item md={4} xs={12}>
						<List>
							<ListItem>
								<Typography component='h1' variant='h1'>
									{product.name}
								</Typography>
							</ListItem>
							<ListItem>
								<Typography>
									Category:
									{product.category}
								</Typography>
							</ListItem>
							<ListItem>
								<Typography>Brand: {product.brand}</Typography>
							</ListItem>
							<ListItem>
								<Typography>
									rating: {product.rating} stars (
									{product.numReviews} reviews)
								</Typography>
							</ListItem>
							<ListItem>
								<Typography>
									Description: {product.description}
								</Typography>
							</ListItem>
						</List>
					</Grid>
					<Grid item md={3} xs={12}>
						<Card>
							<List>
								<ListItem></ListItem>
								<ListItem>
									<Grid item xs={6}>
										<Typography>Price</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography>
											{`$ ${product.price}`}
										</Typography>
									</Grid>
								</ListItem>
								<ListItem>
									<Grid item xs={6}>
										<Typography>Status</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography>
											{product.countInStock > 0
												? 'In stock'
												: 'Out of stock'}
										</Typography>
									</Grid>
								</ListItem>
								{product && !product.isAvailable ? (
									<ListItem>
										<Button
											fullWidth
											variant='contained'
											color='primary'
											disabled
										>
											Item Not Available
										</Button>
									</ListItem>
								) : state.cart.cartItems.length > 0 &&
								  state.cart.cartItems.find(
										(item) => item._id == product._id
								  ) ? (
									<ListItem>
										<Button
											fullWidth
											variant='contained'
											color='primary'
											onClick={removeFromCartHandler}
										>
											Remove from Cart
										</Button>
									</ListItem>
								) : (
									<ListItem>
										<Button
											fullWidth
											variant='contained'
											color='primary'
											onClick={addToCartHandler}
										>
											Add to Cart
										</Button>
									</ListItem>
								)}
							</List>
						</Card>
					</Grid>
				</Grid>
			</section>
		</LayoutFr>
	);
};

export default dynamic(() => Promise.resolve(SingleProduct), { ssr: false });

// Prefetch Product from server
export async function getServerSideProps(_ctx) {
	const resp = await Axios.get(`/products/${_ctx.params.slug}`);
	if (resp.data && resp.data.status === 200) {
		return {
			props: {
				product: resp.data.product,
			},
		};
	} else {
		return {
			props: {
				error: resp.data.message,
			},
		};
	}
}
