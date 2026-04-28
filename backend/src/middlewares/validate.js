const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse(req.body);
        // Replace req.body with parsed data (which includes default values and stripped unknowns if configured)
        req.body = parsed;
        next();
    } catch (error) {
        // Zod throws an error that has an 'errors' array
        if (error.errors) {
            const errorMessages = error.errors.map(err => {
                let msg = err.message;
                if (typeof msg === 'string' && msg.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(msg);
                        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].message) {
                            msg = parsed[0].message;
                        }
                    } catch(e) {}
                }
                return `${err.path.join('.')}: ${msg}`;
            });
            return res.status(400).json({
                success: false,
                errors: errorMessages
            });
        }
        next(error);
    }
};

module.exports = validate;
