const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse(req.body);
        // Replace req.body with parsed data (which includes default values and stripped unknowns if configured)
        req.body = parsed;
        next();
    } catch (error) {
        // Zod throws an error that has an 'errors' array
        if (error.errors) {
            const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
            return res.status(400).json({
                success: false,
                errors: errorMessages
            });
        }
        next(error);
    }
};

module.exports = validate;
