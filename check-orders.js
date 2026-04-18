const mongoose = require('mongoose');
const Order = require('./src/modules/order/order.model');
const User = require('./src/modules/user/user.model');
require('dotenv').config();

async function checkOrders() {
    await mongoose.connect(process.env.MONGODB_URI);
    const orders = await Order.find().populate('employerId', 'firstName lastName email').limit(5).lean();
    console.log(JSON.stringify(orders, null, 2));
    process.exit(0);
}

checkOrders();
