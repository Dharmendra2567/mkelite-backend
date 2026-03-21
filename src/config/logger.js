const pino = require('pino');

const loggerConfig = {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
        },
    } : undefined,
};

const logger = pino(loggerConfig);

module.exports = { logger, loggerConfig };
