const app = require('./app');
// Triggering server reload for new route registration
const connectDB = require('./config/db');
const seedCategories = require('./modules/category/category.seed');

// Connect to database
const startServer = async () => {
    await connectDB();
    
    // Removed temporary index drop scripts

    // await seedCategories();
};

startServer();

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        await app.listen({ port: PORT, host: '0.0.0.0' });
        app.log.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    app.log.error(`Error: ${err.message}`);
    // Close server & exit process
    app.close().then(() => process.exit(1));
});
