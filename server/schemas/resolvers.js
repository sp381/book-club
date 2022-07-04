const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('book')

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

    login: async (parent, { email, password }) => {
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
    saveBook: async (parent, args, context) => {
      if (context.book) {
        const book = await Book.create({ ...args, author: context.user.author });

        await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { book: book._id } },
          { new: true }
        );

        return book;
      }

      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

module.exports = resolvers;
