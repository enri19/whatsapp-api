module.exports = app => {
  const contact = require('../controllers/contact.controller');
  const verify = require('../routes/verifytoken');
  let router = require('express').Router();

  // Get
  router.get('/', contact.get);

  // Create
  router.post('/create', contact.create);

  app.use('/contacts', verify, router);
}