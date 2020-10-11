const path = require('path');

exports.handleError = async (err, req, res, next) => {
  if (err.statusCode * 1 === 404) {
    // lets send the 404 page to the client
    res.sendFile(path.join(`${__dirname}/../../public/theme/404.html`));
  }
  next();
};
