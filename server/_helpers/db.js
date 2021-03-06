require('dotenv').config()
const config = require('../config.json');
const mysql = require('mysql');
const { Sequelize } = require('sequelize');
const { initiateUnsuspendJobs } = require('./scheduler-jobs')

module.exports = db = {};

initialize();

async function initialize(){
    // Local host connection
    const { host, port, user, password, database } = config.database
    const connection = await mysql.createConnection({ host, port, user, password })
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`)
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' })

    //Cloud connection
    // const sequelize = new Sequelize(process.env.DB_CONNECTION_STRING)

    db.sequelize = sequelize

    //Create tables
    db.user = require('../models/user.model')(sequelize)
    db.post = require('../models/post.model')(sequelize)
    db.comment = require('../models/comment.model')(sequelize)
    db.postReact = require('../models/post_reaction')(sequelize)
    db.commentReact = require('../models/comment_reaction.model')(sequelize)
    db.userSuspension = require('../models/user_suspension.model')(sequelize)
    db.postSuspension = require('../models/post_suspension.model')(sequelize)
    db.commentSuspension = require('../models/comment_suspension.model')(sequelize)
    db.followedUser = sequelize.define('followed_user', {})
    db.chat = sequelize.define('chat', {})
    db.message = require('../models/message.model')(sequelize)
    db.mutedUser = sequelize.define('muted_user', {})

    //Table relationships
    db.user.hasMany(db.post)
    db.user.hasMany(db.comment)
    db.user.hasMany(db.commentReact)
    db.user.hasMany(db.postReact)
    db.user.hasMany(db.userSuspension)
    db.user.hasMany(db.userSuspension)
    db.user.hasMany(db.postSuspension)
    db.user.hasMany(db.commentSuspension)
    db.user.hasMany(db.followedUser)
    db.user.hasMany(db.followedUser)
    db.user.hasMany(db.chat, { as: 'user1', foreignKey: 'user1Id' })
    db.user.hasMany(db.chat, { as: 'user2', foreignKey: 'user2Id' })
    db.user.hasMany(db.mutedUser)
    db.user.hasMany(db.mutedUser)
    db.user.hasMany(db.message, { as: 'sender', foreignKey: 'senderId' })
    db.post.belongsTo(db.user)
    db.post.hasMany(db.comment)
    db.post.hasMany(db.postReact)
    db.post.hasMany(db.postSuspension)
    db.comment.belongsTo(db.post)
    db.comment.belongsTo(db.user)
    db.comment.hasMany(db.commentReact)
    db.comment.hasMany(db.commentSuspension)
    db.commentReact.belongsTo(db.comment)
    db.commentReact.belongsTo(db.user)
    db.postReact.belongsTo(db.post)
    db.postReact.belongsTo(db.user)
    db.userSuspension.belongsTo(db.user, { as: 'admin', foreignKey: 'adminId' })
    db.userSuspension.belongsTo(db.user)
    db.postSuspension.belongsTo(db.user)
    db.postSuspension.belongsTo(db.post)
    db.commentSuspension.belongsTo(db.user)
    db.commentSuspension.belongsTo(db.comment)
    db.followedUser.belongsTo(db.user, { as: 'followee', foreignKey: 'followeeId' })
    db.chat.hasMany(db.message)
    db.message.belongsTo(db.chat)
    db.message.belongsTo(db.user, { as: 'sender', foreignKey: 'senderId' })
    db.mutedUser.belongsTo(db.user, { as: 'muted', foreignKey: 'mutedId'})

    await sequelize.sync()
        .then(() => initiateUnsuspendJobs(db));
}