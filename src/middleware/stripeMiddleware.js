const errorResponse = require('../errors/errorResponse');

const inputRegex =  /^[A-Za-zÁáÉéÍíÓóÚúÑñÜü\s]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const validateStripeCustomerData = (name, email, res) => {
    const errors = [];

    if (!name || !email || !inputRegex.test(name) || !emailRegex.test(email)) {
        errors.push({
            error: errorResponse.INVALID_DATA.code,
            message: errorResponse.INVALID_DATA.message
        });
    } 
    
    if (errors.length > 0) {
        return res.status(400).json({
            errors: errors
        });
    };

    return true;
};


module.exports = {
    validateStripeCustomerData,
}
