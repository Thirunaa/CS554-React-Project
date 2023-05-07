const mongoCollections = require("../config/mongoCollections");
const validation = require("../validations/dataValidations");
const users = mongoCollections.users;

const createUser = async (userId, emailAddress, displayName) => {
  validation.validateName(displayName);

  const usersCollection = await users();
  const findUser = await usersCollection.findOne({ _id: userId });
  const namedUser = await usersCollection.findOne({ displayName });
  if (findUser || namedUser) {
    throw `User already exists with given displayName / id.`;
  }
  let user = {
    _id: userId,
    emailAddress,
    displayName,
    favouriteMatches: [],
    favouritePlayers: [],
    imageUrl: "",
  };
  const insertUser = await usersCollection.insertOne(user);
  if (insertUser.insertedCount === 0) throw `Couldn't insert user to database.`;
  return await usersCollection.findOne({ _id: insertUser.insertedId });
};

const getUserById = async (userId) => {
  const usersCollection = await users();
  const user = await usersCollection.findOne({ _id: userId });
  return user;
};

const addRemoveFavoriteMatch = async (userId, matchId) => {
  console.log("saveFavoriteMatch");
  const usersCollection = await users();
  const user = await usersCollection.findOne({ _id: userId });

  if (user.favouriteMatches.includes(matchId)) {
    const updatingUser = await usersCollection.updateOne({ _id: userId }, { $pull: { favouriteMatches: matchId } });
    if (!updatingUser.modifiedCount) throw `Unsave match from user was unsuccessful.`;
  } else {
    const updatingUser = await usersCollection.updateOne({ _id: userId }, { $addToSet: { favouriteMatches: matchId } });
    if (!updatingUser.modifiedCount) throw `Save match to user was unsuccessful.`;
  }
  const updatedUser = await usersCollection.findOne({ _id: userId });
  console.log(updatedUser);
  return updatedUser;
};

const addRemoveFavoritePlayer = async (userId, playerId) => {
  console.log("addFavoritePlayer");
  const usersCollection = await users();
  const user = await usersCollection.findOne({ _id: userId });

  if (user.favouritePlayers.includes(playerId)) {
    const updatingUser = await usersCollection.updateOne({ _id: userId }, { $pull: { favouritePlayers: playerId } });
    if (!updatingUser.modifiedCount) throw `Deleting player from user was unsuccessful.`;
  } else {
    const updatingUser = await usersCollection.updateOne(
      { _id: userId },
      { $addToSet: { favouritePlayers: playerId } }
    );
    if (!updatingUser.modifiedCount) throw `Adding player to user was unsuccessful.`;
  }
  const updatedUser = await usersCollection.findOne({ _id: userId });
  console.log(updatedUser);
  return updatedUser;
};

const removeFavoriteMatch = async (userId, matchId) => {
  const usersCollection = await users();

  const updatingUser = await usersCollection.updateOne({ _id: userId }, { $pull: { favouriteMatches: matchId } });

  if (!updatingUser.modifiedCount) throw `Removing match from user was unsuccessful.`;

  const updatedUser = await usersCollection.findOne({ _id: userId });

  return updatedUser;
};

const removeFavoritePlayer = async (userId, playerId) => {
  const usersCollection = await users();

  const updatingUser = await usersCollection.updateOne({ _id: userId }, { $pull: { favouritePlayers: playerId } });

  if (!updatingUser.modifiedCount) throw `Removing player from user was unsuccessful.`;

  const updatedUser = await usersCollection.findOne({ _id: userId });

  return updatedUser;
};

const checkDisplayName = async (name) => {
  validateDisplayName(name);
  const usersCollection = await users();
  const findUser = await usersCollection.findOne({
    displayName: { $regex: new RegExp("^" + name + "$", "i") },
  });
  if (findUser) {
    throw `This username is not available. Please use some other name instead.`;
  }
  return { isAvailable: true };
};

module.exports = {
  createUser,
  getUserById,
  addRemoveFavoriteMatch,
  addRemoveFavoritePlayer,
  removeFavoriteMatch,
  removeFavoritePlayer,
  checkDisplayName,
};
