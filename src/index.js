const mongoose = require('mongoose');

const createStreamUtils = require('./stream-utils');
const createDatabaseUtils = require('./database-utils');
const createPositionHandler = require('./position-handler');

const createReader = require('./reader');
const createWriter = require('./writer');
const createSubscriptionHandler = require('./subscription-handler');

/**
 * Create mestor client.
 * @param {String} connectionUrl      The database connection url including database name. (e.g. mongodb://127.0.0.1:27017/database)
 */
const build = async function (connectionUrl) {
  const mongooseConnection = await mongoose.createConnection(connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  const streamUtils = createStreamUtils();
  const databaseUtils = createDatabaseUtils(mongooseConnection, streamUtils);
  const positionHandler = createPositionHandler(mongooseConnection, streamUtils);

  const reader = createReader(databaseUtils, streamUtils);
  const writer = createWriter(databaseUtils, positionHandler, streamUtils, reader);
  const subscriptionHandler = createSubscriptionHandler(reader, writer);

  return {
    writer,
    reader,
    subscriptionHandler,
  };
};

module.exports = build;
