/**
 * Handler for creating position and global position for new messages.
 * @param {Object} databaseUtils database-utils
 */
const createPositionHandler = function ( databaseUtils ) {
  const counterCollectionName = 'maak-evt-str-counter';
  const globalPositionId = 'global_position';

  //Internal function
  const increamentAndGetPosition = async function (streamName) {
    const counterCollection = await databaseUtils.getCollectionCreateIfNeeded(counterCollectionName);
    const updateResult = await counterCollection.findOneAndUpdate({ _id: streamName }, { $inc: { position: 1 } },
      {returnOriginal: false});

    if (updateResult.value) {
      // The update worked and the position document is stored in value property.
      return updateResult.value.position;
    } else {
      // The update did not work and we need to create a new position document for the stream.
      await counterCollection.insertOne({ _id: streamName, position: 1 });
      return 1;
    }
  };

  /**
   * Get current position for a stream.
   * @param  {String} streamName    Stream name
   * @return {Promise<Number>}      position
   */
  const getCurrentPosition = async function (streamName) {
    const counterCollection = await databaseUtils.getCollectionCreateIfNeeded(counterCollectionName);
    const document = await counterCollection.findOne({ _id: streamName });
    return document.position;
  };

  /**
   * Get positions (position and globalPosition) for the next message based on stream and 
   * increament them both by one.
   * @param  {String} streamName    Stream name
   * @return {Promise<Object>}      { position, globalPosition }
   */
  const increamentAndGetPositions = async function (streamName) {
    let [position, globalPosition] = await Promise.all([increamentAndGetPosition(streamName), increamentAndGetPosition(globalPositionId)]);
    return {
      position,
      globalPosition,
    };
  };

  return {
    getCurrentPosition,
    increamentAndGetPositions
  };
};

module.exports = createPositionHandler;
