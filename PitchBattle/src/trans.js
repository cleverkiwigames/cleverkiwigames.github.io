var ENTERING_FROM_LEFT = 0;
var ENTERING_FROM_RIGHT = 1;

// Leave frames.
var SPD = 40; // Lower == faster.

// TODO Take state and extra.
function leaveToLeft(thisVar, f, onLeaveThis) {
    if (isMidTransition(thisVar)) {
        return;
    }
    thisVar.extra.transDir = ENTERING_FROM_LEFT;
    thisVar.trans = {
        leaveSpd: (DIMS.game.outer.width-DIMS.game.pad.horz)/SPD,
        onLeave: {thisVar: onLeaveThis, f: f},
    };
}

function leaveToRight(thisVar, f, onLeaveThis) {
    if (isMidTransition(thisVar)) {
        return;
    }
    thisVar.extra.transDir = ENTERING_FROM_RIGHT;
    thisVar.trans = {
        leaveSpd: -(DIMS.game.outer.width-DIMS.game.pad.horz)/SPD,
        onLeave: {thisVar: onLeaveThis, f: f},
    };
}

// Should be called in `create` after `fgGrp` has been created.
function enter(thisVar) {
    if (thisVar.extra.transDir === ENTERING_FROM_LEFT) {
        thisVar.fgGrp.x = -DIMS.game.outer.width;
        thisVar.trans = {
            enterSpd: (DIMS.game.outer.width-DIMS.game.pad.horz)/SPD,
        };
    } else if (thisVar.extra.transDir === ENTERING_FROM_RIGHT) {
        thisVar.fgGrp.x = DIMS.game.outer.width;
        thisVar.trans = {
            enterSpd: -(DIMS.game.outer.width-DIMS.game.pad.horz)/SPD,
        };
    }
    delete thisVar.extra.transDir;
}

// Should be called in `update`.
function updateTransition(thisVar) {
    if (isMidTransition(thisVar)) {
        if (typeof(thisVar.trans.leaveSpd) !== 'undefined') {
            thisVar.fgGrp.x += thisVar.trans.leaveSpd;
            if (thisVar.fgGrp.x < -DIMS.game.outer.width+DIMS.game.pad.horz*2
                    || thisVar.fgGrp.x > DIMS.game.outer.width) {
                var onLeave = thisVar.trans.onLeave;
                delete thisVar.trans;
                onLeave.f.apply(onLeave.thisVar);
            }
        } else if (typeof(thisVar.trans.enterSpd) !== 'undefined') {
            thisVar.fgGrp.x += thisVar.trans.enterSpd;
            if (thisVar.trans.enterSpd < 0
                    && thisVar.fgGrp.x <= DIMS.game.pad.horz) {
                thisVar.fgGrp.x = DIMS.game.pad.horz;
                delete thisVar.trans;
            } else if (thisVar.trans.enterSpd > 0
                    && thisVar.fgGrp.x >= DIMS.game.pad.horz) {
                thisVar.fgGrp.x = DIMS.game.pad.horz;
                delete thisVar.trans;
            }
        }
    }
}

function isMidTransition(thisVar) {
    return typeof(thisVar.trans) !== 'undefined';
}

function isLeaving(thisVar) {
    return isMidTransition(thisVar) && typeof(thisVar.trans.leaveSpd) !== 'undefined';
}

function isEntering(thisVar) {
    return isMidTransition(thisVar) && typeof(thisVar.trans.enterSpd) !== 'undefined';
}
