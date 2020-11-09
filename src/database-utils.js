const mongoose = require('mongoose');

/**
 * Database utility functions.
 * @param {Object} mongooseConnection     Mongoose connection.
 */
const createDatabaseUtils = function ( mongooseConnection, streamUtils ) {

  const messageSchema = new mongoose.Schema({ 
    _id: String,
    type: String,
    data: Object,
    metadata: Object,
    position: Number,
    globalPosition: { type: Number, index: true },
    time: { type: Date, default: Date.now },
    streamName: String,
    streamCategory: String
  });

  const Message = mongooseConnection.model('Message', messageSchema);

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
    const document = new Message({
      _id: message.id,
      type: message.type,
      position: positions.position,
      globalPosition: positions.globalPosition,
      streamName,
      streamCategory: streamUtils.streamCategory(streamName)
    });

    if (message.data) {
      document.data = message.data;
    }

    if (message.metadata) {
      document.metadata = message.metadata;
    }

    return document;
  };

  return {
    documentToMessage,
    messageToDocument,
    Message
  };
};

module.exports = createDatabaseUtils;
