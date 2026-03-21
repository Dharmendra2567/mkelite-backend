const mongoose = require('mongoose');
const Job = require('./src/modules/job/job.model');
require('dotenv').config();

const migrateJobIds = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mkelite_portal');
        console.log('Connected to MongoDB for migration...');

        const jobs = await Job.find({ jobId: { $exists: false } });
        console.log(`Found ${jobs.length} jobs without jobId.`);

        for (let job of jobs) {
            let isUnique = false;
            let shortId;
            while (!isUnique) {
                shortId = Math.floor(10000 + Math.random() * 90000).toString();
                const existing = await Job.findOne({ jobId: shortId });
                if (!existing) isUnique = true;
            }
            job.jobId = shortId;
            await job.save();
            console.log(`Assigned jobId ${shortId} to job: ${job.title}`);
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateJobIds();
