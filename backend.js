"use strict";
const crypto = require( 'crypto' );
const path = require( 'path' );
const mime = require( 'mime' );
const localStrat = require( 'passport-local' ).Strategy;
const MongoClient = require( 'mongodb' ).MongoClient;
const url = 'mongodb://0.0.0.0:27017';
const key = 'fukdaworld';


exports.encrypt = ( text ) => {

  let cipher = crypto.createCipher( 'aes-256-ctr', key );
  let crypted = cipher.update( text, 'utf8', 'hex' );
  crypted += cipher.final( 'hex' );
  return crypted;

};

exports.decrypt = ( text ) => {

  let decipher = crypto.createDecipher( 'aes-256-ctr', key );
  let dec = decipher.update( text, 'utf8', 'hex' );
  dec += decipher.final( 'hex' );
  return dec;

};

exports.multer_config = ( multer ) => {

  let storage = multer.diskStorage({
    destination: ( req, file, cb ) => { cb( null, path.join( __dirname, 'public', 'uploads' ) ) },
    filename: ( req, file, cb ) => {
      crypto.pseudoRandomBytes( 16, ( err, raw ) => {
        cb( null, raw.toString( 'hex' ) + Date.now() + '.' + mime.extension( file.mimetype ) );
      });
    }
  });

  return multer( { storage: storage } );

};

exports.secure_user = ( raw_user ) => {

  let secure_user = raw_user;
  secure_user.Password = false;
  return secure_user;

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

exports.find = ( q, collection, cb ) => {

  MongoClient.connect( url, ( err, db ) => {

    if ( !err ) {

      let Col = db.collection( collection );

      Col.find( q ).limit( 1 ).toArray( ( err, data ) => {

        if ( !err ) {

          if ( !data[ 0 ] ) {

            cb( false, false );
            db.close();

          } else {

            cb( false, data[ 0 ] );
            db.close();

          }

        } else {

          cb( 'Internal server error.', false );
          db.close();
          console.log( 'Failed to find room data.' );
          console.log( err );

        }

      });

    } else {

      cb( 'Internal server error.', false );
      db.close();
      console.log( 'Failed to connect to database.' );
      console.log( err );

    }

  });

};

exports.configure_pass = ( passport ) => {

  passport.use( new localStrat(( username, password, done ) => {

    this.find( { Username: username }, 'Profiles', ( err, user ) => {

      if ( !err ) {

        if ( !user ) {

          done( 'Invalid username.', false );

        } else {

          if ( user.Password === this.encrypt( password ) ) {

            let secure_user = this.secure_user( user );

            done( false, secure_user );

          } else {

            done( 'Incorrect password.', false );

          }

        }

      } else {

        done( ( 'Authentiation failed. ' + err ), false );

      }

    } );

  }) );

  passport.serializeUser( ( user, done ) => done( false, user ) );
  passport.deserializeUser( ( user, done ) => done( false, user ) );

};

exports.register = ( req, res ) => {

  let new_user = {
    Username: req.body.username,
    Password: this.encrypt( req.body.password ),
    Description: req.body.description,
    Avatar: '/uploads/default.jpg'
  };

  if ( req.file ) {

    new_user.Avatar = '/uploads/' + req.file.filename;

  }

  if ( /\//.test( req.body.username ) ) {

    res.render( 'register', { err: 'Username invalid. Cannot contain "/".' } );

  } else {

    this.find( {Username: new_user.Username }, 'Profiles', ( err, user ) => {

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
  }

};

exports.profiles = ( req, res ) => {

  this.find( { Username: req.params.id }, 'Profiles', ( err, user ) => {

    if ( !err ) {

      if ( !user ) {

        res.render( 'user_not_found', { err: req.params.id } );

      } else {

        let secure_user = this.secure_user( user );

        res.render( 'profile', { user: secure_user } );

      }

    } else {

      res.render( 'profile', { err: 'Unable to load user data. Internal server error.' } );

    }

  });

};

exports.create_room = ( req, res ) => {

  let room = {
    Title: req.body.title,
    Background: req.file.filename,
    Description: req.body.description,
    Mods: [ 'TinoF', req.user.Username ],
    Messages: []
  };

  if ( /\//.test( room.Title ) ) {

    res.render( 'Room names cannot contain any "/"\'s.' );

  } else {

    this.find( { Title: room.Title }, 'Rooms', ( err, item ) => {

      if ( err ) {

        res.render( 'create_room', { err: err } );

      } else {

        if ( !item ) {

          MongoClient.connect( url, ( err, db ) => {

            if ( !err ) {

              let col = db.collection( 'Rooms' );
              col.insert( room, ( err, idk ) => {

                if ( !err ) {

                  res.redirect( '/room/' + room.Title );
                  db.close();

                } else {

                  res.render( 'create_room', { err: 'Failed to add room. Internal server error.' } );
                  console.log( err );
                  db.close();

                }

              });

            } else {

              res.render( 'create_room', { err: 'Internal server error.' } );
              console.log( err )

            }

          });

        } else {

          res.render( 'create_room', { err: 'A room with this name already exists.' } );

        }

      }

    });

  }

};

exports.newMessage = ( message, cb ) => {

  MongoClient.connect( url, ( err, db ) => {

    if ( !err ) {

      let Rooms = db.collection( 'Rooms' );
      Rooms.update(
        { Title: message.room },
        { $push: { Messages: message } },
        ( err, results ) => {

          if ( !err ) {

            cb( false );

          } else {

            cb( 'Failed to add message to database due to an internal server error.' );

          }

        }
      );

    } else {

      cb( 'Failed to add message to database due to an internal server error.' );
      console.log( err );

    }

  });

};
