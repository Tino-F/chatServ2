"use strict";
const backend = require( './backend.js' );
const sockets = require( './sockets.js' );
const MongoClient = require( 'mongodb' ).Client;
const passport = require( 'passport' );
const expressSession = require( 'express-session' );
const socketSession = require( 'express-socket.io-session' );
const cookieParser = require( 'cookie-parser' );
const bodyParser = require( 'body-parser' );
const express = require( 'express' );
const path = require( 'path' );
const multer = require( 'multer' );
const upload = backend.multer_config( multer );
const port  = 3000;
const url = 'mongodb://0.0.0.0:27017';
const session = expressSession( { secret: 'Shhhhhhhhhhhhhhhh', resave: false, saveUninitialized: false } );
const app = express();
app.set( 'view engine', 'pug' );
app.use( express.static( path.join( __dirname, 'public' ) ) );
app.use( cookieParser() );
app.use( session );
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( passport.initialize() );
app.use( passport.session() );
backend.configure_pass( passport );

const server = require( 'http' ).Server( app );
const io = require( 'socket.io' )( server );
io.use( socketSession( session, {
  autosave: true
}) );
sockets.configure( io );
server.listen( port );
console.log( 'Started server on http://localhost:' + port + '.' );



app.get( '/register', ( req, res ) => {

  if ( req.isAuthenticated() ) {

    res.render( 'register', { err: 'You must <a href="/logout">sign out</a> before you can create a new account.' } );

  } else {

    res.render( 'register' );

  }

});

app.post( '/register', multer( upload ).single( 'Avatar' ), ( req, res ) => {

  console.log( req );

  if ( !req.isAuthenticated() ) {

    backend.register( req, res );

  } else {

    res.render( 'register', { err: 'You must sign out before you can create a new account.' } );

  }

});

app.get( '/login', ( req, res ) => {

  if ( !req.isAuthenticated() ) {

    res.render( 'login' );

  } else {

    res.render( 'login', { err: 'You are currently logged in as ' + req.user.Username } );

  }

});

app.post( '/login', ( req, res ) => {

  passport.authenticate( 'local', ( err, user ) => {

    if ( !err ) {

      req.logIn( user, ( err ) => {

        if ( !err ) {

          res.redirect( '/profiles/' + user.Username );

        } else {

          res.render( 'login', { err: 'Authentiation failed. Internal server error.' } );

        }

      });

    } else {

      res.render( 'login', { err: err } );

    }

  })( req, res );

});

app.get( '/logout', ( req, res ) => {

  req.logout();
  res.redirect( '/login' );

});

app.get( '/', ( req, res ) => {

  if ( req.isAuthenticated() ) {

    res.render( 'home', req.user );

  } else {

    res.render( 'home', false)

  }

});

app.get( '/profiles/:id', ( req, res ) => {

  if ( !req.isAuthenticated() ) {

    backend.profiles( req, res );

  } else {

    if ( req.params.id === req.user.Username ) {

      res.render( 'your_profile', { user: req.user } );

    } else {

      backend.profiles( req, res );

    }

  }

});

app.get( '/room/:id', ( req, res ) => {

  backend.find( { Title: req.params.id }, 'Rooms', ( err, room ) => {

    if ( !err ) {

      if ( !room ) {

        res.render( 'room_not_found', { Title: req.params.id } );

      } else {

        if ( room.Type === 'private' ) {

          res.render( 'private' );

        } else {

          res.render( 'room', { room: room, user: req.user } );

        }

      }

    } else {

      res.render( 'something_has_occured' );

    }

  });

});

app.get( '/create', ( req, res ) => {

  if ( req.isAuthenticated() ) {

    res.render( 'create_room' );

  } else {

    res.redirect( '/login' );

  }

} );

app.post( '/create', multer( upload ).single( 'background' ), ( req, res ) => {

  if ( req.isAuthenticated() ) {

    backend.create_room( req, res );

  } else {

    res.redirect( '/login' );

  }

} );

app.get( '/random', ( req, res ) => {

  backend.random( req, res );

});
