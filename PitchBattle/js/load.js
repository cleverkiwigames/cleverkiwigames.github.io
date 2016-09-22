var AUDIO;

var loadState = {
    preload: function () {
        GAME.stage.backgroundColor = '#94c048';

        this.fgGrp = addGroup(DIMS);

        var logo = GAME.add.sprite(DIMS.game.inner.width/2, DIMS.game.inner.height/2, 'logo');
        var ratio = logo.width/logo.height;

        var logoScrnDim = {w: DIMS.screen.width*8/10};
        logoScrnDim.h = logoScrnDim.w/ratio;

        if (logoScrnDim.h > DIMS.screen.height*8/10) {
            logoScrnDim = {h: DIMS.screen.height*8/10};
            logoScrnDim.w = logoScrnDim.h*ratio;
        }

        logo.anchor.setTo(0.5);
        logo.width = screenDimToGameDim(DIMS, logoScrnDim.w);
        logo.height = logo.width/ratio;

        this.spinY = DIMS.game.outer.height/2 + logo.height/2 - DIMS.game.pad.vert +
            (DIMS.game.outer.height - logo.height)/4;
        this.spinW = logo.height/50;
        if (logoScrnDim.h > DIMS.screen.height*6/10) {
            logo.y = logo.height/2;
            this.spinY = logo.height*11/10;
        }

        this.fgGrp.add(logo);

        this.fg = GAME.add.graphics(0, 0);
        this.fg.visible = false;
        this.visibleDelay = 80;
        this.fgGrp.add(this.fg);

        this.spinnerAngle = 0;

        SKEL.sprites.forEach(function (name) {
            GAME.load.image(name, 'images/sprites/' + name + '.png');
        });

        SKEL.fonts.forEach(function (name) {
            GAME.load.bitmapFont(name, 'fonts/'+name+'.png', 'fonts/'+name+'.fnt');
        });

        SKEL.audio.forEach(function (name) {
            GAME.load.audio(name, 'audio/'+name+'.wav');
        }, this);

        this.spinRad = logo.height*2/25;
    },

    create: function () {
        var toDecode = [];

        this.audio = {};
        SKEL.audio.forEach(function (name) {
            var audio = GAME.add.audio(name);
            this.audio[name] = audio;
            toDecode.push(audio);
        }, this);

        GAME.sound.setDecodedCallback(toDecode, function () {
            COCOON.whenReady(this.start, this);
        }, this);
    },

    update: function () {
        this.fg.clear();

        this.fg.beginFill(0xffffff);
        this.fg.drawCircle(
            DIMS.game.inner.width/2+this.spinRad*Math.sin(this.spinnerAngle*Math.PI*2),
            this.spinY+this.spinRad*Math.cos(this.spinnerAngle*Math.PI*2),
            this.spinW
        );

        var spinnerAngle_ = this.spinnerAngle-0.5;
        if (spinnerAngle_ < 0) {
            spinnerAngle_ += 1;
        }
        this.fg.drawCircle(
            DIMS.game.inner.width/2+this.spinRad*Math.sin(spinnerAngle_*Math.PI*2),
            this.spinY+this.spinRad*Math.cos(spinnerAngle_*Math.PI*2),
            this.spinW
        );
        this.fg.endFill();

        this.spinnerAngle -= 0.02;
        if (this.spinnerAngle < 0) {
            this.spinnerAngle += 1;
        }

        if (this.visibleDelay > 0) {
            if (--this.visibleDelay == 0) {
                this.fg.visible = true;
            }
        }
    },

    start: function () {
        COCOON = COCOON.value;
        AUDIO = this.audio;
        startState(SKEL.startState, {progress: loadProgress()});
    },

    onResize: function (left, top) {
        this.fgGrp.x = left;
        this.fgGrp.y = top;
    },
};
