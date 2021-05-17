/*eslint no-undef: "error"*/
/*eslint-env node*/
const User = require('../models/user.model');
const { registerValidation, loginValidation } = require('../common/validations');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
exports.register = async (req, res) => {
  //Validate
  const { error } = registerValidation(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  // Checking if user is already exists
  const emailExist = await User.findOne({email: req.body.email});
  if (emailExist) return res.status(400).send('email already exists');

  // Hash password
  const salt = bcrypt.genSaltSync(10);
  const hashPasword = bcrypt.hashSync(req.body.password, salt);
  
  // Create a new User
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPasword
  });

  try {
    await user.save();
    res.send({id: user._id, name: user.name, email: user.email});
  } catch(err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while creating the post'
    });
  }
};

// Login
exports.login = async (req, res) => {
  // Validate
  const { error } = loginValidation(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  // Checking if user is already exists
  const user = await User.findOne({email: req.body.email});
  if (!user) return res.status(400).send('User not exists');

  // Checking password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send('Invalid password!');

  // Create and assign token
  const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
  res.header('Auth-Token', token).send(token);
};
