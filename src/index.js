const { MongoClient } = require('mongodb');

const createStreamUtils = require('./stream-utils');
const createDatabaseUtils = require('./database-utils');
const createPositionHandler = require('./position-handler');
const createSubscriptionHandler = require('./subscription-handler')

const createWriter = require('./writer');
const createReader = require('./reader');

const createEvtStr = async function ( connectionString, databaseName ) {
  const mongoClient = await MongoClient.connect(connectionString, { useUnifiedTopology: true });
  const database = mongoClient.db(databaseName);

  const databaseUtils = createDatabaseUtils(database);

  const positionHandler = createPositionHandler(databaseUtils);

  const streamUtils = createStreamUtils();

  const reader = createReader(databaseUtils, positionHandler, streamUtils);
  const writer = createWriter(databaseUtils, positionHandler, streamUtils, reader);
  const subscriptionHandler = createSubscriptionHandler(reader, writer);

  return {
    writer,
    reader,
    subscriptionHandler
  };
};

module.exports = createEvtStr;
