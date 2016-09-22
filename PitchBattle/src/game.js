// DEBUGGING = false;

var COLOURS_ = [
    [
        0x4f6d7a,
        0xe8dab2,
        0xdd6e42,
        0xc0d6df,
        0xeaeaea,
    ],
    [
        0xdb9d47,
        0xff784f,
        0x0e1428,
        0xffe19c,
        0xedffd9,
    ],
    [
        0x7b9e89,
        0xf0a202,
        0x0e1428,
        0xf18805,
        0xd95d39,
    ],
    [
        0xd64933,
        0xbac1b8,
        0x58a4b0,
        0x0c7c59,
        0x2b303a,
    ],
    [
        0xc5d86d,
        0xf7f7f2,
        0x261c15,
        0xf05d23,
        0xe4e6c3,
    ],
    [
        0x9d69a3,
        0xe85d75,
        0x40f99b,
        0x61707d,
        0xf5fbef,
    ],
    [
        0xddd78d,
        0xdcbf85,
        0x60594d,
        0x8b635c,
    ],
][1];

var WORDS = [
    [ // adj
        [ // fun
            "fun",
            "fun",
        ],
        [ // art
            "arty",
            "minimal",
        ],
        [ // exercise
            "fit",
            "slimming",
        ],
        [ // clothes
            "vogue",
            "chic",
        ],
        [ // food
            "tasty",
            "yummy",
        ],
        [ // family
            "safe",
            "cuddly",
            "friendly",
        ],
        [ // health
            "healthy",
            "low-carb",
        ],
        [ // travel
            "exotic",
            "foreign",
        ],
    ],
    [ // noun
        [ // fun
            "game",
            "puzzle",
        ],
        [ // art
            "painting",
            "sculpture",
        ],
        [ // exercise
            "race",
            "treadmill",
        ],
        [ // clothes
            "dress",
            "brooch",
        ],
        [ // food
            "cake",
            "fruit",
            "apple",
            "choc",
        ],
        [ // family
            "toy",
            "park",
        ],
        [ // health
            "treatment",
            "medicine",
        ],
        [ // travel
            "plane",
            "travel",
            "car",
        ],
    ],
];

var TEXTS = [
    'Hello, and welcome\nto the pitch battle!',
    "You've come to a pitch\nbattle with no product!",
    'Tap the topic buttons\nbelow to pitch ideas',
    "The audience turns more\nyellow when interested...",
    "... but they turn more\ngrey when they're bored",
    'When the timer runs out\ncome up with a name...',
    "... that appeals to\nthe audience's tastes",
    "You'll know you've done\nwell if they applaud!",
    "You have 30 seconds",
    "Best of luck!!!",
];

WORDS.push(WORDS[1]);

var gameState = {
    init: function (extra) {
        console.log(extra);
        if (extra.arg) {
            this.state = 0;
        } else {
            this.state = -1; // TODO
        }
        if (/*DEBUGGING && */typeof(extra.level) === 'undefined') {
            extra.debug = true;
            extra.level = {
                num: 1,
                sheet: 2,
            };

            // extra.transDir = ENTERING_FROM_RIGHT;
        }

        this.extra = extra;
    },

    onResize: function (left, top) {
        this.fgGrp.x = left;
        this.fgGrp.y = top;
        this.fgGrp2.x = left;
        this.fgGrp2.y = top;
    },

    // render: function () {
    //     if (DEBUGGING) {
    //         GAME.debug.geom(new Phaser.Point(this.scisHalves[0].x, this.scisHalves[0].y), '#ffff00');
    //         // GAME.debug.geom(new Phaser.Point(this.scisOrig.x, this.scisOrig.y), '#ffff00');
    //     }
    // },

    create: function () {
        ////////////////////////////////////////////////////////////////////////
        //
        // DEBUG VARS
        //
        ////////////////////////////////////////////////////////////////////////

        this.dbgHeld = false;
        this.halt = false;
        this.step = -1;
        this.steps = [];
        this.stepThru = false;
        this.slowdown = -1;
        this._delay = 1;

        ////////////////////////////////////////////////////////////////////////
        //
        // STATE VARS
        //
        ////////////////////////////////////////////////////////////////////////

        this.dudes = [];
        var commonLikes = [];
        var possibleLikes = [0, 1, 2, 3, 4, 5, 6, 7];
        for (var i = 0; i < 3; i++) {
            var index = Math.floor(Math.random()*possibleLikes.length);
            commonLikes.push(possibleLikes[index]);
            possibleLikes.splice(index, 1);
        }
        console.log(commonLikes);
        this.commonLikes = commonLikes;
        for (var i = 0; i < 3; i++) {
            var likes = JSON.parse(JSON.stringify(commonLikes));
            likes[Math.floor(Math.random()*likes.length)] =
                possibleLikes[Math.floor(Math.random()*possibleLikes.length)];
            this.dudes.push({
                colour: 0xe8e8e8,
                mood: (Math.random() * 0.4)+0.2,
                likes: likes,
                row: 2,
                x: DIMS.game.inner.width/2-240+i*120+120,
                y: DIMS.game.inner.width/2+200,
            });
        }
        for (var i = 0; i < 4; i++) {
            var likes = JSON.parse(JSON.stringify(commonLikes));
            likes[Math.floor(Math.random()*likes.length)] =
                possibleLikes[Math.floor(Math.random()*possibleLikes.length)];
            this.dudes.push({
                colour: 0xe0e0e0,
                mood: (Math.random() * 0.4)+0.2,
                likes: likes,
                row: 1,
                x: DIMS.game.inner.width/2-172+i*108,
                y: DIMS.game.inner.width/2+130,
            });
        }
        for (var i = 0; i < 3; i++) {
            var likes = JSON.parse(JSON.stringify(commonLikes));
            likes[Math.floor(Math.random()*likes.length)] =
                possibleLikes[Math.floor(Math.random()*possibleLikes.length)];
            var x = 20;
            this.dudes.push({
                colour: 0xd8d8d8,
                mood: (Math.random() * 0.4)+0.2,
                likes: likes,
                row: 0,
                x: DIMS.game.inner.width/2-(240-x*2)+i*(120-x)+100,
                y: DIMS.game.inner.width/2+60,
            });
        }

        this.dudes.forEach(function (dude) {
            dude.v = 0;
            dude.rand = Math.floor(Math.random()*10);
            dude.off = 0;
        });

        this.buttons = [];
        for (var i = 0; i < 4; i++) {
            this.buttons.push({
                x: DIMS.game.inner.width/4*(i+0.5),
                y: 720,
                r: 70,
            });
        }
        for (var i = 0; i < 4; i++) {
            this.buttons.push({
                x: DIMS.game.inner.width/4*(i+0.5),
                y: 840,
                r: 70,
            });
        }

        this.pressed = false;

        this.fsButton = {
            x: DIMS.game.inner.width-70,
            y: 70,
            r: 60,
        };

        this.curTopic = {
            id: 0,
            dur: 0,
        };

        var fsing = false;

        this.entryTextState = 0;

        // GAME.input.onDown.add(function () {
        //     var pointer = GAME.input.activePointer;
        //     var clickPos = GEOM.ptsSub(pointer, {
        //         x: DIMS.game.pad.horz,
        //         y: DIMS.game.pad.vert,
        //     });
        //     if (GEOM.dist([clickPos, this.fsButton]) < this.fsButton.r) {
        //         if (GAME.scale.isFullScreen) {
        //             GAME.scale.stopFullScreen();
        //         } else {
        //             GAME.scale.startFullScreen(false);
        //         }
        //     }
        // }, this);

        ////////////////////////////////////////////////////////////////////////
        //
        // GRAPHICS, GROUPS AND SPRITE LAYERS
        //
        ////////////////////////////////////////////////////////////////////////

        // TODO Update this on resize.
        this.bg = GAME.add.graphics(0, 0);

        // GROUP
        this.fgGrp = addGroup(DIMS);

        this.fg = GAME.add.graphics(0, 0);
        this.fgGrp.add(this.fg);

        this.dudeFgs = [];
        this.moodgs = [];
        for (var i = 0; i < 3; i++) {
            var dudeFg = GAME.add.graphics(0, 0);
            this.fgGrp.add(dudeFg);
            this.dudeFgs.push(dudeFg);
            var moodg = GAME.add.graphics(0, 0);
            this.fgGrp.add(moodg);
            this.moodgs.push(moodg);
        }

        [
            ['fun', 80, 720, 0.15],
            ['art', 240, 720, 0.13],
            ['exercise', 400, 720, 0.15],
            ['fashion', 560, 720, 0.15],
            ['food', 80, 840, 0.15],
            ['family', 240, 840, 0.15],
            ['health', 400, 840, 0.15],
            ['travel', 560, 840, 0.15],
        ].forEach(function (x) {
            var t = GAME.add.sprite(x[1], x[2], x[0]);
            t.scale.setTo(x[3]);
            t.anchor.setTo(0.5);
            this.fgGrp.add(t);
        }, this);

        // var bb = GAME.add.graphics(0, 0);
        // this.fgGrp.add(bb);
        // drawBoundBox(bb, DIMS);

        this.blackoutG = GAME.add.graphics(0, 0);
        this.blackoutG.beginFill(0);
        this.blackoutG.drawRect(0, 0, DIMS.game.outer.width,
            DIMS.game.outer.height);
        this.blackoutG.endFill();
        this.blackoutG.alpha = 0;

        this.fgGrp2 = addGroup(DIMS);

        this.ffg = GAME.add.graphics(0, 0);
        // this.ffg.visible = false; // FIXME
        this.fgGrp2.add(this.ffg);

        // this.menug = GAME.add.graphics(0, 0);
        // this.menug.beginFill(COLOURS_[4], 0.5);
        // this.menug.drawRect(0, 0, DIMS.game.outer.width, DIMS.game.outer.height);
        // this.menug.endFill();
        // this.menug.beginFill(0, 0.1);
        // this.menug.drawRect(0, 0, DIMS.game.outer.width, DIMS.game.outer.height);
        // this.menug.endFill();

        // this.fffg = GAME.add.graphics(DIMS.game.pad.horz, DIMS.game.pad.vert);
        // this.fffg.beginFill(0xf0f0f0);
        // this.fffg.drawEllipse(DIMS.game.inner.width/2-40,
        // DIMS.game.inner.height/2-180, 150, 100);
        // this.fffg.drawPolygon([
        //     DIMS.game.inner.width/2+90, DIMS.game.inner.height/2-180,
        //     DIMS.game.inner.width/2+60, DIMS.game.inner.height/2-180,
        //     DIMS.game.inner.width/2-10, DIMS.game.inner.height/2+110,
        // ]);
        // this.fffg.endFill();

        this.argh = false;
        this.quote = undefined;

        this.chosen = [];

        this.hl = 0;

        ////////////////////////////////////////////////////////////////////////
        //
        // TEXT
        //
        ////////////////////////////////////////////////////////////////////////

        var textConf = {font: '30px Arial', fill: '#ffffff', align: 'center'};

        this.debugText = GAME.add.text(0, 0, '', textConf, this.fgGrp);

        this.helpText = GAME.add.text(DIMS.game.inner.width/2, DIMS.game.inner.height-25,
            '',
            textConf, this.fgGrp);
        this.helpText.anchor.setTo(0.5, 1);

        this.endText = GAME.add.text(DIMS.game.inner.width/2, DIMS.game.inner.height/2,
            'PASS', Object.assign({}, textConf, {font: '300px Arial'}), this.fgGrp);
        this.endText.alpha = 0;
        this.endText.anchor.setTo(0.5);

        this.endGrp = GAME.add.group();
        this.endGrp.visible = false;
        this.fgGrp.add(this.endGrp);

        this.endContinue = GAME.add.text(
            DIMS.game.inner.width/2-100,
            DIMS.game.inner.height/2+250,
            'CONTINUE',
            textConf,
            this.endGrp
        );
        this.endContinue.inputEnabled = true;
        this.endContinue.events.onInputDown.add(function () {
            leaveToLeft(this, function () {
                startState('menu', this.extra);
            }, this);
        }, this);
        this.endContinue.anchor.setTo(0.5);

        this.survey = GAME.add.text(
            DIMS.game.inner.width/2,
            DIMS.game.inner.height/2+50,
            "Thanks so much for playing our\ndemo. Please support us by\n"+
            "completing a 2-minute survey.\nIt really helps!",
            {font: '30px Arial', fill: '#3f3f3f', align: 'center'},
            this.fgGrp2
        );
        this.survey.visible = false;
        this.survey.anchor.setTo(0.5);

        this.survey2 = GAME.add.text(
            DIMS.game.inner.width/2,
            DIMS.game.inner.height/2+50,
            "OK",
            {font: '30px Arial', fill: '#f0f0f0', align: 'center'},
            this.fgGrp2
        );
        this.survey2.visible = false;
        this.survey2.anchor.setTo(0.5);

        this.survey3 = GAME.add.text(
            DIMS.game.inner.width/2,
            DIMS.game.inner.height/2+50,
            "No thanks",
            {font: '20px Arial', fill: '#3f3f3f', align: 'center'},
            this.fgGrp2
        );
        this.survey3.visible = false;
        this.survey3.inputEnabled = true;
        this.survey3.anchor.setTo(0.5);
        this.survey3.inputEnabled = true;
        this.survey3.events.onInputDown.add(function () {
            window.localStorage.setItem('survey', 'yes');
            this.state++;
        }, this);

        this.endRetry = GAME.add.text(
            DIMS.game.inner.width/2+100,
            DIMS.game.inner.height/2+250,
            'RETRY',
            textConf,
            this.endGrp
        );
        this.endRetry.inputEnabled = true;
        this.endRetry.events.onInputDown.add(function () {
            startState('game', this.extra);
        }, this);
        this.endRetry.anchor.setTo(0.5);

        this.entryText = GAME.add.text(
            DIMS.game.inner.width/2-200,
            DIMS.game.inner.height/2-250,
            '',
            {font: '30px Arial', fill: '#3f3f3f', align: 'left'},
            this.fgGrp
        );
        this.entryText.anchor.setTo(0, 0.5);

        this.time = 30;
        this.countdown = GAME.add.text(
            DIMS.game.inner.width/2,
            250, // DIMS.game.inner.height/2-200,
            '',
            {font: '100px Arial', fill: '#f0f0f0', align: 'center'},
            this.endGrp
        );
        this.countdown.anchor.setTo(0.5);
        this.fgGrp.add(this.countdown);
        // this.countdown.visible = false; // FIXME

        this.qt = GAME.add.text(
            DIMS.game.inner.width/2-220,
            200, // DIMS.game.inner.height/2-200,
            '',
            {font: '50px Arial', fill: '#f0f0f0', align: 'center'},
            this.fgGrp2
        );
        this.qt.anchor.setTo(0, 0.5);
        this.qtTime = 1;

        this.wds = [];
        this.wds__ = [];
        for (var i = 0; i < 3; i++) {
            var wds = [];

            var poss = JSON.parse(JSON.stringify(possibleLikes));
            var wds_ = [];
            for (var j = 0; j < 3; j++) {
                var idx = Math.floor(Math.random()*poss.length);
                wds_.push(poss[idx]);
                poss.splice(idx, 1)
            }
            var good = Math.floor(Math.random()*3);
            wds_[good] = commonLikes[i];

            for (var j = 0; j < 3; j++) {
                var w = DIMS.game.inner.width*0.7;
                var h = DIMS.game.inner.height*0.1;
                var hs = [
                    DIMS.game.inner.height/3-h/2,
                    DIMS.game.inner.height/2-h/2,
                    DIMS.game.inner.height/3*2-h/2,
                ];

                var wd = GAME.add.text(
                    (DIMS.game.inner.width/2-(w*0.3)/2)-w*0.325+w*0.325*j
                        +(w*0.9/3)/2,
                    // 200, // DIMS.game.inner.height/2-200,
                    hs[i]+h*0.05+(h*0.9)/2,
                    WORDS[i][wds_[j]][Math.floor(Math.random()*2)],
                    {font: '30px Arial', fill: '#f0f0f0', align: 'center'},
                    this.fgGrp
                );
                wd.visible = false;
                wd.anchor.setTo(0.5);
                this.fgGrp2.add(wd);
                wds.push(wd);
            }
            this.wds.push(wds);

            this.wds__.push(wds_);
        }

        // this.txt = GAME.add.text(
        //     DIMS.game.inner.width/2+68,
        //     DIMS.game.inner.height/2-180,
        //     'PITCH\nBATTLE',
        //     {font: '50px Arial', fill: '#3f3f3f', align: 'center'}
        // );
        // this.txt.align = 'center';
        // this.txt.anchor.setTo(0.5);

        this.sayTxt = GAME.add.text(
            DIMS.game.inner.width/2-150,
            DIMS.game.inner.height/2-300,
            '',
            {font: '50px Arial', fill: '#3f3f3f', align: 'center'},
            this.fgGrp2
        );
        this.sayTxt.anchor.setTo(0, 0.5);
        this.sayTime = 1;

        this.gradeText = GAME.add.text(
            DIMS.game.inner.width/2-80,
            DIMS.game.inner.height/2-150,
            'Grade:',
            {font: '50px Arial', fill: '#e0e0e0', align: 'center'},
            this.fgGrp2
        );
        this.gradeText.anchor.setTo(0.5);
        this.gradeText.visible = false;

        this.gradeText2 = GAME.add.text(
            DIMS.game.inner.width/2+80,
            DIMS.game.inner.height/2-150,
            'A',
            {font: '500px Times New Roman', fill: '#e0e0e0', align: 'center'},
            this.fgGrp2
        );
        this.gradeText2.alpha = 0;
        this.gradeText2.rotation = 0.2;
        this.gradeText2.anchor.setTo(0.5);
        this.gradeText2.visible = false;

        this.gradeText3 = GAME.add.text(
            DIMS.game.inner.width/2-45,
            DIMS.game.inner.height/2+150,
            'Try Again?',
            {font: '50px Arial', fill: '#e0e0e0', align: 'center'},
            this.fgGrp2
        );
        this.gradeText3.anchor.setTo(0.5);
        this.gradeText3.visible = false;

        this.sayTxts = [];
        for (var i = 0; i < 3; i++) {
            var sayTxt = GAME.add.text(
                DIMS.game.inner.width/2,
                DIMS.game.inner.height/2-(300-75*(i+1)),
                '',
                {font: (40+i*10)+'px Arial', fill: '#3f3f3f', align: 'center'},
                this.fgGrp2
            );
            sayTxt.anchor.setTo(0.5);
            this.sayTxts.push(sayTxt);
        }

        this.f = function () {
            if (this.state === 0) {
                this.time--; // FIXME
                if (this.time > 0) {
                    GAME.time.events.add(Phaser.Timer.SECOND, this.f, this);
                } else {
                    this.state++;
                    this.countdown.visible = false;
                    this.blackoutG.visible = true;
                }
            }
        }

        // this.time = GAME.add.text(DIMS.game.inner.width/2, 25, '', {
        //     font: '50px Arial',
        //     fill: '#ffffff',
        // }, this.fgGrp);
        // this.time.anchor.setTo(0.5, 0);
        // this.startTime = GAME.time.totalElapsedSeconds();

        // this.menu = GAME.add.graphics(0, 0);
        // this.menu.beginFill(0xddcc00);
        // this.menu.drawRoundedRect(
        //     DIMS.game.inner.width/4,
        //     DIMS.game.inner.height/5,
        //     DIMS.game.inner.width/2,
        //     DIMS.game.inner.height/2
        // );
        // this.menu.endFill();
        // this.fgGrp.add(this.menu);

        if (DEBUGGING && false) {
            if (this.passed == true) {
                this.fbfgMask.x = this.scisOrig.x;
                this.fbfgMask.y = this.scisOrig.y;
                this.particles = [];
                var bladeSlope = GEOM.slope(this.blade);
            }
            this.sheet.cuts = [[
                {x: -100, y:  400},
                {x: -100, y:    0},
                {x: -500, y:    0},
                {x: -500, y:  400},
                {x: -100, y:  400},
            ]];
            // this.xbfg.mask = null;
        }

        ////////////////////////////////////////////////////////////////////////
        //
        // SCREEN TRANSITION
        //
        ////////////////////////////////////////////////////////////////////////

        enter(this);

        if (isEntering(this)) {
            // this.mv = GEOM.ptsSub(
            //     GEOM.mvInDir2(
            //         GEOM.mvInDir2(this.sheet.menuPos, this.sheet.gamePos, 0.5),
            //         this.sheet.gamePos,
            //         2/SPD
            //     ),
            //     GEOM.mvInDir2(this.sheet.menuPos, this.sheet.gamePos, 0.5)
            // );

            this.transData = {
                mv: GEOM.ptsSub(
                    GEOM.mvInDir2(
                        this.sheet.menuPos,
                        GEOM.mvInDir2(this.sheet.menuPos, this.sheet.gamePos, 0.5),
                        (1/SPD)
                    ),
                    this.sheet.menuPos
                ),
                sc: ((1-this.sheet.menu.scale)/SPD)/2,
            };

            this.sheet.gamePos = 
                    GEOM.mvInDir2(this.sheet.menuPos, this.sheet.gamePos, 0.5);
            this.sheet.gamePos.x -= DIMS.game.outer.width-DIMS.game.pad.horz;
        }

        ////////////////////////////////////////////////////////////////////////
        //
        // COCOON INIT
        //
        ////////////////////////////////////////////////////////////////////////

        COCOON.initState(GAME);
        COCOON.ads.remove();
    },

    update: function () {
        ////////////////////////////////////////////////////////////////////////
        //
        // COCOON INIT
        //
        ////////////////////////////////////////////////////////////////////////

        COCOON.ads.update();

        ////////////////////////////////////////////////////////////////////////
        //
        // DEBUGGING CODE
        //
        ////////////////////////////////////////////////////////////////////////

        if (DEBUGGING && this.halt) {
            return;
        }

        if (this.slowdown > 0) {
            this._delay--;
            if (this._delay == 0) {
                this._delay = this.slowdown;
            } else {
                return;
            }
        }

        if (this.stepThru) {
            if (GAME.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                if (this.dbgHeld) {
                    return;
                }
                this.dbgHeld = true;
            } else {
                this.dbgHeld = false;
                return;
            }
        }

        ////////////////////////////////////////////////////////////////////////
        //
        // SCREEN TRANSITION
        //
        ////////////////////////////////////////////////////////////////////////

        // 
        // ENTER PAPER MOVEMENT
        // 
        if (isEntering(this)) {
            this.sheet.gamePos = GEOM.ptsAdd([this.sheet.gamePos, this.transData.mv]);
            this.sheet.gamePos.x -= this.trans.enterSpd;
            this.sheet.scale += this.transData.sc;
        }

        if (isLeaving(this)) {
            // this.sheet.gamePos = GEOM.ptsAdd([this.sheet.gamePos, this.transData.mv]);
            this.sheet.gamePos.x -= this.trans.leaveSpd;
        }

        if (isMidTransition(this)) {
            updateTransition(this);
        }

        ////////////////////////////////////////////////////////////////////////
        //
        // READ
        //
        ////////////////////////////////////////////////////////////////////////

        var clickPos = null;
        var pointer = GAME.input.activePointer;
        if (pointer.isDown) {
            if (!this.pressed) {
                this.pressed = true;

                this.side = Math.floor(Math.random()*2);

                clickPos = GEOM.ptsSub(pointer, {
                    x: DIMS.game.pad.horz,
                    y: DIMS.game.pad.vert,
                });

                // if (GEOM.dist([clickPos, this.fsButton]) < this.fsButton.r) {
                //     if (GAME.scale.isFullScreen) {
                //         GAME.scale.stopFullScreen();
                //     } else {
                //         GAME.scale.startFullScreen(false);
                //     }
                // }

                if (this.state === 0) {
                    var pressed = null;
                    this.buttons.forEach(function (button, i) {
                        if (GEOM.dist([button, clickPos]) < button.r) {
                            this.leftover = 1;
                            pressed = i;
                        }
                    }, this);

                    if (pressed != null) {
                        this.dudes.forEach(function (dude) {
                            if (dude.likes.indexOf(pressed) == -1) {
                                dude.mood = Math.max(dude.mood-0.1, 0);
                            } else {
                                dude.mood = Math.min(dude.mood+0.1, 1);
                            }
                        });
                    }
                }
            }
        } else {
            this.pressed = false;
        }

        ////////////////////////////////////////////////////////////////////////
        //
        // EVAL
        //
        ////////////////////////////////////////////////////////////////////////

        // Hack

        this.moodgs.forEach(function (moodg) {
            moodg.clear();
        });

        if (this.state === -1) {
            this.entryText.text = TEXTS[this.entryTextState];

            if (clickPos != null && GEOM.dist([clickPos, {
                x: DIMS.game.inner.width/2+200,
                y: DIMS.game.inner.height/2-250,
            }]) < 69) {
                this.entryTextState++;
                if (this.entryTextState >= TEXTS.length) {
                    this.entryText.visible = false;
                    this.state++;
                }
            }

        } else if (this.state === 0 && !this.argh) {
            GAME.time.events.add(Phaser.Timer.SECOND, this.f, this);
            this.argh = true;
        } else if (this.state === 0) {
            this.dudes.forEach(function (dude) {
                dude.mood = Math.max(dude.mood-Math.random()*0.008, 0);
            }, this);
        } else if (this.state === 1) {
            this.blackoutG.alpha = Math.min(this.blackoutG.alpha+0.02, 0.5);
            if (this.blackoutG.alpha == 0.5) {
                this.state++;
            }

            var text = "Quick, pick a name!";
            if (this.qt.text.length < text.length) {
                if (this.qtTime > 0) {
                    this.qtTime--;
                } else {
                    this.qtTime = text[this.qt.text.length] == ',' ? 3 : 0;
                    this.qt.text += text[this.qt.text.length];
                }
            }
        } else if (this.state === 2) {
            for (var i = 0; i <= this.chosen.length; i++) {
                this.wds[i].forEach(function (wds) {
                    wds.visible = true;
                });
            }

            if (clickPos != null) {
                var w = DIMS.game.inner.width*0.7;
                var h = DIMS.game.inner.height*0.1;
                var hs = [
                    DIMS.game.inner.height/3-h/2,
                    DIMS.game.inner.height/2-h/2,
                    DIMS.game.inner.height/3*2-h/2,
                ];
                var i = this.chosen.length;
                for (var j = 0; j < 3; j++) {
                    var m = (DIMS.game.inner.width/2-(w*0.3)/2)-w*0.325+w*0.325*j;
                    var n = hs[i]+h*0.05;
                    var w2 = w*0.9/3;
                    var h2 = h*0.9;
                    if (m <= clickPos.x && clickPos.x <= m+w2 &&
                        n <= clickPos.y && clickPos.y <= n+h2) {

                        this.chosen.push(j);
                        if (this.chosen.length == 3) {
                            this.state++;

                            for (var i = 0; i < this.chosen.length; i++) {
                                this.wds[i].forEach(function (wds) {
                                    wds.visible = false;
                                });
                            }
                            console.log(this.chosen);
                            this.qt.visible = false;
                        }
                    }
                }
            }
        } else if (this.state === 3) {
            this.blackoutG.alpha = Math.max(this.blackoutG.alpha-0.02, 0);
            if (this.blackoutG.alpha == 0) {
                this.state++;
            }
        } else if (this.state === 4) {
            if (typeof(this.quote) === 'undefined') {
                this.quote = 0;
                this.txtState = 0;
                console.log(this.txtState);
            } else {
                var side = 0;
                var i = Math.min(this.quote, 10);
                var x = side ? 150 : DIMS.game.inner.width-150;
                var x2 = side ? 151 : DIMS.game.inner.width-151;
                this.moodgs[2].beginFill(0xfdfdfd);
                var pt = GEOM.mvInDir({x: x, y: 175}, {x: x2, y: 176}, 150-150*i/10);
                this.moodgs[2].drawCircle(
                    pt.x-170,
                    pt.y+80,
                    400-GEOM.dist([{x: x, y: 175}, pt])
                );
                this.moodgs[2].drawPolygon([
                    pt.x-15,pt.y,
                    pt.x+15,pt.y,
                    // pt.x-50,pt.y+250,
                    DIMS.game.inner.width/2+25+side*-1*50,DIMS.game.inner.height/2+140-50,
                ]);
                this.moodgs[2].endFill();

                this.quote++;
                if (this.quote < 18) {
                    var text = "And it's called";
                    if (this.sayTxt.text.length < text.length) {
                        if (this.sayTime > 0) {
                            this.sayTime--;
                        } else {
                            this.sayTime = text[this.sayTxt.text.length] == ',' ? 3 : 0;
                            this.sayTxt.text += text[this.sayTxt.text.length];
                        }
                    } else {
                        this.sayTime = 30;
                    }
                } else if (this.txtState < 4) {
                    if (this.sayTime > 0) {
                        this.sayTime--;
                    } else if (this.txtState < 3) {
                        this.sayTxts[this.txtState].text =
                            this.wds[this.txtState][this.chosen[
                                this.txtState
                            ]].text;
                        this.sayTime = 50;
                        if (this.txtState == 2) {
                            this.sayTxts[this.txtState].text += '!';
                            this.sayTime = 70;
                        }
                        this.txtState++;
                    } else {
                        this.sayTxts.forEach(function (s) {
                            s.visible = false;
                        });
                        this.sayTxt.visible = false;
                        this.txtState++;
                        this.sayTime = 50;
                    }
                } else {
                    this.iter = 0;
                    this.countdown.text = '';
                    this.countdown.visible = true;
                    this.state++;
                }
            }
        } else if (this.state === 5) {
            if (this.sayTime > 0) {
                this.sayTime--;
            } else if (this.iter < 3) {
                this.countdown.text += '.';
                this.sayTime = 50;

                this.dudes.forEach(function (dude) {
                    var pressed = this.wds__[this.iter][this.chosen[this.iter]];
                    if (dude.likes.indexOf(pressed) == -1) {
                        dude.mood = Math.max(dude.mood-0.1, 0);
                    } else {
                        dude.mood = dude.mood+0.3;
                    }
                }, this);

                this.iter++;
            } else {
                this.state++;
            }
        } else if (this.state === 6) {
                this.countdown.text = '';
                this.term = 50;
                this.state++;
        } else if (this.state === 7) {
                if (this.term > 0) {
                    this.term--;
                } else {
                    this.state++;
                }
        } else if (this.state === 8) {
            this.blackoutG.alpha = Math.min(this.blackoutG.alpha+0.02, 0.5);
            if (this.blackoutG.alpha == 0.5) {
                this.term = 30;
                this.state++;
            }
        } else if (this.state === 9) {
                this.gradeText.visible = true;
                if (this.term > 0) {
                    this.term--;
                } else {
                    this.term = 50;

                    var moods = 0;
                    this.dudes.forEach(function (dude) {
                        moods += dude.mood;
                    });
                    moods /= this.dudes.length;

                    if (moods < 0.4) {
                        this.gradeText2.text = 'F';
                    } else if (moods < 0.60) {
                        this.gradeText2.text = 'D';
                    } else if (moods < 0.75) {
                        this.gradeText2.text = 'C';
                    } else if (moods < 0.9) {
                        this.gradeText2.text = 'B';
                    } else {
                        this.gradeText2.text = 'A';
                    }

                    this.state++;
                }
        } else if (this.state === 10) {
                this.gradeText2.visible = true;

                if (this.gradeText2.fontSize > 200) {
                    this.gradeText2.fontSize -= 50;
                    this.gradeText2.alpha = Math.min(this.gradeText2.alpha+0.2, 0.9)
                } else if (this.term > 0) {
                    this.term--;
                } else {
                    this.term = 0;
                    this.state++;
                }
        } else if (this.state === 11) {
            if (window.localStorage.getItem('survey') != null) {
                this.state++;
            } else {
                this.survey.visible = true;
                this.survey2.visible = true;
                this.survey3.visible = true;
                if (this.term < 1) {
                    console.log(this.term);
                    this.term += 0.05;
                } else {
                    if (clickPos != null &&
                        DIMS.game.inner.width/2-220 <= clickPos.x
                            && clickPos.x <= DIMS.game.inner.width/2-220+440 &&
                        DIMS.game.inner.height/2+160 <= clickPos.y
                            && clickPos.y <= DIMS.game.inner.height/2+160+50) {

                        window.localStorage.setItem('survey', 'yes');

                        window.location =
                        'https://docs.google.com/forms/d/e/1FAIpQLSdtHrqVZAuqZz6_8okaxPGkqiCjHSbBnX1_mn860dXGmi1zpg/viewform';
                    }
                }
            }
        } else if (this.state === 12) {
                this.survey.visible = false;
                this.survey2.visible = false;
                this.survey3.visible = false;
                this.gradeText3.visible = true;
                if (clickPos != null && GEOM.dist([clickPos, {
                    x: DIMS.game.inner.width/2+130,
                    y: DIMS.game.inner.height/2+145,
                }]) <= 69) {
                    GAME.state.restart(false, true, {
                        arg: true
                    });
                }
        }

        ////////////////////////////////////////////////////////////////////////
        //
        // PRINT
        //
        ////////////////////////////////////////////////////////////////////////

        // 
        // CLEAR
        // 

        this.bg.clear();
        this.fg.clear();
        this.ffg.clear();
        this.dudeFgs.forEach(function (dudeFg) {
            dudeFg.clear();
        });

        // 
        // BACKGROUND
        // 

        var tb = 100;
        var fb = 400;
        var sb = 650;

        // this.bg.beginFill(0xa8ffb8);
        this.bg.beginFill(COLOURS_[0]);
        this.bg.drawRect(0, 0, DIMS.game.outer.width, DIMS.game.outer.height);
        this.bg.endFill();

        // this.bg.beginFill(0x64b272);
        this.bg.beginFill(COLOURS_[1]);
        this.bg.drawRect(0, DIMS.game.pad.vert+tb, DIMS.game.outer.width, fb-tb);
        this.bg.endFill();

        // this.bg.beginFill(0xb2926d);
        this.bg.beginFill(COLOURS_[2]);
        this.bg.drawRect(0, DIMS.game.pad.vert+sb, DIMS.game.outer.width,
        DIMS.game.outer.height-sb);
        this.bg.endFill();

        // this.bg.beginFill(0x64b272);
        // this.bg.beginFill(0x8b635c);

        this.bg.beginFill(COLOURS_[3]);
        this.bg.drawPolygon([
            0,0,
            DIMS.game.pad.horz,DIMS.game.pad.vert+0,
            DIMS.game.pad.horz+150,DIMS.game.pad.vert+tb,
            DIMS.game.pad.horz+150,DIMS.game.pad.vert+fb,
            DIMS.game.pad.horz+100,DIMS.game.pad.vert+sb,
            DIMS.game.pad.horz+75,DIMS.game.pad.vert+sb,
            DIMS.game.pad.horz,DIMS.game.outer.height,
            0,DIMS.game.outer.height,
        ]);
        this.bg.drawPolygon([
            DIMS.game.outer.width-(0),DIMS.game.pad.vert+0,
            DIMS.game.outer.width-(DIMS.game.pad.horz),DIMS.game.pad.vert+0,
            DIMS.game.outer.width-(DIMS.game.pad.horz+150),DIMS.game.pad.vert+tb,
            DIMS.game.outer.width-(DIMS.game.pad.horz+150),DIMS.game.pad.vert+0,
            DIMS.game.outer.width-(DIMS.game.pad.horz+150),DIMS.game.pad.vert+fb,
            DIMS.game.outer.width-(DIMS.game.pad.horz+100),DIMS.game.pad.vert+sb,
            DIMS.game.outer.width-(DIMS.game.pad.horz+75),DIMS.game.pad.vert+sb,
            DIMS.game.outer.width-(DIMS.game.pad.horz),DIMS.game.outer.height,
            DIMS.game.outer.width-(0),DIMS.game.outer.height,
        ]);
        this.bg.endFill();

        // 
        // FOREGROUND
        // 

        this.dudes.forEach(function (dude) {
            this.drawDude(this.dudeFgs[dude.row], this.moodgs[dude.row], dude);
        }, this);

        this.drawDude(this.fg, this.moodgs[0], {
            colour: 0xf0f0f0,
            mood: 0.0,
            x: DIMS.game.inner.width/2,
            y: DIMS.game.inner.height/2+170,
        });

        // BUTTONS

        this.buttons.forEach(function (button) {
            // this.fg.beginFill(0xf8f8f8);
            // this.fg.beginFill(0xfcfcfc);
            this.fg.beginFill(0xfdfdfd);
            this.fg.drawCircle(button.x, button.y, button.r);
            this.fg.endFill();
            this.fg.lineStyle(4, 0xfdfdfd);
            this.fg.drawCircle(button.x, button.y, button.r+10);
            this.fg.endFill();
            this.fg.lineStyle();
        }, this);

        // this.fg.beginFill(0xfdfdfd);
        // this.fg.drawCircle(this.fsButton.x, this.fsButton.y, this.fsButton.r);
        // this.fg.endFill();

        if (this.leftover < 18) {
            var i = Math.min(this.leftover, 10);
            // this.side = 0;
            var x = this.side ? 150 : DIMS.game.inner.width-150;
            var x2 = this.side ? 151 : DIMS.game.inner.width-151;
            this.moodgs[2].beginFill(0xfdfdfd);
            var pt = GEOM.mvInDir({x: x, y: 175}, {x: x2, y: 176}, 150-150*i/10);
            this.moodgs[2].drawCircle(pt.x, pt.y, 300-GEOM.dist([{x: x, y: 175}, pt]));
            this.moodgs[2].drawPolygon([
                pt.x-15,pt.y,
                pt.x+15,pt.y,
                // pt.x-50,pt.y+250,
                DIMS.game.inner.width/2+25+this.side*-1*50,DIMS.game.inner.height/2+140-50,
            ]);
            this.moodgs[2].endFill();
            // if (this.leftover == 1) {
            //     this.halt = true;
            // }
            this.leftover++;
        }

        if (this.state === 2) {
            var w = DIMS.game.inner.width*0.7;
            var h = DIMS.game.inner.height*0.1;
            var hs = [
                DIMS.game.inner.height/3-h/2,
                DIMS.game.inner.height/2-h/2,
                DIMS.game.inner.height/3*2-h/2,
            ];
            for (var i = 0; i <= this.chosen.length; i++) {
                this.ffg.beginFill(0xffffff);
                this.ffg.drawRoundedRect(
                    DIMS.game.inner.width/2-w/2, hs[i], w, h);
                this.ffg.endFill();

                for (var j = 0; j < 3; j++) {
                    if (i < this.chosen.length) {
                        this.ffg.beginFill(this.chosen[i] != j ?
                             COLOURS_[3] : COLOURS_[0]);
                    } else {
                        this.ffg.beginFill(COLOURS_[0]);
                    }
                    // this.ffg.beginFill(i < this.chosen.length && this.chosen[i] == j ?
                    //      COLOURS_[3] : COLOURS_[0]);
                    //      // COLOURS_[3] : COLOURS_[0]);
                    this.ffg.drawRoundedRect(
                        (DIMS.game.inner.width/2-(w*0.3)/2)-w*0.325+w*0.325*j,
                        hs[i]+h*0.05,
                        w*0.9/3,
                        h*0.9
                    );
                    this.ffg.endFill();
                }
            }
        }

        if (this.state === 0) {
            this.countdown.text = ''+this.time;
        }

        if (this.state === 11 && window.localStorage.getItem('survey') == null) {
            this.ffg.beginFill(0xf8f8f8);
            this.ffg.drawRoundedRect(
                DIMS.game.inner.width/2-250,
                DIMS.game.inner.height/2-50+
                    (1-this.term)*(DIMS.game.inner.height/2),
                500,
                360
            );
            this.ffg.endFill();

            this.ffg.beginFill(COLOURS_[1]);
            this.ffg.drawRoundedRect(
                DIMS.game.inner.width/2-220,
                DIMS.game.inner.height/2+160+
                    (1-this.term)*(DIMS.game.inner.height/2),
                440,
                70,
                50
            );
            this.ffg.endFill();

            this.survey.y = 
                DIMS.game.inner.height/2+50+
                    (1-this.term)*(DIMS.game.inner.height/2);

            this.survey2.y = 
                DIMS.game.inner.height/2+200+
                    (1-this.term)*(DIMS.game.inner.height/2);

            this.survey3.y = 
                DIMS.game.inner.height/2+270+
                    (1-this.term)*(DIMS.game.inner.height/2);
        }

        if (this.state === -1) {
            if (this.hl < 1) {
                this.ffg.lineStyle(3, 0x8f8f8f, 0.7*this.hl);
                this.ffg.drawCircle(
                    DIMS.game.inner.width/2+200,
                    DIMS.game.inner.height/2-250,
                    69+20-this.hl*20
                );
                this.ffg.endFill();
            }

            if (this.hl < 5) {
                this.hl += 0.07;
            } else {
                this.hl = 0;
            }

            this.fg.beginFill(0xf8f8f8);
            this.fg.drawRoundedRect(
                DIMS.game.inner.width/2-250,
                DIMS.game.inner.height/2-320,
                500,
                130
            );
            this.fg.endFill();

            this.ffg.beginFill(0x8f8f8f);
            this.ffg.drawCircle(
                DIMS.game.inner.width/2+200,
                DIMS.game.inner.height/2-250,
                60
            );
            this.ffg.endFill();

            this.ffg.lineStyle(3, 0x8f8f8f);
            this.ffg.drawCircle(
                DIMS.game.inner.width/2+200,
                DIMS.game.inner.height/2-250,
                69
            );
            this.ffg.endFill();

            this.ffg.lineStyle();

            this.ffg.beginFill(0xf8f8f8);
            this.ffg.drawPolygon([
                DIMS.game.inner.width/2+200+24,DIMS.game.inner.height/2-250,
                DIMS.game.inner.width/2+200-12,DIMS.game.inner.height/2-250+20,
                DIMS.game.inner.width/2+200-12,DIMS.game.inner.height/2-250-20,
                DIMS.game.inner.width/2+200+24,DIMS.game.inner.height/2-250,
            ]);
        }

        if (this.state === 12) {
            this.ffg.beginFill(0xe0e0e0);
            this.ffg.drawCircle(
                DIMS.game.inner.width/2+130,
                DIMS.game.inner.height/2+145,
                60
            );
            this.ffg.endFill();

            this.ffg.lineStyle(3, 0xe0e0e0);
            this.ffg.drawCircle(
                DIMS.game.inner.width/2+130,
                DIMS.game.inner.height/2+145,
                69
            );
            this.ffg.endFill();

            this.ffg.lineStyle();

            this.ffg.beginFill(0x8f8f8f);
            this.ffg.drawPolygon([
                DIMS.game.inner.width/2+130+24,DIMS.game.inner.height/2+145,
                DIMS.game.inner.width/2+130-12,DIMS.game.inner.height/2+145+20,
                DIMS.game.inner.width/2+130-12,DIMS.game.inner.height/2+145-20,
                DIMS.game.inner.width/2+130+24,DIMS.game.inner.height/2+145,
            ]);
            this.ffg.endFill();
        }
    },

    drawDude: function(fg, moodg, dude) {
        // var colour = 0x00ccff;
        // var mood = dude.mood*-1+1;
        // if (mood >= 0.6) {
        //     mood -= (0.6);
        //     mood /= 0.5;
        // } else if (mood <= 0.4) {
        //     colour = 0xffff00;
        //     mood = (mood*-1 + 0.4);
        //     mood /= 0.4;
        // } else {
        //     mood = 0;
        // }
        var colour = 0xffff00;
        var mood = dude.mood;

        if (this.state > 6 && dude.mood > 1) {
            if (dude.off > 0) {
                dude.off += dude.v;
                dude.v -= 4;
            } else if (dude.rand > 0) {
                dude.v = 0;
                dude.rand--;
            } else {
                dude.v = 20;
                dude.off += dude.v;
                dude.v -= 4;
                dude.rand = Math.floor(Math.random()*30);
            }
        } else {
            dude.off = 0;
        }

        // fg.beginFill(0xf0f0f0);
        fg.beginFill(dude.colour);
        // fg.drawCircle(dude.x, dude.y, 70);
        fg.drawEllipse(dude.x, dude.y-Math.max(dude.off, 0), 40, 55);
        // fg.drawCircle(dude.x, dude.y+20, 70);
        // fg.drawEllipse(dude.x+26, dude.y+10, 10, 30);
        // fg.drawEllipse(dude.x-26, dude.y+10, 10, 30);
        fg.endFill();

        moodg.beginFill(colour, Math.min(Math.max(mood*0.5, 0), 1));
        moodg.drawEllipse(dude.x, dude.y-Math.max(dude.off, 0), 40, 55);
        // moodg.drawCircle(dude.x, dude.y, 70);
        // moodg.drawCircle(dude.x, dude.y+20, 70);
        // moodg.drawEllipse(dude.x+26, dude.y+10, 10, 30);
        // moodg.drawEllipse(dude.x-26, dude.y+10, 10, 30);
        moodg.endFill();
    },
};

function multiWriter(objs) {
    var mw = {};
    forEach(objs[0], function (meth) {
        mw[meth] = function() {
            var args = arguments;
            objs.forEach(function (obj) {
                obj[meth].apply(obj, args);
            });
        };
    });
    return mw;
}

function forEach(obj, f) {
    for (var prop in obj) {
        f(prop);
    }
}
