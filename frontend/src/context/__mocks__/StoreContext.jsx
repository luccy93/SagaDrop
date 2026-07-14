const React = require("react");

const mockStore = {
  cart: [],
  totals: { subtotal: 0, items: 0 },
  removeFromCart: jest.fn(),
  updateQty: jest.fn(),
  clearCart: jest.fn(),
  cartOpen: true,
  setCartOpen: jest.fn(),
};

function StoreProvider({ children }) {
  return React.createElement(React.Fragment, null, children);
}

const useStore = jest.fn(() => mockStore);

module.exports = { StoreProvider, useStore };
