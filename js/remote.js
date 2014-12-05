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
  $('#add').click(function (event){
    var input = $('.js-file')[0];
    var file = input.files[0];
    addToList('#stack', file.name);
    stack.push(file);
    input.value = null;
  });

  delivery.on('delivery.connect', function (delivery){
    $('.js-trigger').click(function (event){
      if(stack.length){
        for (var i = 0; i < stack.length; i++) {
          delivery.send(stack[i]);
          console.log(stack[i].name + ' sent.');
        };
        stack = [];
        $('#stack li').remove();
      }
    });
  });
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
