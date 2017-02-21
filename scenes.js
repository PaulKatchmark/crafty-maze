(function (Crafty) {
    "use strict";

// Victory scene
// -------------
// Tells the player when they've won and lets them start a new game
Crafty.scene('Victory', function() {
  Crafty.background('rgb(70,70,70)');
  // Display some text in celebration of the victory
  Crafty.e('2D, DOM, Text')
    .attr({x:200 , y:200, w:400, h:200 })
    .textFont({ type: 'italic', family: 'Arial', size: '30px', weight: 'bold'})
    .textColor('#22FF22')
    .text('Congratulations! You Win!!! <hr/> Press any key to play again')

  // Watch for the player to press a key, then restart the game
  //  when a key is pressed
   this.restart_game = this.bind('KeyDown', function() {
    window.location.reload();
   });
}, function() {
  // Remove our event binding from above so that we don't
  //  end up having multiple redundant event watchers after
  //  multiple restarts of the game
  this.unbind('KeyDown', this.restart_game);
});

// Lose scene
// -------------
// Tells the player when they've lost and lets them start a new game
Crafty.scene('Lose', function() {
  Crafty.background('rgb(70,70,70)');
  // Display some text in mourning of the loss
  Crafty.e('2D, DOM, Text')
    .attr({x:100 , y:200, w:600, h:200 })
    .textFont({ type: 'italic', family: 'Arial', size: '30px', weight: 'bold'})
    .textColor('#FF2222')
    .text('You did not win...you need more practice <hr/> Press any key to play again')

  // Watch for the player to press a key, then restart the game
  //  when a key is pressed
   this.restart_game = this.bind('KeyDown', function() {
    window.location.reload();
   });
}, function() {
  // Remove our event binding from above so that we don't
  //  end up having multiple redundant event watchers after
  //  multiple restarts of the game
  this.unbind('KeyDown', this.restart_game);
});
}(Crafty));
