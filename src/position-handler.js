const mongoose = require('mongoose');

/**
 * Handler for creating position and global position for new messages.
 * @param {Object} mongooseConnection Mongoose connection
 */
const createPositionHandler = function ( mongooseConnection, streamUtils ) {
  // Global position id incudes a dash '-' since other id's will be category streams which can't have dash.
  const globalPositionId = 'global-position';

  const positionSchema = new mongoose.Schema({ _id: String, position: Number });
  const Position = mongooseConnection.model('Counter', positionSchema);

  //Internal function
  const increamentAndGetPosition = async function (id) {

    const filter = { _id: id };
    const update = { $inc: { position: 1 }};
    const options = { new: true };
    const updateResult = await Position.findOneAndUpdate(filter, update, options).exec();
    /*const counterCollection = await databaseUtils.getCollectionCreateIfNeeded(counterCollectionName);
    const updateResult = await counterCollection.findOneAndUpdate(, { $inc: { position: 1 } },
      {returnOriginal: false});
*/

    if (updateResult) {
      // The update worked and the position document is stored in value property.
      return updateResult.position;
    } else {
      // The update did not work and we need to create a new position document for the stream.
      const newPosition = new Position({  _id: id, position: 1 });
      const savedDoc = await newPosition.save();

      //await counterCollection.insertOne({ _id: streamName, position: 1 });
      return savedDoc.position;
    }
  };

  /**
   * Get current position for a stream.
   * @param  {String} Stream name     Stream name
   * @return {Promise<Number>}        position
   */
  const getCurrentPosition = function (streamName) {
    const document = Position.findById(streamUtils.streamCategory(streamName)).exec();
    //const counterCollection = await databaseUtils.getCollectionCreateIfNeeded(counterCollectionName);
    //const document = await counterCollection.findOne({ _id: streamName });
    return document.position;
  };

  /**
   * Get positions (position and globalPosition) for the next message based on stream and 
   * increament them both by one.
   * @param  {String} streamName    Stream name
   * @return {Promise<Object>}      { position, globalPosition }
   */
  const increamentAndGetPositions = async function (streamName) {
    let [position, globalPosition] = await Promise.all([increamentAndGetPosition(streamUtils.streamCategory(streamName)), 
      increamentAndGetPosition(globalPositionId)]);
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
