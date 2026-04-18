const mongoose = require('mongoose');
const Job = require('./src/modules/job/job.model');
require('dotenv').config();

async function checkJobs() {
    await mongoose.connect(process.env.MONGODB_URI);
    const latestJob = await Job.findOne({ title: "TEST admin" }).sort({createdAt: -1}).lean();
    console.log("Latest Job:");
    console.log(JSON.stringify(latestJob, null, 2));
    process.exit(0);
}

checkJobs();
