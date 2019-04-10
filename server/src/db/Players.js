import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  username: String,
  gameObjectId: mongoose.ObjectId,
});

schema.index({ username: 1 }, { unique: true });

const Player = mongoose.model('Player', schema);

export default Player;
