const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected to fix indexes...');

        const db = mongoose.connection.db;
        const collection = db.collection('categories');

        // Check current indexes
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes.map(i => i.name));

        if (indexes.find(i => i.name === 'title_1')) {
            console.log('Dropping stale index: title_1');
            await collection.dropIndex('title_1');
            console.log('Index title_1 dropped successfully.');
        } else {
            console.log('Stale index title_1 not found.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error fixing indexes:', err);
        process.exit(1);
    }
};

fixIndexes();
