! function () {
  function n(a, c) {
    var b = !0;
    (function f(a) {
      var d;
      if (b)
        if (!1 === c(a)) b = !1;
        else
          for (d = 0; d < a.children.length; d++) {
            var g = a.children[d];
            f(g)
          }
    })(a)
  }

  function q(a, c) {
    for (var b, e; a && !1 !== c(a);) {
      for (b = 0; b < a.children.length; b++)
        if (e = a.children[b], !1 === c(e)) return;
      a = a.parent
    }
  }

  function l(a, c, b) {
    var e = [];
    b(a, function (a) {
      var b = a.id;
      if (!(-1 < e.indexOf(b)) && (a = c.call(a, a), e.push(b), !1 === a)) return a
    })
  }

  function m(a) {
    var c = a.parent,
      b;
    for (b = 0; b < c.children.length; b++) {
      var e = c.children[b];
      if (e === a) return c.children.splice(b,
        1).shift()
    }
  }

  function d(a, c, b) {
    this.depth = a ? a.depth + 1 : 0;
    this.data = c || {};
    this.parent = a || null;
    (c = b) || (c = a ? [a.id, a.children.length].join("/") : "0");
    this.id = c;
    this.children = []
  }
  d.parse = function (a, c) {
    var b, e = function (a) {
      var b, e = {};
      for (b in a) b !== c && (e[b] = a[b]);
      return e
    };
    (function p(a, h) {
      var f;
      if (h) {
        var k = new d(h, e(a));
        h.children.push(k)
      } else k = b = new d(null, e(a));
      if (c in a)
        for (f = 0; f < a[c].length; f++) p(a[c][f], k)
    })(a);
    return b
  };
  d.prototype.appendChild = function (a, c) {
    var b = new d(this, a, c);
    this.children.push(b);
    return this
  };
  d.prototype.removeChild = function (a) {
    if ("number" === typeof a && this.children[a]) return this.children.splice(a, 1).shift();
    if (a instanceof d) return m(a);
    throw Error("Invalid argument " + a);
  };
  d.prototype.remove = function () {
    return m(this)
  };
  d.prototype.root = function () {
    var a = this;
    if (!a.parent) return this;
    for (; a.parent;) a = a.parent;
    return a
  };
  d.prototype.isRoot = function () {
    return !this.parent
  };
  d.prototype.traverseUp = function (a) {
    l(this, a, q)
  };
  d.prototype.traverseDown = function (a) {
    l(this, a, n)
  };
  d.prototype.toString =
    function () {
      var a = [];
      this.traverseDown(function (c) {
        var b = "",
          e;
        if (0 === c.depth) a.push(c.id);
        else {
          for (e = 0; e < c.depth; e++) b += " ";
          a.push(b + "|- " + c.id)
        }
      });
      return a.join("\n")
    };
  d.prototype.find = function (a) {
    var c = null,
      b = "function" === typeof a ? a : function (b) {
        if (b.id === a) return c = b, !1
      };
    this.traverseDown(function (a) {
      if (b.call(this, a)) return c = a, !1
    });
    return c
  };
  d.prototype.path = function (a, c) {
    c = c || "/";
    a[0] === c && (a = a.substring(1));
    var b = a.split(c),
      d = this,
      g;
    for (g = 0; g < b.length; g++) {
      var f = parseInt(b[g], 10);
      d = d.children.length &&
        d.children.length > f ? d.children[f] : null
    }
    return d
  };
  d.prototype.toArray = function () {
    var a = [];
    this.traverseDown(function (c) {
      a.push(c)
    });
    return a
  };
  d.prototype.__defineGetter__("length", function () {
    return this.toArray().length
  });
  "undefined" !== typeof module && module.exports ? module.exports = d : this.Arboreal = d
}(this);
