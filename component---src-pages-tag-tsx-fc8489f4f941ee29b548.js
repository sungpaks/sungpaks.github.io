(self.webpackChunkgatsby_starter_blog=self.webpackChunkgatsby_starter_blog||[]).push([[5],{9412:function(e,t,n){"use strict";n.d(t,{Z:function(){return l}});var a=n(7294),u=n(1883);var r=function(e){let{setCurTag:t}=e;const{0:n,1:r}=(0,a.useState)(0);return(0,a.useEffect)((()=>{document.addEventListener("scroll",(()=>{const e=document.documentElement.scrollTop,t=document.documentElement.scrollHeight-document.documentElement.clientHeight;r(100*e/t)}))})),a.createElement("div",null,a.createElement("div",{className:"top-ui"},a.createElement("h5",{className:"top-ui-title",style:{margin:0}},a.createElement(u.Link,{to:"/",onClick:()=>{t&&t("ALL")}},"👍 조성개발실록")),a.createElement("div",null,a.createElement("div",{className:"top-ui-tag",style:{margin:"0 20px 0 0"}},a.createElement(u.Link,{to:"/tag"},"Tag")),a.createElement("div",{className:"top-ui-tag"},a.createElement("a",{id:"light-or-dark",onClick:()=>{}},"?")))),a.createElement("div",{className:"progress-bar",style:{width:n+"%"}}))};var l=e=>{let{location:t,children:n,setCurTag:u}=e;const l="/"===(null==t?void 0:t.pathname);return a.createElement("div",null,a.createElement(r,{setCurTag:u}),a.createElement("div",{className:"global-wrapper","data-is-root-path":l},a.createElement("header",{className:"global-header"}),a.createElement("main",null,n),a.createElement("footer",null,"© ",(new Date).getFullYear(),", Built with"," ",a.createElement("a",{href:"https://www.gatsbyjs.com"},"Gatsby"))))}},4102:function(e,t,n){"use strict";n.r(t);var a=n(7294),u=n(9412),r=n(1883),l=n(5683),o=n.n(l);t.default=e=>{var t;let{data:n,location:l}=e;null===(t=n.site.siteMetadata)||void 0===t||t.title,n.allMarkdownRemark.nodes;return a.createElement(u.Z,{location:l,setCurTag:void 0},a.createElement("div",{style:{marginTop:"100px",marginBottom:"100px"}},a.createElement("h2",{style:{paddingBottom:"10px",paddingTop:"50px"}},"🏷️ All Tags",a.createElement("hr",null)),a.createElement("div",{className:"tag-button-container"},n.tags.group.map((e=>{const t={transform:"scale("+(1+(e.totalCount-1)/10)+")",marginRight:"calc(5px + "+5*e.totalCount+"px)",marginLeft:"calc(5px + "+5*e.totalCount+"px)"};return a.createElement(r.Link,{key:e.fieldValue,className:"custom-button tag-button",style:t,to:"/tag/"+o()(e.fieldValue)},e.fieldValue," (",e.totalCount,")")})))))}},5683:function(e,t,n){var a=1/0,u="[object Symbol]",r=/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g,l=/[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g,o="\\ud800-\\udfff",c="\\u2700-\\u27bf",i="a-z\\xdf-\\xf6\\xf8-\\xff",f="A-Z\\xc0-\\xd6\\xd8-\\xde",s="\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000",d="['’]",m="["+s+"]",g="[\\u0300-\\u036f\\ufe20-\\ufe23\\u20d0-\\u20f0]",x="\\d+",p="["+c+"]",E="["+i+"]",b="[^"+o+s+x+c+i+f+"]",v="(?:\\ud83c[\\udde6-\\uddff]){2}",h="[\\ud800-\\udbff][\\udc00-\\udfff]",y="["+f+"]",A="(?:"+E+"|"+b+")",C="(?:"+y+"|"+b+")",j="(?:['’](?:d|ll|m|re|s|t|ve))?",k="(?:['’](?:D|LL|M|RE|S|T|VE))?",L="(?:"+g+"|\\ud83c[\\udffb-\\udfff])"+"?",O="[\\ufe0e\\ufe0f]?",N=O+L+("(?:\\u200d(?:"+["[^"+o+"]",v,h].join("|")+")"+O+L+")*"),T="(?:"+[p,v,h].join("|")+")"+N,w=RegExp(d,"g"),Z=RegExp(g,"g"),I=RegExp([y+"?"+E+"+"+j+"(?="+[m,y,"$"].join("|")+")",C+"+"+k+"(?="+[m,y+A,"$"].join("|")+")",y+"?"+A+"+"+j,y+"+"+k,x,T].join("|"),"g"),S=/[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,U="object"==typeof n.g&&n.g&&n.g.Object===Object&&n.g,z="object"==typeof self&&self&&self.Object===Object&&self,R=U||z||Function("return this")();var D,G=(D={"À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","Ç":"C","ç":"c","Ð":"D","ð":"d","È":"E","É":"E","Ê":"E","Ë":"E","è":"e","é":"e","ê":"e","ë":"e","Ì":"I","Í":"I","Î":"I","Ï":"I","ì":"i","í":"i","î":"i","ï":"i","Ñ":"N","ñ":"n","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","Ù":"U","Ú":"U","Û":"U","Ü":"U","ù":"u","ú":"u","û":"u","ü":"u","Ý":"Y","ý":"y","ÿ":"y","Æ":"Ae","æ":"ae","Þ":"Th","þ":"th","ß":"ss","Ā":"A","Ă":"A","Ą":"A","ā":"a","ă":"a","ą":"a","Ć":"C","Ĉ":"C","Ċ":"C","Č":"C","ć":"c","ĉ":"c","ċ":"c","č":"c","Ď":"D","Đ":"D","ď":"d","đ":"d","Ē":"E","Ĕ":"E","Ė":"E","Ę":"E","Ě":"E","ē":"e","ĕ":"e","ė":"e","ę":"e","ě":"e","Ĝ":"G","Ğ":"G","Ġ":"G","Ģ":"G","ĝ":"g","ğ":"g","ġ":"g","ģ":"g","Ĥ":"H","Ħ":"H","ĥ":"h","ħ":"h","Ĩ":"I","Ī":"I","Ĭ":"I","Į":"I","İ":"I","ĩ":"i","ī":"i","ĭ":"i","į":"i","ı":"i","Ĵ":"J","ĵ":"j","Ķ":"K","ķ":"k","ĸ":"k","Ĺ":"L","Ļ":"L","Ľ":"L","Ŀ":"L","Ł":"L","ĺ":"l","ļ":"l","ľ":"l","ŀ":"l","ł":"l","Ń":"N","Ņ":"N","Ň":"N","Ŋ":"N","ń":"n","ņ":"n","ň":"n","ŋ":"n","Ō":"O","Ŏ":"O","Ő":"O","ō":"o","ŏ":"o","ő":"o","Ŕ":"R","Ŗ":"R","Ř":"R","ŕ":"r","ŗ":"r","ř":"r","Ś":"S","Ŝ":"S","Ş":"S","Š":"S","ś":"s","ŝ":"s","ş":"s","š":"s","Ţ":"T","Ť":"T","Ŧ":"T","ţ":"t","ť":"t","ŧ":"t","Ũ":"U","Ū":"U","Ŭ":"U","Ů":"U","Ű":"U","Ų":"U","ũ":"u","ū":"u","ŭ":"u","ů":"u","ű":"u","ų":"u","Ŵ":"W","ŵ":"w","Ŷ":"Y","ŷ":"y","Ÿ":"Y","Ź":"Z","Ż":"Z","Ž":"Z","ź":"z","ż":"z","ž":"z","Ĳ":"IJ","ĳ":"ij","Œ":"Oe","œ":"oe","ŉ":"'n","ſ":"ss"},function(e){return null==D?void 0:D[e]});var H=Object.prototype.toString,V=R.Symbol,Y=V?V.prototype:void 0,_=Y?Y.toString:void 0;function B(e){if("string"==typeof e)return e;if(function(e){return"symbol"==typeof e||function(e){return!!e&&"object"==typeof e}(e)&&H.call(e)==u}(e))return _?_.call(e):"";var t=e+"";return"0"==t&&1/e==-a?"-0":t}function M(e){return null==e?"":B(e)}var F,J=(F=function(e,t,n){return e+(n?"-":"")+t.toLowerCase()},function(e){return function(e,t,n,a){var u=-1,r=e?e.length:0;for(a&&r&&(n=e[++u]);++u<r;)n=t(n,e[u],u,e);return n}(function(e,t,n){return e=M(e),void 0===(t=n?void 0:t)?function(e){return S.test(e)}(e)?function(e){return e.match(I)||[]}(e):function(e){return e.match(r)||[]}(e):e.match(t)||[]}(function(e){return(e=M(e))&&e.replace(l,G).replace(Z,"")}(e).replace(w,"")),F,"")});e.exports=J}}]);
//# sourceMappingURL=component---src-pages-tag-tsx-fc8489f4f941ee29b548.js.map