const express = require('express')
const router = express.Router()
const communicationService = require('../services/communication.service')
const Joi = require('joi')
const validateRequest = require('../middleware/validate-request')
const authorize = require('../middleware/authorize')
const { handleError } = require('../_helpers/request-error')
router.post('/follow', authorize(), followSchema, follow)
router.post('/mute/:id', authorize(), muteUser)
router.post('/message', authorize(), addMessageSchema, addMessage)
router.get('/follows/:id', authorize(), getAllFollowed)
router.get('/messages/:id', authorize(), getMessages)
router.get('/chats', authorize(), getChats)
module.exports = router


function followSchema(req, res, next) {
    const schema = Joi.object({
        followeeId: Joi.number().required()
    })

    validateRequest(req, res, next, schema)
}

function follow(req, res, next) {
    communicationService.followUser({ ...req.body, userId: req.user.id })
        .then(follow => res.json(follow))
        .catch(error => handleError(error, res))
}

function getAllFollowed(req, res, next) {
    if (Number(req.params.id) != req.user.id)
        return res.status(403).json({ message: "Forbidden, token and provided user ids do not match"})
    
    communicationService.getAllFollowedUsers(req.params.id, req.query)
        .then(follows => res.json(follows))
        .catch(error => handleError(error, res))
}

function muteUser(req, res, next) {
    communicationService.muteUserById(req.params.id, req.user.id)
        .then(message => res.json({ message }))
        .catch(error => handleError(error, res))
}

function getMessages(req, res, next) {
    communicationService.getMessages({
        user1Id: req.user.id,
        user2Id: req.params.id,
        ...req.query
    }).then(messages => res.json({ messages: messages }))
        .catch(error => handleError(error, res))
}

function addMessageSchema(req, res, next) {
    const schema = Joi.object({
        content: Joi.string().required().min(1).max(512),
        userId: Joi.number().required()
    })

    validateRequest(req, res, next, schema)
}

function addMessage(req, res, next) {
    communicationService.addMessage({
        user1Id: req.user.id, 
        user2Id: req.body.userId,
        content: req.body.content
    })
        .then(message => res.json(message))
        .catch(error => handleError(error, res))
}

function getChats(req, res, next) {
    communicationService.getChatsByUser(req.user.id, req.query)
        .then(chats => res.json(chats))
        .catch(error => handleError(error, res))
}