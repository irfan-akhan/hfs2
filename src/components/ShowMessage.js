import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';

export default function ShowMessage({ action }) {
	console.log('type', action.type);
	console.log('message', action.message);
	useEffect(() => {
		notify();
	}, []);
	function notify() {
		return toast[action.type](action.message, {
			position: 'top-center',
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
		});
	}
	return <ToastContainer />;
}
