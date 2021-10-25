import { createContext, useReducer } from 'react';
import Cookies from 'js-cookie';
import { ACTIONS } from './actions';

// INITIAL STATE FOR CONTEXT STORE
const initialState = {
	darkMode: Cookies.get('darkMode') === 'ON' ? true : false,
	cart: {
		cartItems: Cookies.get('cartItems')
			? JSON.parse(Cookies.get('cartItems'))
			: [],
		shippingAddress: Cookies.get('shippingAddress')
			? JSON.parse(Cookies.get('shippingAddress'))
			: {},
		paymentMethod: Cookies.get('paymentMethod')
			? JSON.parse(Cookies.get('paymentMethod'))
			: '',
	},
	userInfo: Cookies.get('userInfo')
		? JSON.parse(Cookies.get('userInfo'))
		: null,
};
export const Store = createContext();

// Reducer for Store
function reducer(state, action) {
	switch (action.type) {
		case ACTIONS.darkModeToggle: {
			Cookies.set(JSON.stringify('darkMode', !state.darkMode));
			return { ...state, darkMode: !state.darkMode };
		}
		case ACTIONS.addToCart: {
			const newItems = [...state.cart.cartItems, action.payload];
			Cookies.set('cartItems', JSON.stringify(newItems));
			return {
				...state,
				cart: { ...state.cart, cartItems: newItems },
			};
		}
		case ACTIONS.removeFromCart: {
			const newItems = state.cart.cartItems.filter(
				(item) => item._id !== action.payload._id
			);
			Cookies.set('cartItems', JSON.stringify(newItems));
			return {
				...state,
				cart: {
					...state.cart,
					cartItems: newItems,
				},
			};
		}
		case ACTIONS.updateProductQuantity: {
			const newItems = state.cart.cartItems.map(function (item) {
				if (item._id === action.payload.productId)
					return { ...item, quantity: action.payload.quantity };
				return item;
			});
			console.log('updated', state.cart.cartItems);
			Cookies.set('cartItems', JSON.stringify(newItems));
			return {
				...state,
				cart: {
					...state.cart,
					cartItems: newItems,
				},
			};
		}
		case ACTIONS.userLogin: {
			Cookies.set('userInfo', JSON.stringify(action.payload.user));
			return { ...state, userInfo: action.payload.user };
		}
		case ACTIONS.updateProfile: {
			Cookies.set(
				'userInfo',
				JSON.stringify({ ...state.userInfo, ...action.payload.user })
			);
			return {
				...state,
				userInfo: { ...state.userInfo, ...action.payload.user },
			};
		}
		case ACTIONS.userLogout: {
			return {
				...state,
				userInfo: null,
				cart: {
					...state.cart,
					cartItems: [],
					paymentMethod: '',
					shippingAddress: {},
				},
			};
		}
		case ACTIONS.saveShippingAddress: {
			return {
				...state,
				cart: {
					...state.cart,
					shippingAddress: action.payload,
				},
			};
		}
		case ACTIONS.addpaymentMethod: {
			return {
				...state,
				cart: {
					...state.cart,
					paymentMethod: action.payload,
				},
			};
		}
		case ACTIONS.clearCart: {
			return { ...state, cart: { ...state.cart, cartItems: [] } };
		}
		default:
			return state;
	}
}

// STORE PROVIDER COMPONENET
export function StoreProvider(props) {
	const [state, dispatch] = useReducer(reducer, initialState);
	const storeValue = { state, dispatch };
	return <Store.Provider value={storeValue}>{props.children}</Store.Provider>;
}
