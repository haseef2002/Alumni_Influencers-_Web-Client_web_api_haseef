const Joi = require('joi');

const validateRegistration = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required().custom((value, helpers) => {
            if (!value.endsWith('@university.edu')) return helpers.message("Must be a @university.edu email");
            return value;
        }),
        password: Joi.string().min(8).required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    next();
};

const validateBid = (req, res, next) => {
    const schema = Joi.object({
        bid_amount: Joi.number().positive().precision(2).required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    next();
};

module.exports = { validateRegistration, validateBid };