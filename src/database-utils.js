/**
 * Database utility functions.
 * @param {Object} database     MongoClient.db
 */
const createDatabaseUtils = function ( database ) {
  /**
   * Converts a database document into a message (_id => id).
   * @param {Object} document     Database document
   */
  const documentToMessage = function (document) {
    const message = {
      id: document._id,
      type: document.type,
      position: document.position,
      globalPosition: document.globalPosition,
      time: document.time,
      streamName: document.streamName,
    };

    if (document.data) {
      message.data = document.data;
    }

    if (document.metadata) {
      message.metadata = document.metadata;
    }

    return message;
  };

  /**
   * Coverts a message into a database document.
   * @param {*} message       The message
   * @param {*} streamName    The stream name (may not be part of the message)
   * @param {*} positions     Positions object with the messages position and globalPosition.
   */
  const messageToDocument = function (message, streamName, positions) {
    const document = {
      _id: message.id,
      type: message.type,
      position: positions.position,
      globalPosition: positions.globalPosition,
      time: Date.now(),
      streamName,
    };

    if (document.data) {
      document.data = message.data;
    }

    if (document.metadata) {
      document.metadata = message.metadata;
    }

    return document;
  };

  /**
   * Returns a database collection based on name, throws error if it does not exist.
   * @param  {String} collectionName    The collection name
   * @return {Promise}                  The collection
   */
  const getCollection = async function (collectionName) {
    // Promisify the get collection callback.
    const collectionResultPromise = (name, options) => {
      return new Promise((resolve, reject) => {
        database.collection(name, options, (err, collection) => {
          if (err) return reject(err);
          resolve(collection);
        });
      });
    };

    // Strict mode throws error when collection doesn't exist.
    return await collectionResultPromise(collectionName, { strict: true });
  };

  /**
   * Returns a database collection based on name, creates it if it does not exist.
   * @param  {String} collectionName    The collection name
   * @return {Promise}                  The collection
   */
  const getCollectionCreateIfNeeded = async function (collectionName) {
    // When not using strict mode the collection gets created when it doesn't exist.
    return await database.collection(collectionName);
  };

  return {
    documentToMessage,
    messageToDocument,
    getCollection,
    getCollectionCreateIfNeeded,
  };
};

module.exports = createDatabaseUtils;
