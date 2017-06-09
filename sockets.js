const backend = require( './backend' );
let rooms = [];
let room_names = [];
let all_users = [];

class Room {

  constructor ( io, room_name, current_rooms ) {

    this.users = {};
    this.users.data = [];
    this.users.count = 0;
    this.messages = [];
    this.room_name = room_name;
    this.room_id = current_rooms + 1;
    this.host = io.of( '/' + room_name );

  }

  refresh_messages () {

    backend.find( { Title: this.room_name }, 'Rooms', ( err, le_room ) => {

      if ( !err ) {

        if ( !le_room ) {

          console.log( 'Room doesn\'n even exist bruh...' );

        } else {

          this.messages = le_room.Messages;

        }

      } else {

        console.log( 'Failed to update room with stored content.\n' );
        console.log( err );

      }

    });

  }

  sendMessage ( data ) {

    this.messges.push( data );

    backend.newMessage( data, ( err ) => {

      if ( !err ) {

        this.host.emit( 'new message', data );

      } else {

        console.log( err );

      }

    });

  }

  start () {

    this.host.on( 'connection', ( socket ) => {

      this.users.count += 1;
      this.users.data.push( socket.handshake.session.passport.user );



      host.on( 'new_message', ( message ) => {

        message.user = socket.handshate.session.passport.user;

        this.sendMessage( data );


      });

      socket.on( 'disconnect', () => {

        this.users.count -= 1;
        this.users.names.splice( this.users.names.indexOf( socket.handshake.session.passport.user.Name ), 1 );

      });

    });

  }

}

exports.configure = ( io ) => {

  io.on( 'connect', () => {});

};


exports.new_room = ( io, room ) => {

  rooms.push( new Room( io, room, rooms.length ) );

};


exports.sendMessage = ( message ) => {

  rooms[ message.room_id ];

};
