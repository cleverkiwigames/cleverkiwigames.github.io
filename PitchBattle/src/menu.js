// DEBUGGING = true;

var menuState = {
    init: function (extra) {
        this.extra = extra;
    },

    onResize: function (left, top) {
        this.fgGrp.x = left;
        this.fgGrp.y = top;
    },

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
        this._delay = 0;

        this.pt = null;

        ////////////////////////////////////////////////////////////////////////
        //
        // STATE VARS
        //
        ////////////////////////////////////////////////////////////////////////

        this.sheets = slowClone(SHEETS[1]);
        this.sheets.forEach(function (sheet) {
            sheet.shape = GEOM.arrToPts(sheet.shape);
            sheet.dots = GEOM.arrToPts(sheet.dots);
            sheet.gamePos = GEOM.ptsAdd([
                sheet.gamePos,
                {
                    x: DIMS.game.inner.width/2,
                    y: DIMS.game.inner.height/2,
                }
            ]);
            sheet.scale = sheet.menu.scale;
            sheet.origScale = sheet.scale;
            sheet.cuts = [];
        });

        this.cuts = [];

        ////////////////////////////////////////////////////////////////////////
        //
        // GRAPHICS, GROUPS AND SPRITE LAYERS
        //
        ////////////////////////////////////////////////////////////////////////

        this.bg = GAME.add.graphics(0, 0);

        // GROUP
        this.fgGrp = addGroup(DIMS);

        this.fg = GAME.add.graphics(0, 0);
        this.fgGrp.add(this.fg);

        var bb = GAME.add.graphics(0, 0);
        this.fgGrp.add(bb);
        drawBoundBox(bb, DIMS);

        this.ffg = GAME.add.graphics(0, 0);
        this.fgGrp.add(this.ffg);

        ////////////////////////////////////////////////////////////////////////
        //
        // TEXT
        //
        ////////////////////////////////////////////////////////////////////////

        var textConf = {font: '30px Arial', fill: '#ffffff', align: 'center'};

        this.sheets.forEach(function (sheet, i) {
            var t = GAME.add.text(DIMS.game.inner.width/this.sheets.length*(i+0.5),
                DIMS.game.inner.height-100, ''+(i+1), textConf, this.fgGrp);
            t.inputEnabled = true;
            t.events.onInputDown.add(function () {
                this.pt = sheet.gamePos;
                this.transData = {
                    sheet: sheet,
                    mv: GEOM.ptsSub(
                        GEOM.mvInDir2(
                            sheet.menuPos,
                            sheet.gamePos,
                            (1/SPD)/2
                        ),
                        sheet.menuPos
                    ),
                    sc: ((1-sheet.menu.scale)/SPD)/2,
                };
                leaveToRight(this, function () {
                    // this.halt = true;
                    startState('game', Object.assign(this.extra, {
                        level: {num: 1, sheet: i},
                    }));
                }, this);
            }, this);
            t.anchor.setTo(0.5);
        }, this);

        ////////////////////////////////////////////////////////////////////////
        //
        // COCOON INIT
        //
        ////////////////////////////////////////////////////////////////////////

        COCOON.initState(GAME);
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
            this._delay++;
            if (this._delay == this.slowdown) {
                this._delay = 0;
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
        // READ
        //
        ////////////////////////////////////////////////////////////////////////

        ////////////////////////////////////////////////////////////////////////
        //
        // EVAL
        //
        ////////////////////////////////////////////////////////////////////////

        if (isLeaving(this)) {
            var sheet = this.transData.sheet;
            sheet.menuPos.x -= this.trans.leaveSpd;
            sheet.menuPos = GEOM.ptsAdd([sheet.menuPos, this.transData.mv]);
            sheet.scale += this.transData.sc;
        }

        if (isMidTransition(this)) {
            updateTransition(this);
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

        var bgCol = 0xbbbbbb;
        this.bg.beginFill(bgCol);
        this.bg.drawRect(0, 0, DIMS.game.outer.width, DIMS.game.outer.height);
        this.bg.endFill();

        //
        //
        //
        this.sheets.forEach(function (sheet, i) {
            sheet = scaleSheet(sheet, sheet.scale);
            sheet = sheetRelTo(sheet, GEOM.invert(sheet.menuPos), 0);
            drawSheet(this.fg, sheet, false);
        }, this);

        if (DEBUGGING) {
            this.sheets.forEach(function (sheet) {
                this.fg.lineStyle();
                this.fg.beginFill(0xff0000);
                this.fg.drawCircle(sheet.menuPos.x, sheet.menuPos.y, 20);
                this.fg.endFill();
                this.fg.beginFill(0x00ff00);
                this.fg.drawCircle(sheet.gamePos.x, sheet.gamePos.y, 20);
                this.fg.endFill();
            }, this);
        }
    },

    rotSheet: function (ang, center) {
        var p = GEOM.ptsSub(center, this.sheet);

        pivotAll(this.sheet.dots, p, ang);
        pivotAll(this.sheet.shape, p, ang);
        this.cuts.forEach(function (snips) {
            pivotAll(snips, center, ang);
        }, this);
    },

    mvSheet: function (offset) {
        this.mvAll(this.sheet.dots, offset);
        this.mvAll(this.sheet.shape, offset);
        this.cuts.forEach(function (snips) {
            this.mvAll(snips, offset);
        }, this);
    },

    mvAll: function (pts, offset) {
        for (var i = 0; i < pts.length; i++) {
            pts[i] = GEOM.ptsAdd([pts[i], offset]);
        }
    },
};

function scalePts(pts, mag) {
    return pts.map(function (pt) { return {x: pt.x*mag, y: pt.y*mag}; });
}
