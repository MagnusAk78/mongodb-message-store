/**
 * The writer object exposes the write function.
 * @param {*} databaseUtils     database-utils
 * @param {*} positionHandler   position-handler
 * @param {*} streamUtils       stream-utils
 * @param {*} reader            reader
 */
const createWriter = function ( databaseUtils, positionHandler, streamUtils, reader ) {

  /**
   * Writes a message to a stream.
   * @param  {String} streamName      Stream name
   * @param  {String} message         The message to write (event or command)
   * @param  {Number} expectedVersion The expected version og the stream, a.k.a current highest position
   * @return {Promise<Object>}        The message written
   */
  async function write(streamName, message, expectedVersion = undefined) {
    if (!message.id) {
      throw new Error('Messages must have an id');
    }
    if (!message.type) {
      throw new Error('Messages must have a type');
    }

    const streamCategory = streamUtils.streamCategory(streamName);

    if(expectedVersion) {
      const lastMessage = await reader.readLastMessage(streamCategory);
      if((lastMessage && expectedVersion !== lastMessage.position) ||
        (!lastMessage && expectedVersion !== 0)) {
        throw new Error('Stream version conflict. expectedVersion=' + expectedVersion +
        ', current version=' + lastMessage.position);
      }
    }

    //const collection = await databaseUtils.getCollectionCreateIfNeeded(streamCategory);
    const positions = await positionHandler.increamentAndGetPositions(streamCategory);

    const document = databaseUtils.messageToDocument(message, streamName, positions);

    const result = await document.save();
    
    //const result = await collection.insertOne(document);
    return databaseUtils.documentToMessage(result);
  };

  return {
    write,
  };
};

module.exports = createWriter;
