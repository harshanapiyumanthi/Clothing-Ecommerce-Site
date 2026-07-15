import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  wishlistItems: JSON.parse(localStorage.getItem('wishlist') || '[]')
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const existItem = state.wishlistItems.find(x => x.id === product.id);

      if (existItem) {
        state.wishlistItems = state.wishlistItems.filter(x => x.id !== product.id);
      } else {
        state.wishlistItems.push(product);
      }

      localStorage.setItem('wishlist', JSON.stringify(state.wishlistItems));
    },
    removeFromWishlist: (state, action) => {
      state.wishlistItems = state.wishlistItems.filter(x => x.id !== action.payload);
      localStorage.setItem('wishlist', JSON.stringify(state.wishlistItems));
    },
    clearWishlist: (state) => {
      state.wishlistItems = [];
      localStorage.setItem('wishlist', JSON.stringify([]));
    }
  }
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
