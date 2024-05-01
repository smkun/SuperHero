const Counter = require('../models/Counter');


async function getNextSequence(name) {
    await initializeCounter(name);
  
    const ret = await Counter.findOneAndUpdate(
      { _id: name },
      { $inc: { seq: 1 } },
      { new: true }
    );
  
    return ret.seq;
  }

async function initializeCounter(name) {
    const existingCounter = await Counter.findOne({ _id: name });
    if (!existingCounter) {
      await Counter.create({ _id: name, seq: 0 });
    }
  }

  module.exports = {
    getNextSequence,
    initializeCounter,
  };