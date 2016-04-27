var toLoad = '';
if (DEBUGGING) {
    // '<''script' (without "'"s) can cause an error in canvas+,
    // even in comments.
    // livereload doesn't work with cordova.
    if (!window.cordova) {
        document.write('<'+'script src="http://'+(location.host || 'localhost').split(':')[0]+':35729/livereload.js?snipver=1"></'+'script>');
    }
}

var DIV = document.getElementById('cvs');
var DIMS = newDims({width: 640, height: 920}, dims(DIV));

GAME = new Phaser.Game(
    DIMS.game.outer.width,
    DIMS.game.outer.height,
    // AUTO causes shrink in Canvas+.
    Phaser.CANVAS, // TODO Check AUTO vs CANVAS w/ different browsers/Cocoon.io.
    DIV ? DIV : undefined
);
var COCOON = initCocoonApi(DIMS);
[
    ['boot', bootState],
    ['load', loadState],
].forEach(function (state) {
    GAME.state.add(state[0], state[1]);
});
for (var state in SKEL.states) {
    GAME.state.add(state, SKEL.states[state]);
}

GAME.state.start('boot');
