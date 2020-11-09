const test = require('ava');
const uuid = require('uuid/v4');

const {MongoMemoryServer} = require('mongodb-memory-server');
const mongod = new MongoMemoryServer({
  binary: {
    version: '3.6.2'
  }
});

const createEvtStr = require('../src/index');

let evtStr = null;

//const databaseName = 'evt-str-test';
const fixedUUID = 'd785277c-196b-4361-b689-611d959ed03e';

test.before(async () => {
  const mongodbMemoryServerUri = await mongod.getUri();
  evtStr = await createEvtStr(mongodbMemoryServerUri, { autoReconnect: true, reconnectTries: Number.MAX_VALUE, reconnectInterval: 1000 });
});

test.after.always('cleanup', t => {
	// Nothing
});

function getCategory(streamName) {
  if (streamName == null) {
    return ''
  }

  return streamName.split('-')[0]
}

const getTestStreamName = function (number) {
  return 'test_stream' + number + '-' + fixedUUID;
};

test.serial('createEvtStr returns nicely when correct connection string is used', async (t) => {
  t.not(evtStr.reader, null);
  t.not(evtStr.writer, null);
});

test.serial('Written messages should get a position, global position, and time', async (t) => {
  const eventMessage = { id: uuid(), type: 'EventHappened', data: {} };
  const messageWritten = await evtStr.writer.write(getTestStreamName(1), eventMessage);

  t.assert(messageWritten.position, 'No position');
  t.assert(messageWritten.globalPosition, 'No globalPosition');
  t.assert(messageWritten.time, 'No time');
});

test.serial('Reader.read should be able to read 3 written events', async (t) => {
  const streamName = getTestStreamName(2);

  const eventMessage1 = { id: uuid(), type: 'EventHappened', data: { randomId: uuid() } };
  const eventMessage2 = { id: uuid(), type: 'EventHappened', data: { randomId: uuid() } };
  const eventMessage3 = { id: uuid(), type: 'EventHappened', data: { randomId: uuid() } };

  const messageWritten1 = await evtStr.writer.write(streamName, eventMessage1);
  const messageWritten2 = await evtStr.writer.write(streamName, eventMessage2);
  const messageWritten3 = await evtStr.writer.write(streamName, eventMessage3);

  const messages = await evtStr.reader.read(getCategory(streamName), messageWritten1.globalPosition, 3);

  t.is(messages.length, 3);
  t.deepEqual(messageWritten1, messages[0]);
  t.deepEqual(messageWritten2, messages[1]);
  t.deepEqual(messageWritten3, messages[2]);
});

test.serial('Reader.readLastMessage should return last message written', async (t) => {
  const streamName = getTestStreamName(3);

  const eventMessage = { id: uuid(), type: 'EventHappened', data: { randomId: uuid() } };

  const messageWritten = await evtStr.writer.write(streamName, eventMessage);

  const lastMessage = await evtStr.reader.readLastMessage(getCategory(streamName));

  t.deepEqual(messageWritten, lastMessage);
});

test.serial('loadEntity', async (t) => {
  const createdType = 'Created';
  const closedType = 'Closed';
  const specificId1 = '019234567';
  const streamName1 = 'loadentitystream-' + specificId1;
  const specificId2 = '835729042';
  const streamName2 = 'loadentitystream-' + specificId2;

  const createdEventMessage11 = {
    id: uuid(),
    type: createdType,
    data: {},
  };

  const closedEventMessage12 = {
    id: uuid(),
    type: closedType,
    data: {},
  };

  const createdEventMessage21 = {
    id: uuid(),
    type: createdType,
    data: {},
  };

  const isClosedProjection = {
    $init: () => ({ closed: false }),
    [createdType]: (state, event) => ({
      ...state,
      id: event.streamName.split('-')[1],
    }),
    [closedType]: (state, event) => ({
      ...state,
      closed: true,
    }),
  };

  // Create and close stream1
  await evtStr.writer.write(streamName1, createdEventMessage11);
  await evtStr.writer.write(streamName1, closedEventMessage12);

  // Only Create stream2
  await evtStr.writer.write(streamName2, createdEventMessage21);

  const entity1 = await evtStr.reader.loadEntity(streamName1, isClosedProjection);
  const entity2 = await evtStr.reader.loadEntity(streamName2, isClosedProjection);

  t.deepEqual(entity1.id, specificId1);
  t.true(entity1.closed);

  t.deepEqual(entity2.id, specificId2);
  t.false(entity2.closed);
});

test.serial('Subscription handler Should let subscriber handle all messages in stream', async (t) => {
  const streamName = getTestStreamName(4);
  const category = getCategory(streamName);

  const eventMessage1 = { id: uuid(), type: 'EventHappened', data: { randomId: uuid() } };
  const eventMessage2 = { id: uuid(), type: 'EventHappened', data: { randomId: uuid() } };
  const eventMessage3 = { id: uuid(), type: 'EventHappened', data: { randomId: uuid() } };

  const subscriberId = 'subscriberId';

  let handledMessageCount = 0
  const handlers = {
    EventHappened: async () => {
      handledMessageCount++;
    }
  }

  const subscription = evtStr.subscriptionHandler.createSubscription(category, handlers, subscriberId);
  subscription.start();

  // Wait a while so the subscription gets time to handle all messages already in queue
  await new Promise(resolve => setTimeout(resolve, 300));

  // Clear the counter again
  handledMessageCount = 0

  //Write three new messages
  const messageWritten1 = await evtStr.writer.write(streamName, eventMessage1);
  const messageWritten2 = await evtStr.writer.write(streamName, eventMessage2);
  const messageWritten3 = await evtStr.writer.write(streamName, eventMessage3);

  // Wait a while so the subscription gets time to handle the three new messages
  await new Promise(resolve => setTimeout(resolve, 300));

  subscription.stop();

  // Check that we received exactly three messages
  t.deepEqual(handledMessageCount, 3);
});

test.serial('Write with expected version should work if correct and throw error if wrong', async (t) => {
  const streamName = getTestStreamName(5);
  const eventMessage1 = { id: uuid(), type: 'EventHappened', data: { fruit: 'banana' } };
  const eventMessage2 = { id: uuid(), type: 'EventHappened', data: { fruit: 'orange' } };
  const eventMessage3 = { id: uuid(), type: 'EventHappened', data: { fruit: 'pinaple' } };

  const messageWritten1 = await evtStr.writer.write(streamName, eventMessage1);
  const lastMessage1 = await evtStr.reader.readLastMessage(getCategory(streamName));
  const messageWritten2 = await evtStr.writer.write(streamName, eventMessage2, lastMessage1.position);
  const lastMessage2 = await evtStr.reader.readLastMessage(getCategory(streamName));
  
  t.deepEqual(lastMessage2, messageWritten2);

  const messageWritten3 = evtStr.writer.write(streamName, eventMessage3, lastMessage2.position - 1);

  const error = await t.throwsAsync(messageWritten3);
  t.assert(error.message.startsWith('Stream version conflict.'));
});