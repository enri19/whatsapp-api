const Contact = require('../models/contact.model');
const { contactValidation } = require('../common/validations');

// Get contact
exports.get = async (req, res) => {
  const result = await Contact.find();
  res.send(result);
}

// Create contact
exports.create = async (req, res) => {
  // Validate
  const { error } = contactValidation(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  // Create new contact
  const contact = new Contact({
    name: req.body.name,
    number: req.body.number
  });

  try {
    const result = await contact.save();
    res.send(result);
  } catch(err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while creating the post'
    });
  }
};
