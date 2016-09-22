var READY_TO_SCALE = false;

var bootState = {
    init: function() {
        GAME.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        GAME.scale.pageAlignHorizontally = true;
        GAME.scale.pageAlignVertically = true;

        GAME.scale.setUserScale(DIMS.ratio, DIMS.ratio, 0, 0);
        GAME.scale.refresh();
        GAME.scale.setGameSize(DIMS.game.outer.width, DIMS.game.outer.height);

        GAME.scale.setResizeCallback(function () {
            DIMS.updateScreen(dims(DIV));
        });

        GAME.forceSingleUpdate = true;

        DIMS.onUpdate.push(function () {
            GAME.scale.setUserScale(DIMS.ratio, DIMS.ratio, 0, 0);
            GAME.scale.setGameSize(DIMS.game.outer.width, DIMS.game.outer.height);
            GAME.scale.refresh();

            var state = GAME.state.getCurrentState();
            if (state.onResize) {
                state.onResize.call(state, DIMS.game.inner.left, DIMS.game.inner.top);
            }
        });
    },

    preload: function () {
        GAME.load.image('logo', 'images/logo.png');
    },

    create: function () {
        GAME.state.start('load');
    }
};
