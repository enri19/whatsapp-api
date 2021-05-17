const { phoneNumberFormatter } = require('../helpers/formatter');

// Send Message
exports.sendMessage = async (req, res) => {
  const number = phoneNumberFormatter(req.body.number);
  const message = req.body.message;

  // eslint-disable-next-line no-undef
  client.sendMessage(number, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
}

