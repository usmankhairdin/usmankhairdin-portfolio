import{r as u,u as A,j as n,L as z,d as S,T as $,e as P}from"./sanaira.js";/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=t=>t==null?void 0:t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function U(t,e,a=[]){if(e==null)throw new Error("[lucide]: iconNode is required when icon name is used");return{name:q(t),size:24,node:e,...a.length>0?{aliases:a}:{}}}/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=t=>{let e="",a=!1;for(const s of t){if(s==="-"||s==="_"||s<=" "){a=e.length>0;continue}e.length===0?e+=s.toLowerCase():e+=a?s.toUpperCase():s,a=!1}return e};/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=t=>{const e=G(t);return e.charAt(0).toUpperCase()+e.slice(1)};/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=(...t)=>t.filter((e,a,s)=>!!e&&e.trim()!==""&&s.indexOf(e)===a).join(" ").trim();/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function y(t){return t!=null}function V(t,e={}){var f,g;const a=e.attributeNames??{},s=r=>a[r]??r,i=t.size??t.width??m.width,c=t.size??t.height??m.height,l=((f=t.aliases)==null?void 0:f.filter(r=>typeof r=="string"&&r.trim()!=="").map(r=>`lucide-${r}`))??[],d=[...t.name?[`lucide-${t.name}`]:[],...l],o=((g=e.className)==null?void 0:g.split(" ").filter(Boolean))??[],h=e.includeDefaultClasses===!1?v(...o):v("lucide",...d,...o),N=e.absoluteStrokeWidth?Number(e.strokeWidth??m["stroke-width"])*Number(t.size??t.width??m.width)/Number(e.size??e.width??m.width):e.strokeWidth??m["stroke-width"];return["svg",{...Object.entries(m).reduce((r,[k,x])=>(r[s(k)]=x,r),{}),..."color"in e&&e.color&&{[s("stroke")]:e.color},..."size"in e&&y(e.size)&&{[s("width")]:e.size,[s("height")]:e.size},..."width"in e&&y(e.width)&&{[s("width")]:e.width},..."height"in e&&y(e.height)&&{[s("height")]:e.height},[s("stroke-width")]:N,...h&&{[s("class")]:h},[s("viewBox")]:`0 0 ${i} ${c}`,...e.hasA11yProp===!1?{[s("aria-hidden")]:"true"}:{},..."attributes"in e&&e.attributes},t.node.map(r=>{const[k,x,w]=r,j=e.nonScalingStroke?{[s("vector-effect")]:"non-scaling-stroke",...x}:x;return w?[k,j,w]:[k,j]})]}/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function Z(t,e={}){return V(t,{...e,attributeNames:{...e.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1},O=u.createContext({}),Q=()=>u.useContext(O),X=u.forwardRef(({color:t,size:e,width:a,height:s,strokeWidth:i,absoluteStrokeWidth:c,nonScalingStroke:l,className:d="",children:o,iconNode:h=[],icon:N={node:h,aliases:[],size:24},...p},f)=>{const{size:g=24,strokeWidth:r=2,absoluteStrokeWidth:k=!1,nonScalingStroke:x=!1,color:w="currentColor",className:j=""}=Q()??{},M=!!o||J(p),[B,I,H=[]]=Z(N,{color:t??w,width:a??e??g,height:s??e??g,strokeWidth:i??r,absoluteStrokeWidth:c??k,nonScalingStroke:l??x,className:v(j,d),hasA11yProp:M,attributes:p});return u.createElement(B,{ref:f,...I},[...H.map(([R,F])=>u.createElement(R,F)),...Array.isArray(o)?o:[o]])});/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function b(t,e=[],a=[]){const s=typeof t=="string"?U(t,e,a):t,i=u.forwardRef(({className:c,...l},d)=>u.createElement(X,{ref:d,icon:s,className:c,...l}));return s.name&&(i.displayName=K(s.name)),i}/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L={name:"arrow-right",size:24,node:[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]};L.node;const E=b(L);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T={name:"arrow-up-right",size:24,node:[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]]};T.node;const Y=b(T);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W={name:"chevron-down",size:24,node:[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]};W.node;const ne=b(W);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _={name:"moon",size:24,node:[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]]};_.node;const ee=b(_);/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D={name:"sun",size:24,node:[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]};D.node;const te=b(D);function ae({children:t,className:e="",as:a="p"}){const{asset:s}=A();return n.jsxs(a,{className:`section-label ${e}`,children:[n.jsxs("span",{className:"label-mark","aria-hidden":"true",children:[n.jsx("img",{className:"brand-mark brand-mark-light",src:s("images/brand/care-weave-mark-light.webp"),width:"36",height:"36",alt:""}),n.jsx("img",{className:"brand-mark brand-mark-dark",src:s("images/brand/care-weave-mark-dark.webp"),width:"36",height:"36",alt:""})]}),t]})}function ie({as:t="h2",lead:e,accent:a,breakLine:s=!1,id:i,className:c="",...l}){return n.jsxs(t,{id:i,className:`title ${c}`,...l,children:[e,a&&n.jsxs(n.Fragment,{children:[s?n.jsx("br",{}):" ",n.jsx("em",{children:a})]})]})}function C({children:t,icon:e=E}){return n.jsxs(n.Fragment,{children:[n.jsx("span",{children:t}),n.jsx("span",{className:"action-icon","aria-hidden":"true",children:n.jsx(e,{size:20})})]})}function oe({to:t,hash:e,href:a,children:s,className:i="",variant:c="",type:l="button",icon:d,...o}){const h=`action ${c} ${i}`.trim();return t?n.jsx(z,{to:t,hash:e,className:h,...o,children:n.jsx(C,{icon:d,children:s})}):a?n.jsx("a",{href:a,className:h,...o,children:n.jsx(C,{icon:d,children:s})}):n.jsx("button",{type:l,className:h,...o,children:n.jsx(C,{icon:d,children:s})})}function re({to:t,hash:e,href:a,children:s,external:i=!1,className:c="",...l}){const d=i?Y:E,o=n.jsxs(n.Fragment,{children:[n.jsx("span",{className:"text-action-label",children:s}),n.jsx("span",{className:"text-action-icon","aria-hidden":"true",children:n.jsx(d,{size:15})})]}),h=`text-action ${i?"text-action-up":""} ${c}`.trim();return t?n.jsx(z,{to:t,hash:e,className:h,...l,children:o}):n.jsx("a",{href:a,className:h,...l,children:o})}function ce({className:t=""}){const{asset:e}=A();return n.jsxs(z,{to:"home",className:`brand ${t}`,"aria-label":"Sanaira Health home",children:[n.jsxs("span",{className:"brand-symbol","aria-hidden":"true",children:[n.jsx("img",{className:"brand-mark brand-mark-light",src:e("images/brand/care-weave-mark-light.webp"),width:"96",height:"96",alt:""}),n.jsx("img",{className:"brand-mark brand-mark-dark",src:e("images/brand/care-weave-mark-dark.webp"),width:"96",height:"96",alt:""})]}),n.jsxs("span",{className:"brand-wordmark",children:["sanaira",n.jsx("small",{children:"HEALTH"})]})]})}function le({children:t="Illustrative",className:e=""}){return n.jsx("span",{className:`demo-tag ${e}`,children:t})}function de({className:t=""}){const[e,a]=u.useState("light");u.useEffect(()=>{a(S());const i=c=>a(c.detail.theme);return addEventListener($,i),()=>removeEventListener($,i)},[]);const s=e==="dark"?"light":"dark";return n.jsxs("button",{type:"button",className:`theme-toggle ${t}`,"aria-label":`Switch to ${s} theme`,title:`Switch to ${s} theme`,onClick:()=>P(S()==="dark"?"light":"dark"),children:[n.jsx(te,{className:"theme-icon theme-icon-light",size:18,"aria-hidden":"true"}),n.jsx(ee,{className:"theme-icon theme-icon-dark",size:18,"aria-hidden":"true"})]})}export{E as A,ce as B,ne as C,le as D,ae as S,re as T,oe as a,ie as b,b as c,de as d,Y as e};
