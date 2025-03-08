const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
});

const Token = sequelize.define('Token', {
    jwt: { type: DataTypes.STRING, allowNull: false },
    cookies: { type: DataTypes.TEXT, allowNull: false },
}, { timestamps: true });

module.exports = { sequelize, Token };
