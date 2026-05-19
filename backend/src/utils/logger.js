/**
 * utils/logger.js
 * Logger estructurado centralizado con Winston.
 *
 * Niveles disponibles: error | warn | info | http | debug
 *
 * En producción: solo error + warn + info (formato JSON compacto para ingesta en plataformas cloud).
 * En desarrollo: todos los niveles con colores y timestamps legibles.
 */

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, printf, json, errors } = format;

const isDev = process.env.NODE_ENV !== 'production';

// ─── Formato desarrollo ───────────────────────────────────────────────────────
const devFormat = combine(
    colorize({ all: true }),
    timestamp({ format: 'HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack }) =>
        stack
            ? `[${timestamp}] ${level}: ${message}\n${stack}`
            : `[${timestamp}] ${level}: ${message}`
    )
);

// ─── Formato producción ───────────────────────────────────────────────────────
// JSON estructurado para Render Logs / Datadog / CloudWatch
const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    json()
);

const logger = createLogger({
    level: isDev ? 'debug' : 'info',
    format: isDev ? devFormat : prodFormat,
    transports: [new transports.Console()],
    exitOnError: false
});

module.exports = logger;
