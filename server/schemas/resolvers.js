const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async function (parent, args, context) {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate("books");

        return userData;
      }

      throw new AuthenticationError('Not logged in');
    },
  },

  Mutation: {

    addUser: async function (parent, args) {
        const user = await User.create(args);
        const token = signToken(user);

        return { token, user }
    },

    login: async function (parent, { email, password }) {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async function (parent, { input }, context) {
      if (context.user) {
          const updateUserBook = await User.findOneAndUpdate(
              { _id: context.user._id },
              { $addToSet: { saveBooks: input } },
              { new: true }
          )
          console.log(updateUserBook);
          return updateUserBook;
      }
      throw new AuthenticationError("You need to login first!");
    },
    
    removeBook: async function (parent, { bookId }, context) {
      if (context.user) {
          const updateUserBook = await User.findOneAndUpdate(
              { _id: context.user._id },
              { $pull: { saveBooks: { bookId: bookId } } },
              { new: true }
          )
          return updateUserBook;
      }
      throw new AuthenticationError("You need to login first!");
  }
  },
};

module.exports = resolvers;
