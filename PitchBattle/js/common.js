// Abstracted from http://stackoverflow.com/a/17243070/497142
function hsvToRgb(hsv) {
    var h = hsv.h, s = hsv.s, v = hsv.v;
    var r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

// Abstracted from http://stackoverflow.com/a/17243070/497142
function rgbToHsv(rgb) {
    var r = rgb.r, g = rgb.g, b = rgb.b;
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {h: h, s: s, v: v};
}

function rgbToInt(rgb) {
    return rgb.r * 65536 + rgb.g * 256 + rgb.b;
}

function intToRgb(x) {
    return {
        r: (x & 0xff0000) >> 0x10,
        g: (x & 0x00ff00) >> 0x08,
        b: (x & 0x0000ff) >> 0x00,
    };
}

function inArray(x, xs) {
    for (var i = 0; i < xs.length; i++) {
        if (xs[i] === x) {
            return true;
        }
    }
    return false;
}

var COLOURS = [
    0xe2c987,
    0x49623d,
    0xfef6e3,
    0x002c25,
    0x191615
];

var COL_BG = 0;
var COL_TEXT = 1;
var COL_PRIM = 2;
var COL_SEC = 3;

var DIFF = 0.1;
for (var i = 0; i < COLOURS.length; i++) {
    var hsv = rgbToHsv(intToRgb(COLOURS[i]));
    var mod = function(v) {
        return rgbToInt(hsvToRgb({
            h: hsv.h,
            s: hsv.s,
            v: v >= 0 ? Math.min(hsv.v + v, 1) : Math.max(hsv.v + v, 0)
        }));
    }
    COLOURS[i] = {
        light: mod(DIFF),
        plain: COLOURS[i],
        dark: mod(-DIFF)
    };
}

function addText(x, y, text, size, colour) {
    var t = GAME.add.text(x, y, text, {
        font: size + 'px Arial',
        fill: colour || COL_TEXT
    });
    t.anchor.setTo(0.5, 0.5);
    return t;
}

function saveProgress(p) {
    save('progress', p);
}

function save(key, x) {
    window.localStorage.setItem(key, JSON.stringify(x));
}

function loadProgress() {
    var p = load('progress');
    return p === null ? {} : p;
}

function load(key) {
    var x = window.localStorage.getItem(key);
    return x === null ? null : JSON.parse(x);
}

function startState(state, extra) {
    GAME.state.start(state, true, false, extra);
}

function drawBoundBox(g, dims) {
    if (DEBUGGING) {
        g.lineStyle(10, 0, 10);
        g.drawRect(0, 0, dims.game.inner.width, dims.game.inner.height);
        g.endFill();
        GAME.world.bringToTop(g);
    }
}

function addGroup(dims) {
    var g = GAME.add.group();
    moveGroup(g, dims.game.pad.horz, dims.game.pad.vert);
    return g;
}

function moveGroup(grp, x, y) {
    grp.x = x;
    grp.y = y;
}

function scale(game, screen) {
    var dims = {
        game: {
            inner: game,
        },
        screen: screen,
        ratio: Math.min(screen.width/game.width, (screen.height-screen.adHeight)/game.height)
    };
    // SCREEN x -> GAME x: x/ratio
    // GAME x -> SCREEN x: x*ratio
    dims.game.adHeight = screen.adHeight/dims.ratio;
    dims.game.outer = {
        width: screen.width/dims.ratio,
        height: screen.height/dims.ratio
    };
    dims.game.pad = {
        vert: (dims.game.outer.height-dims.game.adHeight-game.height)/2,
        horz: (dims.game.outer.width-game.width)/2,
    };
    dims.game.inner.left = dims.game.pad.horz;
    dims.game.inner.top = dims.game.pad.vert;
    return dims;
}

function extractPrice(localPrice) {
    var p = '';
    for (var i = 0; i < localPrice.length; i++) {
        if (('0' <= localPrice[i] && localPrice[i] <= '9') || localPrice[i] == '.') {
            p += localPrice[i];
        }
    }
    return p;
}

function screenDimToGameDim(dims, screenDim) {
    return screenDim/dims.ratio;
}

function gameDimToScreenDim(dims, gameDim) {
    return gameDim*dims.ratio;
}

function slowClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
