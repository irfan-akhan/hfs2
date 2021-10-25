import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
	navbar: {
		backgroundColor: '#203040',
		'& a': { color: '#ffffff' },
	},
	main: {
		minHeight: '90vh',
	},
	footer: {
		textAlign: 'center',
	},
	grow: {
		flexGrow: '1',
	},
	brand: {
		fontWeight: 'bold',
		fontSize: '1.5rem',
	},
	section: {
		marginTop: 20,
		marginBottom: 20,
	},
	form: {
		maxWidth: 800,
		margin: '0 auto',
	},
	fullWidth: { width: '100%' },
	error: { color: 'red', padding: 10 },
	navbarButton: { color: '#ffffff', textTransform: 'initial' },
	transparentBackground: { backgroundColor: 'transparent' },
});

export default useStyles;
