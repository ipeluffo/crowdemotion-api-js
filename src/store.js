/* Copyright (c) 2010-2012 Marcus Westin */
(function () {
    function h() {
        try {
            return d in b && b[d]
        } catch (a) {
            return!1
        }
    }

    function i() {
        try {
            return e in b && b[e] && b[e][b.location.hostname]
        } catch (a) {
            return!1
        }
    }

    var a = {}, b = window, c = b.document, d = "localStorage", e = "globalStorage", f = "__storejs__", g;
    a.disabled = !1, a.set = function (a, b) {
    }, a.get = function (a) {
    }, a.remove = function (a) {
    }, a.clear = function () {
    }, a.transact = function (b, c, d) {
        var e = a.get(b);
        d == null && (d = c, c = null), typeof e == "undefined" && (e = c || {}), d(e), a.set(b, e)
    }, a.getAll = function () {
    }, a.serialize = function (a) {
        return JSON.stringify(a)
    }, a.deserialize = function (a) {
        if (typeof a != "string")return undefined;
        try {
            return JSON.parse(a)
        } catch (b) {
            return a || undefined
        }
    };
    if (h())g = b[d], a.set = function (b, c) {
        return c === undefined ? a.remove(b) : (g.setItem(b, a.serialize(c)), c)
    }, a.get = function (b) {
        return a.deserialize(g.getItem(b))
    }, a.remove = function (a) {
        g.removeItem(a)
    }, a.clear = function () {
        g.clear()
    }, a.getAll = function () {
        var b = {};
        for (var c = 0; c < g.length; ++c) {
            var d = g.key(c);
            b[d] = a.get(d)
        }
        return b
    }; else if (i())g = b[e][b.location.hostname], a.set = function (b, c) {
        return c === undefined ? a.remove(b) : (g[b] = a.serialize(c), c)
    }, a.get = function (b) {
        return a.deserialize(g[b] && g[b].value)
    }, a.remove = function (a) {
        delete g[a]
    }, a.clear = function () {
        for (var a in g)delete g[a]
    }, a.getAll = function () {
        var b = {};
        for (var c = 0; c < g.length; ++c) {
            var d = g.key(c);
            b[d] = a.get(d)
        }
        return b
    }; else if (c.documentElement.addBehavior) {
        var j, k;
        try {
            k = new ActiveXObject("htmlfile"), k.open(), k.write('<script>document.w=window</script><iframe src="/favicon.ico"></frame>'), k.close(), j = k.w.frames[0].document, g = j.createElement("div")
        } catch (l) {
            g = c.createElement("div"), j = c.body
        }
        function m(b) {
            return function () {
                var c = Array.prototype.slice.call(arguments, 0);
                c.unshift(g), j.appendChild(g), g.addBehavior("#default#userData"), g.load(d);
                var e = b.apply(a, c);
                return j.removeChild(g), e
            }
        }

        var n = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");

        function o(a) {
            return a.replace(n, "___")
        }

        a.set = m(function (b, c, e) {
            return c = o(c), e === undefined ? a.remove(c) : (b.setAttribute(c, a.serialize(e)), b.save(d), e)
        }), a.get = m(function (b, c) {
            return c = o(c), a.deserialize(b.getAttribute(c))
        }), a.remove = m(function (a, b) {
            b = o(b), a.removeAttribute(b), a.save(d)
        }), a.clear = m(function (a) {
            var b = a.XMLDocument.documentElement.attributes;
            a.load(d);
            for (var c = 0, e; e = b[c]; c++)a.removeAttribute(e.name);
            a.save(d)
        }), a.getAll = m(function (b) {
            var c = b.XMLDocument.documentElement.attributes;
            b.load(d);
            var e = {};
            for (var f = 0, g; g = c[f]; ++f)e[g] = a.get(g);
            return e
        })
    }
    try {
        a.set(f, f), a.get(f) != f && (a.disabled = !0), a.remove(f)
    } catch (l) {
        a.disabled = !0
    }
    a.enabled = !a.disabled, typeof module != "undefined" && typeof module != "function" ? module.exports = a : typeof define == "function" && define.amd ? define(a) : this.store = a
})()