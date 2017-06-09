'use strict';

let div;

window.onload = () => {

  div = document.getElementById( 'send_message_form' );
  div.style.top = ( window.innerHeight - div.offsetHeight ) + 'px';

};

window.onresize = function () {

  div.style.top = ( window.innerHeight - div.offsetHeight ) + 'px';

}
