'use strict';
const bcrypt = require("bcrypt");
const AppError = require('../../utils/appError');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userType: {
      type: DataTypes.ENUM("0", "1", "2"),
      allowNull: false,
      validate: {
        notNull: {
          msg: "userType cannot be null"
        },
        notEmpty: {
          msg: "userType cannot be empty"
        }
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "firstName cannot be null"
        },
        notEmpty: {
          msg: "firstName cannot be empty"
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "lastName cannot be null"
        },
        notEmpty: {
          msg: "lastName cannot be empty"
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "email cannot be null"
        },
        notEmpty: {
          msg: "email cannot be empty"
        },
        isEmail: {
          msg: "Invalid email id"
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "password cannot be null"
        },
        notEmpty: {
          msg: "password cannot be empty"
        },

      }
    },
    confirmPassword: {
      type: DataTypes.VIRTUAL,
      set(value) {
        if (value === this.password) {
          const hashPassword = bcrypt.hashSync(value, 10)
          this.setDataValue('password', hashPassword)
        }
        else {
          throw new AppError(
            'Password and confirm password must be the same', 400
          )
        }
      }
    },
    avatarId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'images',
        key: 'id'
      }
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpire: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    deletedAt: {
      type: DataTypes.DATE

    }
  }, {
    paranoid: true,
    freezeTableName: true,
    modelName: "user"
  });

  // Define associations
  User.associate = function (models) {
    User.belongsTo(models.images, {
      foreignKey: 'avatarId',
      as: 'avatar'
    });
  };

  return User;
};