// CSS effects implemented in /src/homepage/css-scss/common/widgets/clipboard-target.scss
var clipboard = new Clipboard('.clipboard-icon');

clipboard.on('success', function(event) {
  $(event.trigger).addClass("clipboard-copied").delay(1000).queue(function(){
    $(this).removeClass("clipboard-copied").dequeue();
  });
});
clipboard.on('error', function(event) {
  $(event.trigger).addClass("clipboard-error").delay(1000).queue(function(){
    $(this).removeClass("clipboard-error").dequeue();
  });
});
