(self.webpackChunk_onlabsorg_olojs=self.webpackChunk_onlabsorg_olojs||[]).push([[757],{8:(a,t)=>{var e=0;t.log=async function(...a){const t=this.$Tuple(...a).normalize();return e++,console.log(`Log ${e}:`,t),`[[Log ${e}]]`};const n=t.inspect=async function(...a){const t=this,e=t.$Tuple(...a).normalize();if(e instanceof t.$Tuple)return{type:"Tuple",data:Array.from(await e.mapAsync((a=>n.call(t,a))))};if(e instanceof Error)return{type:"Error",data:e};const o=await t.type(e);switch(o){case"Undefined":return{type:o,data:Array.from(await e.args.mapAsync((a=>n.call(t,a))))};case"List":return{type:o,data:await Promise.all(e.map((a=>n.call(t,a))))};case"Namespace":return{type:o,data:await r(e,(a=>n.call(t,a)))};default:return{type:o,data:e}}};async function r(a,t){const e={};for(let n in a)e[n]=await t(a[n]);return e}}}]);