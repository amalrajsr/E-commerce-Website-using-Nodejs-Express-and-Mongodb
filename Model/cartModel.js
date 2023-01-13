const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },

  cart_items: [
    {
      product: { type: mongoose.Types.ObjectId, ref: "product" },
      quantity: {
        type: Number,
        default: 1,      
      },
    }
  ],
  total_price:{

    type:Number,
  },
  couponDiscount:{
    type:Number
  }
});

module.exports = mongoose.model("cart", cartSchema);
