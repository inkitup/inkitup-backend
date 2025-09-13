const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Cart = require("../models/cart");

router.get("/usercart", auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.userId });

        if (!cart) {
            cart = new Cart({
                userId: req.user.userId,
                items: []
            });
            await cart.save();
        }

        // Ensure all items have a quantity
        if (cart.items && cart.items.length > 0) {
            cart.items = cart.items.map(item => ({
                ...item.toObject(),
                quantity: item.quantity || 1
            }));
        }

        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/sync", auth, async (req, res) => {
    try {
        const { items } = req.body;

        // Ensure all items have quantity
        const processedItems = items.map(item => ({
            ...item,
            quantity: item.quantity || 1
        }));

        let cart = await Cart.findOne({ userId: req.user.userId });

        if (!cart) {
            cart = new Cart({
                userId: req.user.userId,
                items: processedItems
            });
        } else {
            cart.items = processedItems;
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// New route to update a specific item quantity
router.put("/updatequantity/:itemId", auth, async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "Invalid quantity" });
        }

        let cart = await Cart.findOne({ userId: req.user.userId });
        
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(item => item.id.toString() === itemId);
        
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        
        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;