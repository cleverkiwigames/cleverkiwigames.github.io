// Gets dimensions of `elm`, or the screen if `elm` is `undefined`.
function dims(elm) {
    if (elm) {
        return {width: elm.clientWidth, height: elm.clientHeight};
    }
    return {width: window.innerWidth, height: window.innerHeight};
}

function newDims(game, screen) {
    var dims = {
        screenAdHeight: 0,

        updateScreenAdHeight: function (screenAdHeight) {
            if (this.screenAdHeight == screenAdHeight) {
                return;
            }
            this.screenAdHeight = screenAdHeight;
            this.update(this.game.inner, this.screen);
        },

        updateScreen: function (screen) {
            if (this.screen.width == screen.width &&
                    this.screen.height == screen.height) {
                return;
            }
            this.update(this.game.inner, screen);
        },

        update: function (innerGame, screen) {
            this.game = {
                inner: innerGame,
            };
            this.screen = screen;
            this.ratio = Math.min(screen.width/innerGame.width, (screen.height-this.screenAdHeight)/game.height)

            // SCREEN x -> GAME x: x/ratio
            // GAME x -> SCREEN x: x*ratio
            this.game.adHeight = this.screenAdHeight/this.ratio;
            this.game.outer = {
                width: screen.width/this.ratio,
                height: screen.height/this.ratio
            };
            this.game.pad = {
                vert: (this.game.outer.height-this.game.adHeight-innerGame.height)/2,
                horz: (this.game.outer.width-game.width)/2,
            };
            this.game.inner.left = this.game.pad.horz;
            this.game.inner.top = this.game.pad.vert;

            this.onUpdate.forEach(function (cb) {
                cb();
            });
        },

        onUpdate: []
    };

    dims.update(game, screen);

    return dims;
}
