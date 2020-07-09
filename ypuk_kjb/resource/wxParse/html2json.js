function e(e) {
    for (var t = {}, r = e.split(","), s = 0; s < r.length; s++) t[r[s]] = !0;
    return t;
}

function t(e) {
    return e.replace(/<\?xml.*\?>\n/, "").replace(/<.*!doctype.*\>\n/, "").replace(/<.*!DOCTYPE.*\>\n/, "");
}

function r(e) {
    return e.replace(/\r?\n+/g, "").replace(/<!--.*?-->/gi, "").replace(/\/\*.*?\*\//gi, "").replace(/[ ]+</gi, "<");
}

function s(e) {
    var t = [];
    if (0 == n.length || !i) return (d = {
        node: "text"
    }).text = e, s = [ d ];
    e = e.replace(/\[([^\[\]]+)\]/g, ":$1:");
    for (var r = new RegExp("[:]"), s = e.split(r), a = 0; a < s.length; a++) {
        var l = s[a], d = {};
        i[l] ? (d.node = "element", d.tag = "emoji", d.text = i[l], d.baseSrc = o) : (d.node = "text", 
        d.text = l), t.push(d);
    }
    return t;
}

var a = "https", n = "", o = "", i = {}, l = require("./wxDiscode.js"), d = require("./htmlparser.js"), c = (e("area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr"), 
e("br,a,code,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video")), u = e("abbr,acronym,applet,b,basefont,bdo,big,button,cite,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var"), p = e("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

e("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected"), 
e("wxxxcode-style,script,style,view,scroll-view,block");

module.exports = {
    html2json: function(e, n) {
        e = r(e = t(e)), e = l.strDiscode(e);
        var o = [], i = {
            node: n,
            nodes: [],
            images: [],
            imageUrls: []
        }, g = 0;
        return d(e, {
            start: function(e, t, r) {
                var s, d = {
                    node: "element",
                    tag: e
                };
                if (0 === o.length ? (d.index = g.toString(), g += 1) : (void 0 === (s = o[0]).nodes && (s.nodes = []), 
                d.index = s.index + "." + s.nodes.length), c[e] ? d.tagType = "block" : u[e] ? d.tagType = "inline" : p[e] && (d.tagType = "closeSelf"), 
                0 !== t.length && (d.attr = t.reduce(function(e, t) {
                    var r = t.name, s = t.value;
                    return "class" == r && (d.classStr = s), "style" == r && (d.styleStr = s), s.match(/ /) && (s = s.split(" ")), 
                    e[r] ? Array.isArray(e[r]) ? e[r].push(s) : e[r] = [ e[r], s ] : e[r] = s, e;
                }, {})), "img" === d.tag) {
                    d.imgIndex = i.images.length;
                    var m = d.attr.src;
                    "" == m[0] && m.splice(0, 1), m = l.urlToHttpUrl(m, a), d.attr.src = m, d.from = n, 
                    i.images.push(d), i.imageUrls.push(m);
                }
                if ("font" === d.tag) {
                    var h = [ "x-small", "small", "medium", "large", "x-large", "xx-large", "-webkit-xxx-large" ], f = {
                        color: "color",
                        face: "font-family",
                        size: "font-size"
                    };
                    for (var v in d.attr.style || (d.attr.style = []), d.styleStr || (d.styleStr = ""), 
                    f) if (d.attr[v]) {
                        var x = "size" === v ? h[d.attr[v] - 1] : d.attr[v];
                        d.attr.style.push(f[v]), d.attr.style.push(x), d.styleStr += f[v] + ": " + x + ";";
                    }
                }
                "source" === d.tag && (i.source = d.attr.src), r ? (void 0 === (s = o[0] || i).nodes && (s.nodes = []), 
                s.nodes.push(d)) : o.unshift(d);
            },
            end: function(e) {
                var t = o.shift();
                if (t.tag !== e && console.error("invalid state: mismatch end tag"), "video" === t.tag && i.source && (t.attr.src = i.source, 
                delete i.source), 0 === o.length) i.nodes.push(t); else {
                    var r = o[0];
                    void 0 === r.nodes && (r.nodes = []), r.nodes.push(t);
                }
            },
            chars: function(e) {
                var t = {
                    node: "text",
                    text: e,
                    textArray: s(e)
                };
                if (0 === o.length) t.index = g.toString(), g += 1, i.nodes.push(t); else {
                    var r = o[0];
                    void 0 === r.nodes && (r.nodes = []), t.index = r.index + "." + r.nodes.length, 
                    r.nodes.push(t);
                }
            },
            comment: function(e) {}
        }), i;
    },
    emojisInit: function() {
        var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : "", t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : "/wxParse/emojis/", r = arguments[2];
        n = e, o = t, i = r;
    }
};