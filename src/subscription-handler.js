const uuid = require('uuid/v4');

/**
 * The subscription handler exposes the createSubscription function.
 * @param {*} reader    reader
 * @param {*} writer    writer
 */
const createSubscriptionHandler = function (reader, writer) {
  // Internal function, reads subsribers position from database.
  async function readPosition(subscriberStreamName) {
    const lastPositionMessage = await reader.readLastMessage(subscriberStreamName);
    return lastPositionMessage ? lastPositionMessage.data.position : 0;
  }

  // Internal function, writes subsribers position to database.
  function writePosition(subscriberStreamName, position) {
    const positionMessage = {
      id: uuid(),
      type: 'ReadPosition',
      data: { position },
    };

    return writer.write(subscriberStreamName, positionMessage);
  }

  /**
   * Creates a subscription to a stream. A subscription must be stared with the start function
   * and stopped with the stop function.
   * @param {String} streamName                             Stream name
   * @param {Object<EventType, function (event)>} handlers  The handlers that should handle incomming events
   * @param {String} subscriberId                           Subscriber ID
   * @param {Number} maxMessagesPerTick                     How many messages should maximum be handled tick
   * @param {Number} positionUpdateInterval                 How often should the read position be stored to database
   * @param {Number} pollIntervalMs                         How often should subscription poll for new messages
   */
  function createSubscription(
    streamName,
    handlers,
    subscriberId,
    maxMessagesPerTick = 100,
    positionUpdateInterval = 100,
    pollIntervalMs = 100
  ) {
    const subscriberStreamName = ['subscriberPosition-', subscriberId].join().toString();

    let currentGlobalPosition = 0;
    let messagesSinceLastPositionWrite = 0;
    let keepGoing = true;

    // Internal function, updates the global position of the subscription.
    function updateGlobalPosition(globalPosition) {
      currentGlobalPosition = globalPosition;
      messagesSinceLastPositionWrite += 1;

      if (messagesSinceLastPositionWrite === positionUpdateInterval) {
        messagesSinceLastPositionWrite = 0;

        writePosition(subscriberStreamName, currentPosition);
      }
    }

    // Internal function, send message to corresponding handlers.
    function handleMessage(message) {
      const handler = handlers[message.type] || handlers.$any;

      return handler ? handler(message) : Promise.resolve(true);
    }

    // Internal function, read messages and handle them.
    async function tick() {
      let messagesHandled = 0;
      try {
        const messages = await reader.read(streamName, currentGlobalPosition + 1, maxMessagesPerTick);
        messages.forEach(async (message) => {
          try {
            await handleMessage(message);
            await updateGlobalPosition(message.globalPosition);
            messagesHandled += 1;
          } catch (err) {
            console.error('error handling message => %j', message);

            throw err;
          }
        });
      } catch (err) {
        console.error('Subscription failed, Error => %j', err);
        stop();
      }
      return messagesHandled;
    }

    // Internal function, poll for new messages.
    async function poll() {
      currentPosition = await readPosition(subscriberStreamName);

      while (keepGoing) {
        const nrOfMessages = await tick();

        if (nrOfMessages === 0) {
          await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
        }
      }
    }

    /**
     * Start the subscription.
     */
    function start() {
      return poll();
    }

    /**
     * Stop the subscription.
     */
    function stop() {
      keepGoing = false;
    }

    return {
      start,
      stop,
    };
  }

  return {
    createSubscription,
  };
};

module.exports = createSubscriptionHandler;
