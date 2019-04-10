import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  type: String,
  chunkId: Number,
  pos: {
    x: Number,
    y: Number,
  },
});

schema.index({ chunkId: 1 });

const GameObject = mongoose.model('GameObject', schema);

export default GameObject;
