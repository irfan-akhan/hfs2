import { Stepper, Step, StepLabel } from '@material-ui/core';
import useStyles from '../utils/styles';
// STEPS ARRAY
const steps = ['Login', 'Shipping Address', 'Payment Method', 'Place Order'];

// --- COMPONENT DEFINITION
export default function CheckoutWizard({ activeStep = 0 }) {
	const classes = useStyles();
	return (
		<Stepper
			className={classes.transparentBackground}
			activeStep={activeStep}
			alternativeLabel
		>
			{steps.map((step) => {
				return (
					<Step key={step}>
						<StepLabel>{step}</StepLabel>
					</Step>
				);
			})}
		</Stepper>
	);
}
