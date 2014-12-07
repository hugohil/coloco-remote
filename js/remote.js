var socket = io('http://localhost:1337');
var front = io('http://localhost:1337/remote');
var songs = songs || [];
var stack = stack || [];
var delivery = new Delivery(front);

socket.on('set-library', function (library){
  for(var i = 0; i < library.length; i++){
    songs.push(library[i]);
    addToList('#playlist', library[i]);
  }
  init();
});

socket.on('new-song', function (name){
  songs.push(name);
  addToList('#playlist', name);
})

function init(){
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
