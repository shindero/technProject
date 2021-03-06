require('dotenv').config
const config = require("../config.json");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../_helpers/db.js");
const { RequestError } = require('../_helpers/request-error')
module.exports = {
  register,
  login,
  update,
  deleteUser,
  getAllUsers,
  getUserById
};

async function register(params) {
  console.log(params);
  if (await db.user.findOne({ where: { username: params.username } }))
    throw new RequestError("Provided username is already taken", 400);
  if (params.password)
    params.passwordHash = await bcrypt.hash(params.password, 10);

  await db.user.create(params);
}

async function login({ username, password }) {
  const user = await db.user.scope("withHash").findOne({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new RequestError("Credentials Invalid", 401);
  }

  if (user.isSuspended) throw new RequestError("User account is suspended", 403)
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  return token;
}

async function update(id, params) {
  const user = await getUser(id);
  if (
    params.username &&
    user.username != params.username &&
    (await db.user.findOne({ where: { username: params.username } }))
  )
    throw new RequestError("Username " + params.username + " is already taken", 400);
  if (
    params.email &&
    user.email !== params.email &&
    (await db.user.findOne({ where: { email: params.email } }))
  )
    throw new RequestError("Email " + params.email + " is already taken", 400)

  if (params.password)
    params.passwordHash = await bcrypt.hash(params.password, 10);
  Object.assign(user, params);
  user.updated = Date.now();
  await user.save();

  return { ...omitHash(user.get()) };
}

async function deleteUser(id) {
  const user = await getUser(id);
  await db.post.destroy({ where: { userId: id } });
  await user.destroy();
}

async function getAllUsers({ page = '0', count = '10' }) {
  const perPage = parseInt(count)
  const users = await db.user.findAll({ 
    limit: perPage,
    offset: parseInt(page) * perPage
   });
  return users;
}

async function getUserById(id) {
  const user = await getUser(id)
  return { ...omitHash(user.get()) }
}

async function getUser(id) {
  const user = await db.user.scope("withHash")
                            .findOne({ where: { id, isSuspended: false } })
  if (!user) throw new RequestError("User not found", 404)
  return user
}

function omitHash(user) {
  const { passwordHash, ...userWithoutHash } = user;
  return userWithoutHash;
}
