"use strict";

let err;

window.onload = (  ) => {

  err = document.getElementById( 'err' );

};

function send_err ( error ) {
  err.innerHTML = error;
};

function validate () {

  let pass1 = document.getElementById( 'pass1' ).value;
  let pass2 = document.getElementById( 'pass2' ).value;

  if( pass1 && pass2 ) {

    if( pass1 == pass2 ) {

      //success

    } else {

      send_err( 'Passwords do not match.' );

    }

  } else {

    send_err( 'Please enter and re-enter your password.' );

  }

};
