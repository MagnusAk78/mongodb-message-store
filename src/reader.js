/**
 * The projection function that the loadEntity use to reduce a stream into an entity.
 * @param {Array} events
 * @param {Object} projection
 */
function project(events, projection) {
  return events.reduce((entity, event) => {
    if (!projection[event.type]) {
      return entity;
    }

    return projection[event.type](entity, event);
  }, projection.$init());
}

/**
 * The reader object exposes three functions => loadEntity,read, and readLastMessage.
 *
 * @param {bject} databaseUtils     database-utils
 * @param {bject} positionHandler   position-handler
 * @param {Object} streamUtils      stream-utils
 */
const createRead = function (databaseUtils, positionHandler, streamUtils) {
  /**
   * @description Loads a state of an entity from the store by reading all messages for
   * given (entity) stream and put them through given projection (reduce).
   * The projection need to define a handler for needed event types. It also need to define
   * the $init entity object that starts of the reduce function (projection).
   * @param {string} streamName         The name of the stream (this is most likely an entity stream)
   * @param {Object} projection         The projection to run it through
   * @param {Object} projection.$init   Starting state for the projection
   */
  async function loadEntity(streamName, projection) {
    const messages = await read(streamName);

    const projectedStream = project(messages, projection);

    return projectedStream;
  }

  /**
   * Reads messages from specified stream.
   * @param  {String} streamName          Stream name
   * @param  {Number} fromGlobalPosition  Global position to start reading from
   * @param  {Number} maxMessages         The maximum number of messages to read
   * @return {Promise<Array>}             Messages
   */
  async function read(streamName, fromGlobalPosition = 0, maxMessages = 1000) {
    const query = {
      streamCategory: streamUtils.streamCategory(streamName),
    };
    const streamType = streamUtils.streamType(streamName);
    if (streamType === streamUtils.EntityType) {
      query.streamName = streamName;
    }

    const documents = await databaseUtils.Message.find(query)
      .where('globalPosition')
      .gte(fromGlobalPosition)
      .sort({ globalPosition: 1 })
      .limit(maxMessages)
      .exec();

    return documents.map((doc) => databaseUtils.documentToMessage(doc));
  }

  /**
   * Reads the last message written to a stream.
   * @param {String} streamName   Stream name
   */
  async function readLastMessage(streamName) {
    const query = {
      streamCategory: streamUtils.streamCategory(streamName),
    };
    const streamType = streamUtils.streamType(streamName);
    if (streamType === streamUtils.EntityType) {
      query.streamName = streamName;
    }
    const docs = await databaseUtils.Message.find(query)
      .sort({ globalPosition: -1 })
      .limit(1).exec();

    return docs.length === 1 ? databaseUtils.documentToMessage(docs[0]) : null;
  }

  return {
    loadEntity,
    read,
    readLastMessage,
  };
};

module.exports = createRead;
