const backend = require( './backend' );
let rooms = [];
let room_names = [];
let all_users = [];

class Room {

  constructor ( io, room_name ) {

    this.users = {};
    this.users.count = 0;
    this.users.names = [];
    this.messages = [];
    this.host = io.of( room_name );

  }

  sendMessage ( data ) {

    backend.newMessage( data, ( err ) => {

      if ( !err ) {

      } else {

        socket.emit

      }

    });

  }

  retreiveMessages () {



  }

  start () {

    this.host.on( 'connection', ( socket ) => {

      this.users.count += 1;
      this.user.names.push( socket.handshake.session.passport.user.Name );

      host.on( 'new_message', () => {

        this.messages.push( messages )
        

      });

      socket.on( 'disconnect', () => {

        this.users.count -= 1;
        this.users.names.splice( this.users.names.indexOf( socket.handshake.session.passport.user.Name ), 1 );

      });

    });

  }

}

exports.configure = ( io ) => {

  io.on( 'connect' );

};
