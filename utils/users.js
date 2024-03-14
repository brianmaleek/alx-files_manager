// users.js
/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */
import mongoDBCore from 'mongodb';
import { request } from 'express';
import redisClient from './redis';
import dbClient from './db';

const getIdAndKey = async (req) => {
  const auth = req.header('X-Token') || null;
  if (!auth) return null;
  const key = `auth_${auth}`;
  const userId = await redisClient.get(key);
  return { userId, key };
};

export default getIdAndKey;
