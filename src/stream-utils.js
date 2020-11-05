/**
 * Utility functions for stream names.
 */
const createStreamUtils = function () {

  const EntityType = 'EntityType';
  const CategoryType = 'CategoryType';

  function streamType(streamName) {
    if(streamName.indexOf('-') === -1) {
      return CategoryType;
    } else {
      return EntityType;
    }
  }

  function streamCategory(streamName) {
    if(streamType(streamName) === EntityType) {
      return streamName.split('-')[0]
    } else {
      return streamName;
    }
  }

  return {
    EntityType,
    CategoryType,
    streamType,
    streamCategory
  };
  
};

module.exports = createStreamUtils;
