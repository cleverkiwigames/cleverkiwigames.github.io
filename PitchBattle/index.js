var toLoad = '';

var SKEL_DEFAULTS = {
    sprites: [],
    fonts: [],
    audio: [],
    states: {
        "game": gameState,
    },
    extra: {},
    dims: {
        w: 640,
        h: 920,
    },
    startState: "game",
};

var SKEL = typeof(SKEL) === 'undefined' ? SKEL_DEFAULTS : SKEL;
for (var field in SKEL_DEFAULTS) {
    if (typeof(SKEL[field]) === 'undefined') {
        SKEL[field] = SKEL_DEFAULTS[field];
    }
}

var DIV = document.getElementById('cvs');
var DIMS = newDims(
    {
        width: typeof(SKEL) !== 'undefined' && SKEL.dims.w ? SKEL.dims.w : 640,
        height: typeof(SKEL) !== 'undefined' && SKEL.dims.h ? SKEL.dims.h : 920,
    },
    dims(DIV)
);

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
