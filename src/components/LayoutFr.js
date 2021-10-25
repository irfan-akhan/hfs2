import React, { useContext, useState } from 'react';
import Head from 'next/head';
import Cookies from 'js-cookie';
import NextLink from 'next/link';
import {
	AppBar,
	Container,
	Toolbar,
	Typography,
	Link,
	ThemeProvider,
	Switch,
	CssBaseline,
	Badge,
	Button,
	Menu,
	MenuItem,
} from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import useStyles from '../utils/styles';
import { Store } from '../utils/store';
import { ACTIONS } from '../utils/store/actions';
import { useRouter } from 'next/router';

// --- COMPONENT DEFINITION  --- //
const LayoutFr = ({ title, description, children }) => {
	const { state, dispatch } = useContext(Store);
	const router = useRouter();
	const classes = useStyles();
	const { darkMode, cart, userInfo } = state;

	const Theme = createTheme({
		typography: {
			h1: {
				fontWeight: 'bold',
				fontSize: '1.8rem',
			},
			h2: {
				fontSize: '1.5rem',
			},
		},
		palette: {
			type: darkMode ? 'dark' : 'light',
			primary: {
				main: '#f0c000',
			},
			secondary: {
				main: '#208080',
			},
		},
	});
	const darkModeHandler = () => {
		dispatch({ type: ACTIONS.darkModeToggle });
		Cookies.set('darkMode', !darkMode ? 'ON' : 'OFF');
	};
	const [anchorEl, setAnchorEl] = useState(null);
	function openUserMenu(e) {
		setAnchorEl(e.currentTarget);
	}
	function closeUserMenu(e, redirect) {
		setAnchorEl(null);
		if (redirect) {
			router.push(redirect);
		}
	}
	function logoutHandler(e) {
		setAnchorEl(null);
		dispatch({ type: ACTIONS.userLogout });
		Cookies.remove('userInfo');
		Cookies.remove('cartItems');
		router.push('/');
	}
	return (
		<div>
			<Head>
				<title> {title ? `${title} - Ecom` : 'Ecom'}</title>
				{description && (
					<meta name='description' content={description}></meta>
				)}
			</Head>
			<ThemeProvider theme={Theme}>
				<CssBaseline />
				<AppBar position='static' className={classes.navbar}>
					<Toolbar>
						<NextLink href='/' passHref>
							<Link>
								<Typography className={classes.brand}>
									Ecommerce
								</Typography>
							</Link>
						</NextLink>
					</Toolbar>
					{/* <div className={classes.grow}></div> */}
					<div>
						<Switch
							checked={darkMode}
							onClick={darkModeHandler}
						></Switch>
						<NextLink href='/cart' passHref>
							<Link>
								{cart.cartItems.length > 0 ? (
									<Badge
										color='secondary'
										badgeContent={cart.cartItems.length}
									>
										Cart
									</Badge>
								) : (
									'Cart'
								)}
							</Link>
						</NextLink>
						{!userInfo ? (
							<NextLink href='/login' passHref>
								<Link> Login</Link>
							</NextLink>
						) : (
							<>
								<Button
									aria-controls='simple-menu'
									aria-haspopup='true'
									onClick={openUserMenu}
									className={classes.navbarButton}
								>
									{userInfo.name}
								</Button>
								<Menu
									id='simple-menu'
									keepMounted
									anchorEl={anchorEl}
									open={Boolean(anchorEl)}
									onClose={closeUserMenu}
								>
									<MenuItem
										onClick={(e) => {
											closeUserMenu(e, '/profile');
										}}
									>
										Profile
									</MenuItem>
									<MenuItem onClick={closeUserMenu}>
										Account
									</MenuItem>
									<MenuItem
										onClick={(e) => {
											closeUserMenu(e, '/orders');
										}}
									>
										Orders
									</MenuItem>
									{console.log('userINDDDDDDDD', userInfo)}
									{userInfo.isAdmin ? (
										<MenuItem
											onClick={(e) => {
												closeUserMenu(
													e,
													'/admin/dashboard'
												);
											}}
										>
											Admin Dashboard
										</MenuItem>
									) : null}
									<MenuItem onClick={logoutHandler}>
										Logout
									</MenuItem>
								</Menu>
							</>
						)}
					</div>
				</AppBar>
				<Container className={classes.main}>{children}</Container>
				<footer className={classes.footer}>
					Ecom All rights reserved.
				</footer>
			</ThemeProvider>
		</div>
	);
};

export default LayoutFr;
