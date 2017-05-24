"use strict";
const crypto = require( 'crypto' );
const localStrat = require( 'passport-local' ).Strategy;
const MongoClient = require( 'mongodb' ).MongoClient;
const url = 'mongodb://0.0.0.0:27017';

exports.encrypt = text => {

};

exports.decrypt = text => {

};

exports.find_user = ( q, callback ) => {

  MongoClient.connect( url, () => {

    if ( !err ) {

      let Profiles = db.collection( 'Profiles' );

      Profiles.find( q ).limit( 1 ).toArray( ( err, data ) => {

        if ( !err ) {

          if ( !item[ 0 ] ) {

            callback( false, false );

          } else {

            callback( false, item[ 0 ] );

          }

        } else {

          callback( 'Internal server error.', false );

        }

      } );

      db.close();

    } else {

      callback( 'Internal server error.', false );
      console.log( 'Failed to connect to database.' );
      console.log( err )

    }

  } );

};

exports.configure_pass = ( passport ) => {

  passport.use( new localStrat(( username, password, done ) => {

    this.find_user( { Username: username }, ( err, user ) => {

      if ( !err ) {

        if ( !user ) {

          done( 'Invalid username.', false );

        } else {

          if ( user.Password = password ) {

            user.Password = null;
            done( false, user );

          } else {

            done( 'Incorrect password.', false );

          }

        }

      } else {

        done( ( 'Authentiation failed.' + err ), false );

      }

    } );

  }) );

  passport.serializeUser( ( user, done ) => done( null, user ) );
  passport.deserializeUser( ( user, done ) => done( null, user ) );

};

exports.register = ( req, res ) => {

  let new_user = {
    Username: req.body.username,
    Password: rea.body.password
  };

};
