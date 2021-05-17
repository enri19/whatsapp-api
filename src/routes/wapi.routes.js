module.exports = app => {
  const wapi = require('../controllers/wapi.controller.js');
  let router = require('express').Router();

  router.post('/', wapi.sendMessage);

  app.use('/wapi/send-message', router);
}