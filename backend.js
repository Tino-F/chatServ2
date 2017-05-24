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

  MongoClient.connect( url, ( err, db ) => {

    if ( !err ) {

      let Profiles = db.collection( 'Profiles' );

      Profiles.find( q ).limit( 1 ).toArray( ( err, data ) => {

        if ( !err ) {

          if ( !data[ 0 ] ) {

            callback( false, false );

          } else {

            callback( false, data[ 0 ] );

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

exports.add_user = ( user, callback ) => {

  MongoClient.connect( url, ( err, db ) => {

    if ( !err ) {

      let Profiles = db.collection( 'Profiles' );

      Profiles.insert( user, ( err, idk ) => {

        if ( !err ) {

          callback( false );

        } else {

          callback( 'Registration failed due to an internal server error. Please try again later.' );
          console.log( 'An error has occured while trying to add a user to MongoDB.');
          console.log( err );

        }

        db.close();

      });

    } else {

      callback( 'Registration failed due to an internal server error. Please try again later.' );
      console.log( 'Failed to connect to database.' );
      console.log( err );

    }

  })

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

  passport.serializeUser( ( user, done ) => done( false, user ) );
  passport.deserializeUser( ( user, done ) => done( false, user ) );

};

exports.register = ( req, res ) => {

  let new_user = {
    Username: req.body.username,
    Password: req.body.password,
    Description: req.body.description
  };

  console.log();
  console.log( req.body );

  this.find_user( {Username: new_user.Username }, ( err, user ) => {

    if ( !err ) {

      if ( !user ) {

        this.add_user( new_user, ( err ) => {

          if ( !err ) {

            res.redirect( '/login' );

          } else {

            res.render( 'register', err );

          }

        } );

      } else {

        res.render( 'register', { err: 'Username already exists.' } );

      }

    } else {

      res.render( 'register', { err: ( 'Registration failed.' + err ) } );

    }

  } )

};
