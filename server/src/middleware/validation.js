const Joi = require('joi');

/**
 * Validation Schemas
 */

const registerSchema = Joi.object({
    name: Joi.string().required().min(2).max(100).messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
    }),
    email: Joi.string().required().messages({
        'string.empty': 'Email/Username is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'string.empty': 'Password is required',
    }),
    role: Joi.string().valid('Admin', 'Compliance Officer', 'Manager', 'Employee', 'Auditor'),
    department: Joi.string(),
});

const loginSchema = Joi.object({
    email: Joi.string().required().messages({
        'string.empty': 'Email/Username is required',
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required',
    }),
});

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        'string.empty': 'Refresh token is required',
    }),
});

const regulationSchema = Joi.object({
    title: Joi.string().required().min(5).max(200),
    description: Joi.string().required(),
    category: Joi.string(),
    riskLevel: Joi.string().valid('Low', 'Medium', 'High'),
    effectiveDate: Joi.date(),
    status: Joi.string().valid('Active', 'Inactive', 'Draft'),
});

const taskSchema = Joi.object({
    title: Joi.string().required().min(5).max(200),
    description: Joi.string(),
    regulationId: Joi.string().required(),
    assignedTo: Joi.string().required(),
    dueDate: Joi.date().required(),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical'),
});

/**
 * Validation Middleware
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message,
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors,
            });
        }

        next();
    };
};

module.exports = {
    validate,
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    regulationSchema,
    taskSchema,
};
