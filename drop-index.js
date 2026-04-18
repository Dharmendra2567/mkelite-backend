const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const dropIndex = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to MongoDB: ${conn.connection.host}`);

        const collection = conn.connection.collection('applications');
        
        console.log('Current indexes:');
        const indexes = await collection.indexes();
        console.log(JSON.stringify(indexes, null, 2));

        if (indexes.some(idx => idx.name === 'job_1_user_1')) {
            console.log('Dropping index job_1_user_1...');
            await collection.dropIndex('job_1_user_1');
            console.log('Index job_1_user_1 dropped successfully.');
        } else {
            console.log('Index job_1_user_1 not found.');
        }

        // Also check if they are using 'job' or 'user' fields in other stale indexes
        const staleIndexes = indexes.filter(idx => idx.key.job || idx.key.user);
        for (const idx of staleIndexes) {
            console.log(`Dropping stale index ${idx.name}...`);
            await collection.dropIndex(idx.name);
            console.log(`Index ${idx.name} dropped.`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

dropIndex();
