const path = require('path');
const fs = require('fs');

exports.getGameByRequestPath = async (req, res) => {
  // lets grab the game request parameter
  const { game } = req.params;
  // lets set the game param within the public filepath
  const gameDir = `${__dirname}/../../public/${game}/`;
  const filePath = `${__dirname}/../../public/${game}/index.html`;
  // lets check to see if the game exists (async)
  await fs.access(filePath, fs.constants.F_OK, (err) => {
    if (!err) {
      // if it does, lets return it to the client with a 200 response
      res.status(200).sendFile(path.join(gameDir));
    } else {
      // lets send the not found page as a response
      const notFoundPath = `${__dirname}/../../public/theme/404.html`;
      res.status(404).sendFile(path.join(notFoundPath));
    }
  });
};
