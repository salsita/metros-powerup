'use strict';

const Path = require('path');

const Hapi       = require('hapi');
const Inert      = require('inert');
const AuthBearer = require('hapi-auth-bearer-token');
const Joi        = require('joi');
const Boom       = require('boom');

const Mongo = require('mongoskin');

/*
 * Environment variables:
 *
 * HOST         (default 'localhost')
 * PORT         (default '8000')
 * ACCESS_TOKEN (default 'secret')
 * MONGODB_URI  (default 'localhost')
 */

/*
 * Set up the server.
 */

const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'powerup')
      },
      cors: {
        origin: ['https://trello.com']
      }
    }
  }
});

server.connection({
  host: process.env.HOST || 'localhost',
  port: parseInt(process.env.PORT, 10) || 8000
});

/*
 * Serve the power-up static files.
 */

server.register(Inert, (err) => {
  if (err) {
    console.error('Failed to load Inert:', err);
  }
});

server.route({
  method: 'GET',
  path: '/powerup/{param*}',
  handler: {
    directory: {
      path: '.'
    }
  }
});

/*
 * Register the Bearer authentication strategy.
 */

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'secret';

server.register(AuthBearer, (err) => {
  if (err) {
    console.error('Failed to load AuthBearer:', err);
    return;
  }

  server.auth.strategy('token', 'bearer-access-token', {
    validateFunc: (token, cb) => cb(null, token === ACCESS_TOKEN, {token})
  });
});

/*
 * Power-up API.
 */

const MONGODB_URI = process.env.MONGODB_URI || 'localhost';

const db = Mongo.db(MONGODB_URI);

server.route({
  method: 'GET',
  path: '/api/cards/{id}',
  config: {
    auth: 'token',
    validate: {
      params: {
        id: Joi.string().required()
      }
    },
    handler: (request, reply) => {
      const id = request.params.id;
      db.collection('cards').find({_id: id}).toArray((err, docs) => {
        if (err) {
          return reply(Boom.wrap(err));
        }

        if (docs.length === 0) {
          return reply({points: 0}).code(200);
        }

        const doc = docs[0];
        delete doc['_id'];
        reply(doc).code(200);
      });
    }
  }
});

server.route({
  method: 'POST',
  path: '/api/cards/{id}',
  config: {
    auth: 'token',
    validate: {
      params: {
        id: Joi.string().required()
      }
    },
    handler: (request, reply) => {
      const id = request.params.id;
      const card = request.payload;
      card._id = id;
      db.collection('cards').update({_id: id}, card, {upsert: true}, (err) => {
        if (err) {
          reply(Boom.wrap(err));
        } else {
          reply('Accepted').code(202);
        }
      });
    }
  }
});


/*
 * Start the server.
 */

server.start((err) => {
  if (err) {
    throw err;
  }

  console.log('Server running at', server.info.uri);
})
