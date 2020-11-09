const mongoose = require('mongoose');

const createStreamUtils = require('./stream-utils');
const createDatabaseUtils = require('./database-utils');
const createPositionHandler = require('./position-handler');
const createSubscriptionHandler = require('./subscription-handler')

const createWriter = require('./writer');
const createReader = require('./reader');

/**
 * Create mestor client.
 * @param {String} connectionUrl      The database connection url including database name. (e.g. mongodb://127.0.0.1:27017/database)
 */
const build = async function ( connectionUrl ) {
  const mongooseConnection = await mongoose.connect(connectionUrl, {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });
  
  const streamUtils = createStreamUtils();
  const databaseUtils = createDatabaseUtils(mongooseConnection, streamUtils);
  
  const positionHandler = createPositionHandler(mongooseConnection, streamUtils);

  const reader = createReader(databaseUtils, positionHandler, streamUtils);
  const writer = createWriter(databaseUtils, positionHandler, streamUtils, reader);
  const subscriptionHandler = createSubscriptionHandler(reader, writer);

  return {
    writer,
    reader,
    subscriptionHandler
  };
};

module.exports = build;
