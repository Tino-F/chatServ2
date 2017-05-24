"use strict";
const MongoClient = require( 'mongodb' ).Client;
const passport = require( 'passport' );
const expressSession = require( 'express-session' );
const socketSession = require( 'express-socket.io-session' );
const cookieParser = require( 'cookie-parser' );
const bodyParser = require( 'body-parser' );
const express = require( 'express' );
const path = require( 'path' );
const backend = require( './backend.js' );
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
server.listen( port );
console.log( 'Started server on http://localhost:' + port + '.' );

app.get( '/register', ( req, res ) => {

  if ( req.isAuthenticated() ) {

    res.render( 'register', { err: 'You must sign out before you can create a new account.' } );

  } else {

    res.render( 'register' );

  }

});

app.post( '/register', ( req, res ) => {

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

          res.redirect( '/profile/' + user.Username );

        } else {

          res.render( 'login', { err: 'Authentiation failed. Internal server error.' } );

        }

      });

    } else {

      res.render( 'login', err );

    }

  })( req, res );

});

app.get( '/', ( req, res ) => {

  if ( req.isAuthenticated() ) {

    res.render( 'home', req.user );

  } else {

    res.render( 'home', false)

  }

});
