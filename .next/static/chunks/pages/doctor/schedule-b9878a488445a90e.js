(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[113],{5815:function(e,t,r){"use strict";let a,s;r.r(t),r.d(t,{default:function(){return eE}});var i,o=r(3299),n=r(1163),l=r(29),d=r(4687),c=r.n(d),u=r(7294),p=r(3907),m=r(1029),f=r(9897);let h={data:""},g=e=>"object"==typeof window?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||h,y=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,v=/\/\*[^]*?\*\/|  +/g,b=/\n+/g,x=(e,t)=>{let r="",a="",s="";for(let i in e){let o=e[i];"@"==i[0]?"i"==i[1]?r=i+" "+o+";":a+="f"==i[1]?x(o,i):i+"{"+x(o,"k"==i[1]?"":t)+"}":"object"==typeof o?a+=x(o,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=o&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=x.p?x.p(i,o):i+":"+o+";")}return r+(t&&s?t+"{"+s+"}":s)+a},w={},E=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+E(e[r]);return t}return e},k=(e,t,r,a,s)=>{var i;let o=E(e),n=w[o]||(w[o]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(o));if(!w[n]){let t=o!==e?e:(e=>{let t,r,a=[{}];for(;t=y.exec(e.replace(v,""));)t[4]?a.shift():t[3]?(r=t[3].replace(b," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(b," ").trim();return a[0]})(e);w[n]=x(s?{["@keyframes "+n]:t}:t,r?"":"."+n)}let l=r&&w.g?w.g:null;return r&&(w.g=w[n]),i=w[n],l?t.data=t.data.replace(l,i):-1===t.data.indexOf(i)&&(t.data=a?i+t.data:t.data+i),n},j=(e,t,r)=>e.reduce((e,a,s)=>{let i=t[s];if(i&&i.call){let e=i(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":x(e,""):!1===e?"":e}return e+a+(null==i?"":i)},"");function N(e){let t=this||{},r=e.call?e(t.p):e;return k(r.unshift?r.raw?j(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,g(t.target),t.g,t.o,t.k)}N.bind({g:1});let D,T,O,$=N.bind({k:1});function _(e,t){let r=this||{};return function(){let a=arguments;function s(i,o){let n=Object.assign({},i),l=n.className||s.className;r.p=Object.assign({theme:T&&T()},n),r.o=/ *go\d+/.test(l),n.className=N.apply(r,a)+(l?" "+l:""),t&&(n.ref=o);let d=e;return e[0]&&(d=n.as||e,delete n.as),O&&d[0]&&O(n),D(d,n)}return t?t(s):s}}var C=e=>"function"==typeof e,S=(e,t)=>C(e)?e(t):e,M=(a=0,()=>(++a).toString()),P=()=>{if(void 0===s&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");s=!e||e.matches}return s},A=(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,20)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return A(e,{type:e.toasts.find(e=>e.id===r.id)?1:0,toast:r});case 3:let{toastId:a}=t;return{...e,toasts:e.toasts.map(e=>e.id===a||void 0===a?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let s=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+s}))}}},z=[],I={toasts:[],pausedAt:void 0},F=e=>{I=A(I,e),z.forEach(e=>{e(I)})},L={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},Z=(e={})=>{let[t,r]=(0,u.useState)(I),a=(0,u.useRef)(I);(0,u.useEffect)(()=>(a.current!==I&&r(I),z.push(r),()=>{let e=z.indexOf(r);e>-1&&z.splice(e,1)}),[]);let s=t.toasts.map(t=>{var r,a,s;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(a=e[t.type])?void 0:a.duration)||(null==e?void 0:e.duration)||L[t.type],style:{...e.style,...null==(s=e[t.type])?void 0:s.style,...t.style}}});return{...t,toasts:s}},H=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||M()}),R=e=>(t,r)=>{let a=H(t,e,r);return F({type:2,toast:a}),a.id},G=(e,t)=>R("blank")(e,t);G.error=R("error"),G.success=R("success"),G.loading=R("loading"),G.custom=R("custom"),G.dismiss=e=>{F({type:3,toastId:e})},G.remove=e=>F({type:4,toastId:e}),G.promise=(e,t,r)=>{let a=G.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let s=t.success?S(t.success,e):void 0;return s?G.success(s,{id:a,...r,...null==r?void 0:r.success}):G.dismiss(a),e}).catch(e=>{let s=t.error?S(t.error,e):void 0;s?G.error(s,{id:a,...r,...null==r?void 0:r.error}):G.dismiss(a)}),e};var W=(e,t)=>{F({type:1,toast:{id:e,height:t}})},U=()=>{F({type:5,time:Date.now()})},X=new Map,Y=1e3,q=(e,t=Y)=>{if(X.has(e))return;let r=setTimeout(()=>{X.delete(e),F({type:4,toastId:e})},t);X.set(e,r)},B=e=>{let{toasts:t,pausedAt:r}=Z(e);(0,u.useEffect)(()=>{if(r)return;let e=Date.now(),a=t.map(t=>{if(t.duration===1/0)return;let r=(t.duration||0)+t.pauseDuration-(e-t.createdAt);if(r<0){t.visible&&G.dismiss(t.id);return}return setTimeout(()=>G.dismiss(t.id),r)});return()=>{a.forEach(e=>e&&clearTimeout(e))}},[t,r]);let a=(0,u.useCallback)(()=>{r&&F({type:6,time:Date.now()})},[r]),s=(0,u.useCallback)((e,r)=>{let{reverseOrder:a=!1,gutter:s=8,defaultPosition:i}=r||{},o=t.filter(t=>(t.position||i)===(e.position||i)&&t.height),n=o.findIndex(t=>t.id===e.id),l=o.filter((e,t)=>t<n&&e.visible).length;return o.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+s,0)},[t]);return(0,u.useEffect)(()=>{t.forEach(e=>{if(e.dismissed)q(e.id,e.removeDelay);else{let t=X.get(e.id);t&&(clearTimeout(t),X.delete(e.id))}})},[t]),{toasts:t,handlers:{updateHeight:W,startPause:U,endPause:a,calculateOffset:s}}},J=$`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,V=$`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,K=$`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,Q=_("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${J} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${V} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${K} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,ee=$`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,et=_("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${ee} 1s linear infinite;
`,er=$`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,ea=$`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,es=_("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${er} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${ea} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,ei=_("div")`
  position: absolute;
`,eo=_("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,en=$`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,el=_("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${en} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,ed=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return void 0!==t?"string"==typeof t?u.createElement(el,null,t):t:"blank"===r?null:u.createElement(eo,null,u.createElement(et,{...a}),"loading"!==r&&u.createElement(ei,null,"error"===r?u.createElement(Q,{...a}):u.createElement(es,{...a})))},ec=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,eu=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,ep=_("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,em=_("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,ef=(e,t)=>{let r=e.includes("top")?1:-1,[a,s]=P()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[ec(r),eu(r)];return{animation:t?`${$(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${$(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},eh=u.memo(({toast:e,position:t,style:r,children:a})=>{let s=e.height?ef(e.position||t||"top-center",e.visible):{opacity:0},i=u.createElement(ed,{toast:e}),o=u.createElement(em,{...e.ariaProps},S(e.message,e));return u.createElement(ep,{className:e.className,style:{...s,...r,...e.style}},"function"==typeof a?a({icon:i,message:o}):u.createElement(u.Fragment,null,i,o))});i=u.createElement,x.p=void 0,D=i,T=void 0,O=void 0;var eg=({id:e,className:t,style:r,onHeightUpdate:a,children:s})=>{let i=u.useCallback(t=>{if(t){let r=()=>{a(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return u.createElement("div",{ref:i,className:t,style:r},s)},ey=(e,t)=>{let r=e.includes("top"),a=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:P()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...r?{top:0}:{bottom:0},...a}},ev=N`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,eb=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:s,containerStyle:i,containerClassName:o})=>{let{toasts:n,handlers:l}=B(r);return u.createElement("div",{id:"_rht_toaster",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...i},className:o,onMouseEnter:l.startPause,onMouseLeave:l.endPause},n.map(r=>{let i=r.position||t,o=ey(i,l.calculateOffset(r,{reverseOrder:e,gutter:a,defaultPosition:t}));return u.createElement(eg,{id:r.id,key:r.id,onHeightUpdate:l.updateHeight,className:r.visible?ev:"",style:o},"custom"===r.type?S(r.message,r):s?s(r):u.createElement(eh,{toast:r,position:i}))}))},ex=r(5893);function ew(){var e,t,r,a=(0,o.useSession)().data,s=(0,u.useState)([]),i=s[0],n=s[1],d=(0,u.useState)(!0),h=d[0],g=d[1];(0,u.useEffect)(function(){y()},[]);var y=(e=(0,l.Z)(c().mark(function e(){var t;return c().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,fetch("/api/schedule");case 3:return t=e.sent,e.next=6,t.json();case 6:n(e.sent.schedules.map(function(e){return{id:e.id,start:new Date(e.startTime),end:new Date(e.endTime),title:"Available"}})),e.next=13;break;case 10:e.prev=10,e.t0=e.catch(0),G.error("Failed to fetch schedules");case 13:return e.prev=13,g(!1),e.finish(13);case 16:case"end":return e.stop()}},e,null,[[0,10,13,16]])})),function(){return e.apply(this,arguments)}),v=(t=(0,l.Z)(c().mark(function e(t){var r,s,i;return c().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return r="Available",s=t.view.calendar,e.prev=2,e.next=5,fetch("/api/schedule",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({startTime:t.start,endTime:t.end,doctorId:null==a||null===(i=a.user)||void 0===i?void 0:i.id})});case 5:e.sent.ok?(s.addEvent({id:String(Date.now()),title:r,start:t.start,end:t.end}),G.success("Time slot added successfully"),y()):G.error("Failed to add time slot"),e.next=12;break;case 9:e.prev=9,e.t0=e.catch(2),G.error("Error adding time slot");case 12:case"end":return e.stop()}},e,null,[[2,9]])})),function(e){return t.apply(this,arguments)}),b=(r=(0,l.Z)(c().mark(function e(t){return c().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(!confirm("Would you like to remove this time slot?")){e.next=11;break}return e.prev=1,e.next=4,fetch("/api/schedule/".concat(t.event.id),{method:"DELETE"});case 4:e.sent.ok?(t.event.remove(),G.success("Time slot removed successfully")):G.error("Failed to remove time slot"),e.next=11;break;case 8:e.prev=8,e.t0=e.catch(1),G.error("Error removing time slot");case 11:case"end":return e.stop()}},e,null,[[1,8]])})),function(e){return r.apply(this,arguments)});return h?(0,ex.jsx)("div",{className:"flex justify-center items-center h-64",children:"Loading..."}):(0,ex.jsxs)("div",{className:"p-4 bg-white rounded-lg shadow",children:[(0,ex.jsx)("h2",{className:"text-2xl font-bold mb-4",children:"Manage Schedule"}),(0,ex.jsx)("div",{className:"h-[600px]",children:(0,ex.jsx)(p.Z,{plugins:[m.Z,f.ZP],initialView:"timeGridWeek",selectable:!0,selectMirror:!0,dayMaxEvents:!0,weekends:!0,events:i,select:v,eventClick:b,slotMinTime:"08:00:00",slotMaxTime:"20:00:00",allDaySlot:!1,slotDuration:"00:30:00",headerToolbar:{left:"prev,next today",center:"title",right:"timeGridWeek,timeGridDay"}})})]})}function eE(){var e=(0,o.useSession)(),t=e.data,r=e.status,a=(0,n.useRouter)();return"loading"===r?(0,ex.jsx)("div",{children:"Loading..."}):t&&"DOCTOR"===t.user.role?(0,ex.jsxs)("div",{className:"container mx-auto px-4 py-8",children:[(0,ex.jsx)(eb,{position:"top-right"}),(0,ex.jsx)("h1",{className:"text-3xl font-bold mb-8",children:"Manage Your Schedule"}),(0,ex.jsx)("div",{className:"bg-white rounded-lg shadow",children:(0,ex.jsx)(ew,{})})]}):(a.push("/auth/signin"),null)}},1155:function(e,t,r){(window.__NEXT_P=window.__NEXT_P||[]).push(["/doctor/schedule",function(){return r(5815)}])},1163:function(e,t,r){e.exports=r(6488)}},function(e){e.O(0,[69,195,888,774,179],function(){return e(e.s=1155)}),_N_E=e.O()}]);