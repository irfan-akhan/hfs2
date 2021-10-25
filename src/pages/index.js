import {
	Button,
	Card,
	CardActionArea,
	CardActions,
	CardContent,
	CardMedia,
	Grid,
	Typography,
} from '@material-ui/core';
import Axios from '../utils/axios';
import NextLink from 'next/link';
import LayoutFr from '../components/LayoutFr';

export default function Home(props) {
	const { products } = props;
	return (
		<LayoutFr>
			<div>
				<h1>Products</h1>
				<Grid container spacing={3}>
					{products && products.length > 0 ? (
						products.map((prod) => {
							return (
								<Grid md={4} key={prod.name} item>
									<Card>
										<NextLink
											href={`/product/${prod.slug}`}
											passHref
										>
											<CardActionArea>
												<CardMedia
													component='img'
													title={prod.name}
													image='https://assetscdn1.paytm.com/images/catalog/product/F/FO/FOOSTYLISH-SPORS-P-1180631482B8F2B/1629964312200_0..jpeg'
												></CardMedia>
												<CardContent>
													<Typography>
														{prod.name}
													</Typography>
												</CardContent>
											</CardActionArea>
										</NextLink>
										<CardActions>
											<Typography>
												{`$${prod.price}`}
											</Typography>
											<Button
												size='small'
												color='primary'
											>
												Add to cart
											</Button>
										</CardActions>
									</Card>
								</Grid>
							);
						})
					) : (
						<Grid item></Grid>
					)}
					<Grid item></Grid>
				</Grid>
			</div>
		</LayoutFr>
	);
}

export async function getServerSideProps() {
	const resp = await Axios.get('/products');
	if (resp.data && resp.data.status == 200) {
		return {
			props: {
				products: resp.data.products,
			},
		};
	}
}
