const Joi = require('joi');

// Register validation
const registerValidation = data => {
  const schema = Joi.object({
    name: Joi.string()
        .min(3)
        .required(true),
    email: Joi.string()
        .min(6)
        .required()
        .email(),
    password: Joi.string()
        .min(6)
        .required()
  });

  return schema.validate(data);
};

// Login validation
const loginValidation = data => {
  const schema = Joi.object({
    email: Joi.string()
        .min(6)
        .required()
        .email(),
    password: Joi.string()
        .min(6)
        .required()
  });

  return schema.validate(data);
};

// Contact validation
const contactValidation = data => {
  const schema = Joi.object({
    name: Joi.string(),
    number: Joi.string()
          .required()
  });

  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.contactValidation = contactValidation;