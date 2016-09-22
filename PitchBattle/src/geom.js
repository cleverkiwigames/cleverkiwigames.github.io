var GEOM = {
    // Returns the point of intersection of both `lines`.
    ptOfIntr: function (lines) {
        // http://stackoverflow.com/a/4543530/497142
        var fms = [this.lineFm(lines[0]), this.lineFm(lines[1])];
        if (fms[0].vert || fms[1].vert) {
            if (fms[0].vert && fms[1].vert) {
                return null; // Parallel
            }
            if (fms[1].vert) {
                fms = [fms[1], fms[0]];
            }
            // fms[0] is now vert, fms[1] is not
            return {
                x: fms[0].x,
                y: (fms[1].C-fms[1].A*fms[0].x) / fms[1].B,
            };
        }

        var d = fms[0].A*fms[1].B - fms[1].A*fms[0].B;
        if (d == 0) {
            return null;
        }
        return {
            x: (fms[1].B*fms[0].C - fms[0].B*fms[1].C)/d,
            y: (fms[0].A*fms[1].C - fms[1].A*fms[0].C)/d,
        };
    },

    // Returns the point of intersection of both `segs`.
    ptOfSegIntr: function (segs) {
        var poi = this.ptOfIntr(segs);
        return poi != null && this.isBetw(poi, segs[0]) && this.isBetw(poi, segs[1]) ? poi : null;
    },

    // Returns the formula of a line as `{vert: true, x: x}` if the line is
    // vertical, or {vert: false, A: A, B: B C: C} otherwise.
    lineFm: function (line) {
        if (line[0].x == line[1].x) { // Vertical line
            return {
                vert: true,
                x: line[0].x,
            };
        }

        var fm = {
            vert: false,
            A: -this.slope(line),
            B: 1,
        };
        fm.C = line[0].x*fm.A + line[0].y*fm.B;
        return fm;
    },

    // FUZZY
    //
    // FIXME Try test with 1 thresh, output seems to be beside 
    //
    // Returns `true` if `pt` is between `pts`, within a threshold.
    isBetw: function (pt, pts) {
        // http://stackoverflow.com/a/17693146/497142
        return this.isWithin(
            this.dist([pt, pts[0]]) + this.dist([pt, pts[1]]),
            this.dist(pts),
            0.001
        );
    },

    // Returns `true` if the distance between `a` and `b` is within `thresh`.
    isWithin: function (a, b, thresh) {
        return Math.abs(a-b) < thresh;
    },

    // Returns the distance between 2 `pts`.
    dist: function (pts) {
        return Math.sqrt(Math.pow(pts[0].x-pts[1].x, 2)+Math.pow(pts[0].y-pts[1].y, 2));
    },

    // DIV_ZERO_POTENTIAL
    //
    // Returns the slope of a line.
    slope: function (line) {
        var p = this.relPos(line[0], line[1]);
        // TODO Handle `p.x == 0`.
        return p.y / p.x;
    },

    // Returns `p` as an offset from `orig`.
    relPos: function (p, orig) {
        return {
            x: p.x-orig.x,
            y: p.y-orig.y,
        };
    },

    // Returns the quadrant `p` lies in relative to the origin:
    //
    //        |
    //      1 | 0
    //        |
    //     ---+---
    //        |
    //      2 | 3
    //        |
    //
    quad: function (p) {
        if (p.y >= 0) {
            if (p.x >= 0) {
                return 0;
            }
            return 1;
        }
        if (p.x >= 0) {
            return 3;
        }
        return 2;
    },

    // Moves `orig` `off` units in the direction of `pt`.
    mvInDir: function (orig, pt, off) {
        if (orig.x == pt.x) {
            if (orig.y == pt.y) {
                return {x: orig.x, y: orig.y};
            } else {
                return {x: orig.x, y: orig.y + off*(pt.y > orig.y ? 1 : -1)};
            }
        }

        var ang = Math.atan(this.slope([orig, pt]));
        var q = this.quad(this.relPos(orig, pt));
        // Need to adjust angle because atan only returns value in range
        // [-PI/2, PI/2].
        ang += q == 0 || q == 3 ? Math.PI : 0;
        return {
            x: orig.x+off*Math.cos(ang),
            y: orig.y+off*Math.sin(ang),
        };
    },

    // Moves `orig` `mag` percent in the direction of `pt`.
    mvInDir2: function (orig, pt, mag) {
        if (orig.x == pt.x) {
            if (orig.y == pt.y) {
                return {x: orig.x, y: orig.y};
            } else {
                return {x: orig.x, y: orig.y + mag*(pt.y-orig.y)};
            }
        }

        var ang = Math.atan(this.slope([orig, pt]));
        var q = this.quad(this.relPos(orig, pt));
        var d = this.dist([orig, pt]);
        // Need to adjust angle because atan only returns value in range
        // [-PI/2, PI/2].
        ang += q == 0 || q == 3 ? Math.PI : 0;
        return {
            x: orig.x+mag*d*Math.cos(ang),
            y: orig.y+mag*d*Math.sin(ang),
        };
    },

    // Returns `true` if the components of `a` and `b` are within `thresh` of
    // each other.
    eq: function (a, b, thresh) {
        thresh = thresh || 0;
        return this.isWithin(a.x, b.x, thresh) && this.isWithin(a.y, b.y, thresh);
    },

    // ***VERY_FLAKY***
    //
    // Returns `true` if the components of `a` and `b` are equal.
    strictEq: function (a, b) {
        return a.x == b.x && a.y == b.y;
    },

    // Returns `p` rotated by `rot` around `pivot`.
    // TODO Define rotation metric.
    pivot: function(p, pivot, rot) {
        // var mag = GEOM.dist([p, pivot]);
        // var m = Math.atan((pivot.y-p.y)/(pivot.x-p.x)); // TODO account for horizontal
        // return {
        //     x: pivot.x+mag*Math.sin(rot+m),
        //     y: pivot.y+mag*Math.cos(rot+m),
        // };

        // http://stackoverflow.com/a/15109215/497142
        return {
            x: Math.cos(rot)*(p.x-pivot.x)-Math.sin(rot)*(p.y-pivot.y)+pivot.x,
            y: Math.sin(rot)*(p.x-pivot.x)+Math.cos(rot)*(p.y-pivot.y)+pivot.y,
        };
    },

    ptsAdd: function(pts) {
        var p = this.clonePt(this.orig);
        pts.forEach(function (pt) {
            p = {x: p.x+pt.x, y: p.y+pt.y};
        });
        return p;
    },

    ptsSub: function(a, b) {
        return {x: a.x-b.x, y: a.y-b.y};
    },

    // Flips `pt` thru the origin.
    invert: function(pt) {
        return this.ptsSub(this.orig, pt);
    },

    orig: {x: 0, y: 0},

    clonePt: function (pt) {
        return {x: pt.x, y: pt.y};
    },

    // NOT_FULLY_TESTED, EDGE_CASES_LIKELY
    // FUZZY
    //
    // Returns `true` if `pt` is within the lines delimiting `poly`.
    isInside: function (pt, poly) {
        // Use naive ray tracing.
        var inside = false;
        var line = [pt, {x: pt.x+1, y: pt.y}];
        this.forEachSeg(poly, function (seg) {
            var poi = GEOM.ptOfIntr([line, seg]);
            if (poi != null && GEOM.isBetw(poi, seg) && poi.x < pt.x) {
                inside = !inside;
            }
        }, this);
        return inside;
    },

    forEachSeg: function (pts, f, thisVar) {
        for (var i = 0; i < pts.length; i++) {
            var j = (i+1) % pts.length;
            f.apply(thisVar, [[pts[i], pts[j]], i]);
        }
    },

    rectPts: function (w, h, x, y, rot) {
        if (rot == Infinity) {
            rot = Math.PI/2;
        } else if (rot == -Infinity) {
            rot = -Math.PI/2;
        }

        var pts = [];
        var mag = Math.sqrt(Math.pow(w/2, 2)+Math.pow(h/2, 2));
        var m = Math.atan(h/w);
        for (var i = 0; i < 4; i++) {
            var p = i == 1 || i == 2 ? Math.PI : 0;
            var t = i == 1 || i == 3 ? -1 : 1;
            pts.push({
                x: x+mag*Math.cos(rot+m*t+p),
                y: y+mag*Math.sin(rot+m*t+p),
            });
        }
        return pts;
    },

    // function oppSidesOrSame(pts, orig) {
    //     var isLeft = [pts[0].x < orig.x, pts[1].x < orig.x];
    //     var isAbove = [pts[0].y < orig.y, pts[1].y < orig.y];
    //     return (pts[0].x == pts[1].x || isLeft[0] != isLeft[1]) &&
    //         (pts[0].y == pts[1].y || isAbove[0] != isAbove[1]);
    // },

    // // get the points of corners of a line
    // function linePts(src, dst, w) {
    //     return rectPts(GEOM.dist([src, dst]), w, (src.x+dst.x)/2,
    //         (src.y+dst.y)/2, Math.atan(GEOM.slope([src, dst])));
    // },

    // arrToLines: function (arr) {
    //     var pts = this.arrToPts(arr);
    //     var lines = [];
    //     for (var i = 0; i < pts.length; i++) {
    //         var j = (i+1) % pts.length;
    //         lines.push([pts[i], pts[j]]);
    //     }
    //     return lines;
    // },

    arrToPts: function (arr) {
        var pts = [];
        for (var i = 0; i < arr.length; i += 2) {
            pts.push({x: arr[i], y: arr[i+1]});
        }
        return pts;
    },

    // Abstracted from http://stackoverflow.com/a/1088058/497142
    closestPtToLineSeg: function(pt, seg) {
        var closestPt = this.closestPtToLine(pt, seg);
        if ((Math.min(seg[0].x, seg[1].x) < closestPt.x && closestPt.x < Math.max(seg[0].x, seg[1].x))
                || (Math.min(seg[0].y, seg[1].y) < closestPt.y && closestPt.y < Math.max(seg[0].y, seg[1].y))) {
            return closestPt;
        } else if (this.dist([pt, seg[0]]) < this.dist([pt, seg[1]])) {
            return seg[0];
        } else {
            return seg[1];
        }
    },

    closestPtToLine: function(pt, line) {
        var lineLen = this.dist(line);

        var dirVec = {
            x: (line[1].x - line[0].x)/lineLen,
            y: (line[1].y - line[0].y)/lineLen
        };

        var closestVal = dirVec.x*(pt.x-line[0].x) + dirVec.y*(pt.y-line[0].y);
        return {
            x: closestVal*dirVec.x + line[0].x,
            y: closestVal*dirVec.y + line[0].y
        };
    },
};
