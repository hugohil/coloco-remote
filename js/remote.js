var socket = io('http://localhost:1337');
var remote = io('http://localhost:1337/remote');
var player = io('http://localhost:1337/player');
var songs = songs || [];
var stack = stack || [];
var delivery = new Delivery(remote);

socket.on('set-library', function (library){
  songs = [];
  $('#playlist li').remove();
  for(var i = 0; i < library.length; i++){
    songs.push(library[i]);
    addToList('#playlist', library[i]);
  }
  init(); // display message while library is not loaded
});

socket.on('new-song', function (name){
  songs.push(name);
  addToList('#playlist', name);
})

function init(){
  var prev = document.getElementById('prev');
  var next = document.getElementById('next');
  var play = document.getElementById('play');
  var rand = document.getElementById('rand');
  var auto = document.getElementById('auto');

  play.onclick = function (){
   player.emit('change-state');
  }
  prev.onclick = function (){
   player.emit('change-song', 'prev');
  }
  next.onclick = function (){
   player.emit('change-song', 'next');
  }
  rand.onclick = function (){
    player.emit('switch-random');
  }
  auto.onclick = function (){
    player.emit('switch-auto');
  }

  $('body').keyup(function (event){
    if(event.keyCode == 32){
      player.emit('change-state');
    } else if(event.keyCode == 39) {
      player.emit('change-song', 'next');
    } else if(event.keyCode == 37){
      player.emit('change-song', 'prev');
    }
  })

  $('.js-add-to-stack').click(function (event){
    var input = $('.js-file')[0];
    var file = input.files[0];
    if(file){
      stack.push(file);
      addToList('#stack', file.name);
      input.value = null;
    } // else disable button
  });

  delivery.on('delivery.connect', function (delivery){
    $('.js-trigger').click(function (event){
      sendStackedSong();
    });
  });

  socket.on('saved-song', function(){
    sendStackedSong();
  })

  function sendStackedSong(){
    if(stack.length){
      delivery.send(stack[0]);
      console.log(stack[0].name + ' sent.');
      stack.splice(0, 1);
      $('#stack li:first-child').remove();
    }
  }
}

function addToList (list, name){
  var li = document.createElement('li');
  li.textContent = name;
  var btn = document.createElement('button');
  $(btn).html('&times;');
  $(btn).click(function (event){
    socket.emit('delete-song', name);
    event.target.parentElement.remove();
  });
  $(li).append(btn);
  $(list).append(li);
}
