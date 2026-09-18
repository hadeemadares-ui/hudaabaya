"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[797],{9981:function(e,t,r){r.d(t,{C:function(){return ty},D:function(){return o5},F:function(){return tg},I:function(){return nb},N:function(){return o7},Q:function(){return nx},S:function(){return o9},U:function(){return tq},V:function(){return oQ},Y:function(){return K},_:function(){return rQ},a:function(){return rJ},a5:function(){return oW},a6:function(){return tz},a7:function(){return eP},a8:function(){return ed},a9:function(){return td},aL:function(){return nS},aV:function(){return o3},aa:function(){return tB},ab:function(){return F},ac:function(){return J},ad:function(){return oX},ae:function(){return T},am:function(){return p},b:function(){return ew},c:function(){return tG},d:function(){return o2},e:function(){return tH},f:function(){return O},g:function(){return nq},h:function(){return tQ},i:function(){return tC},j:function(){return tK},k:function(){return tW},l:function(){return nP},m:function(){return oJ},n:function(){return nO},o:function(){return rF},p:function(){return nF},q:function(){return nM},s:function(){return X},t:function(){return P},u:function(){return o6},v:function(){return nI},x:function(){return o4}});var n,s,i,a,o=r(1480),u=r(9074),l=r(6552),c=r(3693),h=r(4575),d=r(7120),m=r(6300).Buffer;r(357);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let f="12.18.0";function p(e){f=e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let g=new c.Yd("@firebase/firestore");function y(){return g.logLevel}function w(e,...t){if(g.logLevel<=c.in.DEBUG){let r=t.map(E);g.debug(`Firestore (${f}): ${e}`,...r)}}function v(e,...t){if(g.logLevel<=c.in.ERROR){let r=t.map(E);g.error(`Firestore (${f}): ${e}`,...r)}}function _(e,...t){if(g.logLevel<=c.in.WARN){let r=t.map(E);g.warn(`Firestore (${f}): ${e}`,...r)}}function E(e){if("string"==typeof e)return e;try{return JSON.stringify(e)}catch(t){return e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function T(e,t,r){let n="Unexpected state";"string"==typeof t?n=t:r=t,x(e,n,r)}function x(e,t,r){let n=`FIRESTORE (${f}) INTERNAL ASSERTION FAILED: ${t} (ID: ${e.toString(16)})`;if(void 0!==r)try{n+=" CONTEXT: "+JSON.stringify(r)}catch(e){n+=" CONTEXT: "+r}throw v(n),Error(n)}function b(e,t,r,n){let s="Unexpected state";"string"==typeof r?s=r:n=r,e||x(t,s,n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N{static newId(){let e=62*Math.floor(256/62),t="";for(;t.length<20;){let r=/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e){let t="undefined"!=typeof self&&(self.crypto||self.msCrypto),r=new Uint8Array(40);if(t&&"function"==typeof t.getRandomValues)t.getRandomValues(r);else for(let e=0;e<40;e++)r[e]=Math.floor(256*Math.random());return r}(0);for(let n=0;n<r.length;++n)t.length<20&&r[n]<e&&(t+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(r[n]%62))}return t}}function S(e,t){return e<t?-1:e>t?1:0}function I(e,t){let r=Math.min(e.length,t.length);for(let n=0;n<r;n++){let r=e.charAt(n),s=t.charAt(n);if(r!==s)return C(r)===C(s)?S(r,s):C(r)?1:-1}return S(e.length,t.length)}function C(e){let t=e.charCodeAt(0);return t>=55296&&t<=57343}function V(e,t,r){return e.length===t.length&&e.every((e,n)=>r(e,t[n]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class A{constructor(e,t){this.comparator=e,this.root=t||k.EMPTY}insert(e,t){return new A(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,k.BLACK,null,null))}remove(e){return new A(this.comparator,this.root.remove(e,this.comparator).copy(null,null,k.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){let r=this.comparator(e,t.key);if(0===r)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){let n=this.comparator(e,r.key);if(0===n)return t+r.left.size;n<0?r=r.left:(t+=r.left.size+1,r=r.right)}return -1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){let e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new D(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new D(this.root,e,this.comparator,!1)}getReverseIterator(){return new D(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new D(this.root,e,this.comparator,!0)}}class D{constructor(e,t,r,n){this.isReverse=n,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?r(e.key,t):1,t&&n&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(0===s){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop(),t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(0===this.nodeStack.length)return null;let e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class k{constructor(e,t,r,n,s){this.key=e,this.value=t,this.color=null!=r?r:k.RED,this.left=null!=n?n:k.EMPTY,this.right=null!=s?s:k.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,n,s){return new k(null!=e?e:this.key,null!=t?t:this.value,null!=r?r:this.color,null!=n?n:this.left,null!=s?s:this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let n=this,s=r(e,n.key);return(n=s<0?n.copy(null,null,null,n.left.insert(e,t,r),null):0===s?n.copy(null,t,null,null,null):n.copy(null,null,null,null,n.right.insert(e,t,r))).fixUp()}removeMin(){if(this.left.isEmpty())return k.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),(e=e.copy(null,null,null,e.left.removeMin(),null)).fixUp()}remove(e,t){let r,n=this;if(0>t(e,n.key))n.left.isEmpty()||n.left.isRed()||n.left.left.isRed()||(n=n.moveRedLeft()),n=n.copy(null,null,null,n.left.remove(e,t),null);else{if(n.left.isRed()&&(n=n.rotateRight()),n.right.isEmpty()||n.right.isRed()||n.right.left.isRed()||(n=n.moveRedRight()),0===t(e,n.key)){if(n.right.isEmpty())return k.EMPTY;r=n.right.min(),n=n.copy(r.key,r.value,null,null,n.right.removeMin())}n=n.copy(null,null,null,null,n.right.remove(e,t))}return n.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=(e=(e=e.copy(null,null,null,null,e.right.rotateRight())).rotateLeft()).colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=(e=e.rotateRight()).colorFlip()),e}rotateLeft(){let e=this.copy(null,null,k.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){let e=this.copy(null,null,k.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){let e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){return Math.pow(2,this.check())<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw T(43730,{key:this.key,value:this.value});if(this.right.isRed())throw T(14113,{key:this.key,value:this.value});let e=this.left.check();if(e!==this.right.check())throw T(27949);return e+(this.isRed()?0:1)}}k.EMPTY=null,k.RED=!0,k.BLACK=!1,k.EMPTY=new class{constructor(){this.size=0}get key(){throw T(57766)}get value(){throw T(16141)}get color(){throw T(16727)}get left(){throw T(29726)}get right(){throw T(36894)}copy(e,t,r,n,s){return this}insert(e,t,r){return new k(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class L{constructor(e){this.comparator=e,this.data=new A(this.comparator)}has(e){return null!==this.data.get(e)}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){let r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){let n=r.getNext();if(this.comparator(n.key,e[1])>=0)return;t(n.key)}}forEachWhile(e,t){let r;for(r=void 0!==t?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){let t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new R(this.data.getIterator())}getIteratorFrom(e){return new R(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(e=>{t=t.add(e)}),t}isEqual(e){if(!(e instanceof L)||this.size!==e.size)return!1;let t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){let e=t.getNext().key,n=r.getNext().key;if(0!==this.comparator(e,n))return!1}return!0}toArray(){let e=[];return this.forEach(t=>{e.push(t)}),e}toString(){let e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){let t=new L(this.comparator);return t.data=e,t}}class R{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let P={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class O extends u.ZR{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let U="__name__";class M{constructor(e,t,r){void 0===t?t=0:t>e.length&&T(637,{offset:t,range:e.length}),void 0===r?r=e.length-t:r>e.length-t&&T(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return 0===M.comparator(this,e)}child(e){let t=this.segments.slice(this.offset,this.limit());return e instanceof M?e.forEach(e=>{t.push(e)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=void 0===e?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return 0===this.length}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){let r=Math.min(e.length,t.length);for(let n=0;n<r;n++){let r=M.compareSegments(e.get(n),t.get(n));if(0!==r)return r}return S(e.length,t.length)}static compareSegments(e,t){let r=M.isNumericId(e),n=M.isNumericId(t);return r&&!n?-1:!r&&n?1:r&&n?M.extractNumericId(e).compare(M.extractNumericId(t)):I(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return l.z8.fromString(e.substring(4,e.length-2))}}class F extends M{construct(e,t,r){return new F(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){let t=[];for(let r of e){if(r.indexOf("//")>=0)throw new O(P.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(e=>e.length>0))}return new F(t)}static emptyPath(){return new F([])}}let q=/^[_a-zA-Z][_a-zA-Z0-9]*$/,$=class e extends M{construct(t,r,n){return new e(t,r,n)}static isValidIdentifier(e){return q.test(e)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),e.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return 1===this.length&&this.get(0)===U}static keyField(){return new e([U])}static fromServerFormat(t){let r=[],n="",s=0,i=()=>{if(0===n.length)throw new O(P.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);r.push(n),n=""},a=!1;for(;s<t.length;){let e=t[s];if("\\"===e){if(s+1===t.length)throw new O(P.INVALID_ARGUMENT,"Path has trailing escape character: "+t);let e=t[s+1];if("\\"!==e&&"."!==e&&"`"!==e)throw new O(P.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);n+=e,s+=2}else"`"===e?a=!a:"."!==e||a?n+=e:i(),s++}if(i(),a)throw new O(P.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new e(r)}static emptyPath(){return new e([])}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B{constructor(e){this.fields=e,e.sort($.comparator)}static empty(){return new B([])}unionWith(e){let t=new L($.comparator);for(let e of this.fields)t=t.add(e);for(let r of e)t=t.add(r);return new B(t.toArray())}covers(e){for(let t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return V(this.fields,e.fields,(e,t)=>e.isEqual(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function z(e){let t=0;for(let r in e)Object.prototype.hasOwnProperty.call(e,r)&&t++;return t}function j(e,t){for(let r in e)Object.prototype.hasOwnProperty.call(e,r)&&t(r,e[r])}function G(e){for(let t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class K{constructor(e){this.path=e}static fromPath(e){return new K(F.fromString(e))}static fromName(e){return new K(F.fromString(e).popFirst(5))}static empty(){return new K(F.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return null!==e&&0===F.comparator(this.path,e.path)}toString(){return this.path.toString()}static comparator(e,t){return F.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new K(new F(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Q(e,t,r){if(!r)throw new O(P.INVALID_ARGUMENT,`Function ${e}() cannot be called with an empty ${t}.`)}function W(e){if(!K.isDocumentKey(e))throw new O(P.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${e} has ${e.length}.`)}function H(e){if(K.isDocumentKey(e))throw new O(P.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${e} has ${e.length}.`)}function Y(e){return"object"==typeof e&&null!==e&&(Object.getPrototypeOf(e)===Object.prototype||null===Object.getPrototypeOf(e))}function J(e){if(void 0===e)return"undefined";if(null===e)return"null";if("string"==typeof e)return e.length>20&&(e=`${e.substring(0,20)}...`),JSON.stringify(e);if("number"==typeof e||"boolean"==typeof e)return""+e;if("object"==typeof e){if(e instanceof Array)return"an array";{var t;let r=(t=e).constructor?t.constructor.name:null;return r?`a custom ${r} object`:"an object"}}return"function"==typeof e?"a function":T(12329,{type:typeof e})}function X(e,t){if("_delegate"in e&&(e=e._delegate),!(e instanceof t)){if(t.name===e.constructor.name)throw new O(P.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{let r=J(e);throw new O(P.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${r}`)}}return e}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Z(e,t){let r={typeString:e};return t&&(r.value=t),r}function ee(e,t){let r;if(!Y(e))throw new O(P.INVALID_ARGUMENT,"JSON must be an object");for(let n in t)if(t[n]){let s=t[n].typeString,i="value"in t[n]?{value:t[n].value}:void 0;if(!(n in e)){r=`JSON missing required field: '${n}'`;break}let a=e[n];if(s&&typeof a!==s){r=`JSON field '${n}' must be a ${s}.`;break}if(void 0!==i&&a!==i.value){r=`Expected '${n}' field to equal '${i.value}'`;break}}if(r)throw new O(P.INVALID_ARGUMENT,r);return!0}class et{static now(){return et.fromMillis(Date.now())}static fromDate(e){return et.fromMillis(e.getTime())}static fromMillis(e){let t=Math.floor(e/1e3);return new et(t,Math.floor((e-1e3*t)*1e6))}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0||t>=1e9)throw new O(P.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800||e>=253402300800)throw new O(P.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?S(this.nanoseconds,e.nanoseconds):S(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:et._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(ee(e,et._jsonSchema))return new et(e.seconds,e.nanoseconds)}valueOf(){return String(this.seconds- -62135596800).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}et._jsonSchemaVersion="firestore/timestamp/1.0",et._jsonSchema={type:Z("string",et._jsonSchemaVersion),seconds:Z("number"),nanoseconds:Z("number")};/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class er extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class en{constructor(e){this.binaryString=e}static fromBase64String(e){return new en(function(e){try{return atob(e)}catch(e){throw"undefined"!=typeof DOMException&&e instanceof DOMException?new er("Invalid base64 string: "+e):e}}(e))}static fromUint8Array(e){return new en(function(e){let t="";for(let r=0;r<e.length;++r)t+=String.fromCharCode(e[r]);return t}(e))}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return btoa(this.binaryString)}toUint8Array(){return function(e){let t=new Uint8Array(e.length);for(let r=0;r<e.length;r++)t[r]=e.charCodeAt(r);return t}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return S(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}en.EMPTY_BYTE_STRING=new en("");let es=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function ei(e){if(b(!!e,39018),"string"==typeof e){let t=0,r=es.exec(e);if(b(!!r,46558,{timestamp:e}),r[1]){let e=r[1];t=Number(e=(e+"000000000").substr(0,9))}return{seconds:Math.floor(new Date(e).getTime()/1e3),nanos:t}}return{seconds:ea(e.seconds),nanos:ea(e.nanos)}}function ea(e){return"number"==typeof e?e:"string"==typeof e?Number(e):0}function eo(e){return"string"==typeof e?en.fromBase64String(e):en.fromUint8Array(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let eu="server_timestamp",el="__type__",ec="__previous_value__",eh="__local_write_time__";function ed(e){return(e?.mapValue?.fields||{})[el]?.stringValue===eu}function em(e){let t=e.mapValue.fields[ec];return ed(t)?em(t):t}function ef(e){let t=ei(e.mapValue.fields[eh].timestampValue);return new et(t.seconds,t.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ep{constructor(e,t,r,n,s,i,a,o,u,l,c,h,d){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=n,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=a,this.longPollingOptions=o,this.useFetchStreams=u,this.isUsingEmulator=l,this.apiKey=c,this._customHeaders=h,this.grpcFlowControlWindow=d}}let eg="(default)";class ey{constructor(e,t){this.projectId=e,this.database=t||eg}static empty(){return new ey("","")}get isDefaultDatabase(){return this.database===eg}isEqual(e){return e instanceof ey&&e.projectId===this.projectId&&e.database===this.database}}function ew(e,t){if(!Object.prototype.hasOwnProperty.apply(e.options,["projectId"]))throw new O(P.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new ey(e.options.projectId,t)}function ev(e){return 0===e&&1/e==-1/0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let e_="__type__",eE="__max__",eT={mapValue:{fields:{__type__:{stringValue:eE}}}},ex="__vector__",eb="value",eN={nullValue:"NULL_VALUE"},eS={booleanValue:!0},eI={booleanValue:!1};function eC(e){return"nullValue"in e?0:"booleanValue"in e?1:"integerValue"in e||"doubleValue"in e?2:"timestampValue"in e?3:"stringValue"in e?5:"bytesValue"in e?6:"referenceValue"in e?7:"geoPointValue"in e?8:"arrayValue"in e?9:"mapValue"in e?ed(e)?4:eK(e)?9007199254740991:ez(e)?10:11:T(28295,{value:e})}function eV(e,t,r){if(e===t)return!0;let n=eC(e);if(n!==eC(t))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return e.booleanValue===t.booleanValue;case 4:return ef(e).isEqual(ef(t));case 3:return function(e,t){if("string"==typeof e.timestampValue&&"string"==typeof t.timestampValue&&e.timestampValue.length===t.timestampValue.length)return e.timestampValue===t.timestampValue;let r=ei(e.timestampValue),n=ei(t.timestampValue);return r.seconds===n.seconds&&r.nanos===n.nanos}(e,t);case 5:return e.stringValue===t.stringValue;case 6:return eo(e.bytesValue).isEqual(eo(t.bytesValue));case 7:return e.referenceValue===t.referenceValue;case 8:return ea(e.geoPointValue.latitude)===ea(t.geoPointValue.latitude)&&ea(e.geoPointValue.longitude)===ea(t.geoPointValue.longitude);case 2:return function(e,t,r){let n,s;if("integerValue"in e&&"integerValue"in t)return ea(e.integerValue)===ea(t.integerValue);if("doubleValue"in e&&"doubleValue"in t)n=ea(e.doubleValue),s=ea(t.doubleValue);else{if(!r?.t)return!1;n=ea(e.integerValue??e.doubleValue),s=ea(t.integerValue??t.doubleValue)}return n===s?!!r?.i||ev(n)===ev(s):!!(void 0===r||r.o)&&isNaN(n)&&isNaN(s)}(e,t,r);case 9:return V(e.arrayValue.values||[],t.arrayValue.values||[],(e,t)=>eV(e,t,r));case 10:case 11:return function(e,t,r){let n=e.mapValue.fields||{},s=t.mapValue.fields||{};if(z(n)!==z(s))return!1;for(let e in n)if(n.hasOwnProperty(e)&&(void 0===s[e]||!eV(n[e],s[e],r)))return!1;return!0}(e,t,r);default:return T(52216,{left:e})}}function eA(e,t){return void 0!==(e.values||[]).find(e=>eV(e,t))}function eD(e,t){if(e===t)return 0;let r=eC(e),n=eC(t);if(r!==n)return S(r,n);switch(r){case 0:case 9007199254740991:return 0;case 1:return S(e.booleanValue,t.booleanValue);case 2:return function(e,t){let r=ea(e.integerValue||e.doubleValue),n=ea(t.integerValue||t.doubleValue);return r<n?-1:r>n?1:r===n?0:isNaN(r)?isNaN(n)?0:-1:1}(e,t);case 3:return ek(e.timestampValue,t.timestampValue);case 4:return ek(ef(e),ef(t));case 5:return I(e.stringValue,t.stringValue);case 6:return function(e,t){let r=eo(e),n=eo(t);return r.compareTo(n)}(e.bytesValue,t.bytesValue);case 7:return function(e,t){let r=e.split("/"),n=t.split("/");for(let e=0;e<r.length&&e<n.length;e++){let t=S(r[e],n[e]);if(0!==t)return t}return S(r.length,n.length)}(e.referenceValue,t.referenceValue);case 8:return function(e,t){let r=S(ea(e.latitude),ea(t.latitude));return 0!==r?r:S(ea(e.longitude),ea(t.longitude))}(e.geoPointValue,t.geoPointValue);case 9:return eL(e.arrayValue,t.arrayValue);case 10:return function(e,t){let r=e.fields||{},n=t.fields||{},s=r[eb]?.arrayValue,i=n[eb]?.arrayValue,a=S(s?.values?.length||0,i?.values?.length||0);return 0!==a?a:eL(s,i)}(e.mapValue,t.mapValue);case 11:return function(e,t){if(e===eT.mapValue&&t===eT.mapValue)return 0;if(e===eT.mapValue)return 1;if(t===eT.mapValue)return -1;let r=e.fields||{},n=Object.keys(r),s=t.fields||{},i=Object.keys(s);n.sort(),i.sort();for(let e=0;e<n.length&&e<i.length;++e){let t=I(n[e],i[e]);if(0!==t)return t;let a=eD(r[n[e]],s[i[e]]);if(0!==a)return a}return S(n.length,i.length)}(e.mapValue,t.mapValue);default:throw T(23264,{u:r})}}function ek(e,t){if("string"==typeof e&&"string"==typeof t&&e.length===t.length)return S(e,t);let r=ei(e),n=ei(t),s=S(r.seconds,n.seconds);return 0!==s?s:S(r.nanos,n.nanos)}function eL(e,t){let r=e.values||[],n=t.values||[];for(let e=0;e<r.length&&e<n.length;++e){let t=eD(r[e],n[e]);if(void 0!==t&&0!==t)return t}return S(r.length,n.length)}function eR(e){var t,r;return"nullValue"in e?"null":"booleanValue"in e?""+e.booleanValue:"integerValue"in e?""+e.integerValue:"doubleValue"in e?""+e.doubleValue:"timestampValue"in e?function(e){let t=ei(e);return`time(${t.seconds},${t.nanos})`}(e.timestampValue):"stringValue"in e?e.stringValue:"bytesValue"in e?eo(e.bytesValue).toBase64():"referenceValue"in e?(t=e.referenceValue,K.fromName(t).toString()):"geoPointValue"in e?(r=e.geoPointValue,`geo(${r.latitude},${r.longitude})`):"arrayValue"in e?function(e){let t="[",r=!0;for(let n of e.values||[])r?r=!1:t+=",",t+=eR(n);return t+"]"}(e.arrayValue):"mapValue"in e?function(e){let t=Object.keys(e.fields||{}).sort(),r="{",n=!0;for(let s of t)n?n=!1:r+=",",r+=`${s}:${eR(e.fields[s])}`;return r+"}"}(e.mapValue):T(61005,{value:e})}function eP(e,t){return{referenceValue:`projects/${e.projectId}/databases/${e.database}/documents/${t.path.canonicalString()}`}}function eO(e){return!!e&&"integerValue"in e}function eU(e){return!!e&&"doubleValue"in e}function eM(e){return eO(e)||eU(e)}function eF(e){return!!e&&"arrayValue"in e}function eq(e){return!!e&&"nullValue"in e}function e$(e){return!!e&&"doubleValue"in e&&isNaN(Number(e.doubleValue))}function eB(e){return!!e&&"mapValue"in e}function ez(e){return(e?.mapValue?.fields||{})[e_]?.stringValue===ex}function ej(e){return(e?.mapValue?.fields||{})[eb]?.arrayValue}function eG(e){if(e.geoPointValue)return{geoPointValue:{...e.geoPointValue}};if(e.timestampValue&&"object"==typeof e.timestampValue)return{timestampValue:{...e.timestampValue}};if(e.mapValue){let t={mapValue:{fields:{}}};return j(e.mapValue.fields,(e,r)=>t.mapValue.fields[e]=eG(r)),t}if(e.arrayValue){let t={arrayValue:{values:[]}};for(let r=0;r<(e.arrayValue.values||[]).length;++r)t.arrayValue.values[r]=eG(e.arrayValue.values[r]);return t}return{...e}}function eK(e){return(((e.mapValue||{}).fields||{}).__type__||{}).stringValue===eE}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eQ{constructor(e){this.value=e}static empty(){return new eQ({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(!eB(t=(t.mapValue.fields||{})[e.get(r)]))return null;return(t=(t.mapValue.fields||{})[e.lastSegment()])||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=eG(t)}setAll(e){let t=$.emptyPath(),r={},n=[];e.forEach((e,s)=>{if(!t.isImmediateParentOf(s)){let e=this.getFieldsMap(t);this.applyChanges(e,r,n),r={},n=[],t=s.popLast()}e?r[s.lastSegment()]=eG(e):n.push(s.lastSegment())});let s=this.getFieldsMap(t);this.applyChanges(s,r,n)}delete(e){let t=this.field(e.popLast());eB(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return eV(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let n=t.mapValue.fields[e.get(r)];eB(n)&&n.mapValue.fields||(n={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=n),t=n}return t.mapValue.fields}applyChanges(e,t,r){for(let n of(j(t,(t,r)=>e[t]=r),r))delete e[n]}clone(){return new eQ(eG(this.value))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eW(e,t){if(e.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:ev(t)?"-0":t}}function eH(e){return{integerValue:""+e}}function eY(e,t,r){return"number"==typeof t&&Number.isInteger(t)&&!ev(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER?eH(t):eW(e,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eJ{constructor(){this._=void 0}}class eX extends eJ{}class eZ extends eJ{constructor(e){super(),this.elements=e}}function e0(e,t){let r=e7(t);for(let t of e.elements)r.some(e=>eV(e,t))||r.push(t);return{arrayValue:{values:r}}}class e1 extends eJ{constructor(e){super(),this.elements=e}}function e2(e,t){let r=e7(t);for(let t of e.elements)r=r.filter(e=>!eV(e,t));return{arrayValue:{values:r}}}class e3 extends eJ{constructor(e,t){super(),this.serializer=e,this.l=t}}class e4 extends e3{}class e6 extends e3{}class e9 extends e3{}function e5(e,t,r){if(!eM(t))return e.l;let n=r(e8(t),e8(e.l));return eO(t)&&eO(e.l)?eH(n):eW(e.serializer,n)}function e8(e){return ea(e.integerValue||e.doubleValue)}function e7(e){return eF(e)&&e.arrayValue.values?e.arrayValue.values.slice():[]}class te{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new te}static exists(e){return new te(void 0,e)}static updateTime(e){return new te(e)}get isNone(){return void 0===this.updateTime&&void 0===this.exists}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function tt(e,t){return void 0!==e.updateTime?t.isFoundDocument()&&t.version.isEqual(e.updateTime):void 0===e.exists||e.exists===t.isFoundDocument()}class tr{}function tn(e,t){if(!e.hasLocalMutations||t&&0===t.fields.length)return null;if(null===t)return e.isNoDocument()?new th(e.key,te.none()):new ta(e.key,e.data,te.none());{let r=e.data,n=eQ.empty(),s=new L($.comparator);for(let e of t.fields)if(!s.has(e)){let t=r.field(e);null===t&&e.length>1&&(e=e.popLast(),t=r.field(e)),null===t?n.delete(e):n.set(e,t),s=s.add(e)}return new to(e.key,n,new B(s.toArray()),te.none())}}function ts(e,t,r,n){return e instanceof ta?function(e,t,r,n){if(!tt(e.precondition,t))return r;let s=e.value.clone(),i=tc(e.fieldTransforms,n,t);return s.setAll(i),t.convertToFoundDocument(t.version,s).setHasLocalMutations(),null}(e,t,r,n):e instanceof to?function(e,t,r,n){if(!tt(e.precondition,t))return r;let s=tc(e.fieldTransforms,n,t),i=t.data;return(i.setAll(tu(e)),i.setAll(s),t.convertToFoundDocument(t.version,i).setHasLocalMutations(),null===r)?null:r.unionWith(e.fieldMask.fields).unionWith(e.fieldTransforms.map(e=>e.field))}(e,t,r,n):tt(e.precondition,t)?(t.convertToNoDocument(t.version).setHasLocalMutations(),null):r}function ti(e,t){var r,n;return e.type===t.type&&!!e.key.isEqual(t.key)&&!!e.precondition.isEqual(t.precondition)&&(r=e.fieldTransforms,n=t.fieldTransforms,!!(void 0===r&&void 0===n||!(!r||!n)&&V(r,n,(e,t)=>{var r,n;return e.field.isEqual(t.field)&&(r=e.transform,n=t.transform,r instanceof eZ&&n instanceof eZ||r instanceof e1&&n instanceof e1?V(r.elements,n.elements,eV):r instanceof e4&&n instanceof e4||r instanceof e6&&n instanceof e6||r instanceof e9&&n instanceof e9?eV(r.l,n.l):r instanceof eX&&n instanceof eX)})))&&(0===e.type?e.value.isEqual(t.value):1!==e.type||e.data.isEqual(t.data)&&e.fieldMask.isEqual(t.fieldMask))}class ta extends tr{constructor(e,t,r,n=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=n,this.type=0}getFieldMask(){return null}}class to extends tr{constructor(e,t,r,n,s=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=n,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function tu(e){let t=new Map;return e.fieldMask.fields.forEach(r=>{if(!r.isEmpty()){let n=e.data.field(r);t.set(r,n)}}),t}function tl(e,t,r){let n=new Map;b(e.length===r.length,32656,{h:r.length,T:e.length});for(let i=0;i<r.length;i++){var s;let a=e[i],o=a.transform,u=t.data.field(a.field);n.set(a.field,(s=r[i],o instanceof eZ?e0(o,u):o instanceof e1?e2(o,u):s))}return n}function tc(e,t,r){let n=new Map;for(let s of e){let e=s.transform,i=r.data.field(s.field);n.set(s.field,e instanceof eX?function(e,t){let r={fields:{[el]:{stringValue:eu},[eh]:{timestampValue:{seconds:e.seconds,nanos:e.nanoseconds}}}};return t&&ed(t)&&(t=em(t)),t&&(r.fields[ec]=t),{mapValue:r}}(t,i):e instanceof eZ?e0(e,i):e instanceof e1?e2(e,i):e instanceof e4?function(e,t){let r=e instanceof e4?eM(t)?t:{integerValue:0}:null,n=e8(r)+e8(e.l);return eO(r)&&eO(e.l)?eH(n):eW(e.serializer,n)}(e,i):e instanceof e6?e5(e,i,Math.min):e instanceof e9?e5(e,i,Math.max):void 0)}return n}class th extends tr{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class td{constructor(e,t){this.position=e,this.inclusive=t}}function tm(e,t,r){let n=0;for(let s=0;s<e.position.length;s++){let i=t[s],a=e.position[s];if(n=i.field.isKeyField()?K.comparator(K.fromName(a.referenceValue),r.key):eD(a,r.data.field(i.field)),"desc"===i.dir&&(n*=-1),0!==n)break}return n}function tf(e,t){if(null===e)return null===t;if(null===t||e.inclusive!==t.inclusive||e.position.length!==t.position.length)return!1;for(let r=0;r<e.position.length;r++)if(!eV(e.position[r],t.position[r]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tp{}class tg extends tp{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?"in"===t||"not-in"===t?this.createKeyFieldInFilter(e,t,r):new t_(e,t,r):"array-contains"===t?new tb(e,r):"in"===t?new tN(e,r):"not-in"===t?new tS(e,r):"array-contains-any"===t?new tI(e,r):new tg(e,t,r)}static createKeyFieldInFilter(e,t,r){return"in"===t?new tE(e,r):new tT(e,r)}matches(e){let t=e.data.field(this.field);return"!="===this.op?null!==t&&void 0===t.nullValue&&this.matchesComparison(eD(t,this.value)):null!==t&&eC(this.value)===eC(t)&&this.matchesComparison(eD(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return 0===e;case"!=":return 0!==e;case">":return e>0;case">=":return e>=0;default:return T(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class ty extends tp{constructor(e,t){super(),this.filters=e,this.op=t,this.P=null}static create(e,t){return new ty(e,t)}matches(e){return tw(this)?void 0===this.filters.find(t=>!t.matches(e)):void 0!==this.filters.find(t=>t.matches(e))}getFlattenedFilters(){return null!==this.P||(this.P=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.P}getFilters(){return Object.assign([],this.filters)}}function tw(e){return"and"===e.op}function tv(e){for(let t of e.filters)if(t instanceof ty)return!1;return!0}class t_ extends tg{constructor(e,t,r){super(e,t,r),this.key=K.fromName(r.referenceValue)}matches(e){let t=K.comparator(e.key,this.key);return this.matchesComparison(t)}}class tE extends tg{constructor(e,t){super(e,"in",t),this.keys=tx("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class tT extends tg{constructor(e,t){super(e,"not-in",t),this.keys=tx("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function tx(e,t){return(t.arrayValue?.values||[]).map(e=>K.fromName(e.referenceValue))}class tb extends tg{constructor(e,t){super(e,"array-contains",t)}matches(e){let t=e.data.field(this.field);return eF(t)&&eA(t.arrayValue,this.value)}}class tN extends tg{constructor(e,t){super(e,"in",t)}matches(e){let t=e.data.field(this.field);return null!==t&&eA(this.value.arrayValue,t)}}class tS extends tg{constructor(e,t){super(e,"not-in",t)}matches(e){if(eA(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;let t=e.data.field(this.field);return null!==t&&void 0===t.nullValue&&!eA(this.value.arrayValue,t)}}class tI extends tg{constructor(e,t){super(e,"array-contains-any",t)}matches(e){let t=e.data.field(this.field);return!(!eF(t)||!t.arrayValue.values)&&t.arrayValue.values.some(e=>eA(this.value.arrayValue,e))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tC{constructor(e,t="asc"){this.field=e,this.dir=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tV{static fromTimestamp(e){return new tV(e)}static min(){return new tV(new et(0,0))}static max(){return new tV(new et(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tA{constructor(e,t,r,n,s,i,a){this.key=e,this.documentType=t,this.version=r,this.readTime=n,this.createTime=s,this.data=i,this.documentState=a}static newInvalidDocument(e){return new tA(e,0,tV.min(),tV.min(),tV.min(),eQ.empty(),0)}static newFoundDocument(e,t,r,n){return new tA(e,1,t,tV.min(),r,n,0)}static newNoDocument(e,t){return new tA(e,2,t,tV.min(),tV.min(),eQ.empty(),0)}static newUnknownDocument(e,t){return new tA(e,3,t,tV.min(),tV.min(),eQ.empty(),2)}convertToFoundDocument(e,t){return this.createTime.isEqual(tV.min())&&(2===this.documentType||0===this.documentType)&&(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=eQ.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=eQ.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=tV.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return 1===this.documentState}get hasCommittedMutations(){return 2===this.documentState}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return 0!==this.documentType}isFoundDocument(){return 1===this.documentType}isNoDocument(){return 2===this.documentType}isUnknownDocument(){return 3===this.documentType}isEqual(e){return e instanceof tA&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new tA(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}class tD{constructor(e,t,r,n){this.indexId=e,this.collectionGroup=t,this.fields=r,this.indexState=n}}tD.UNKNOWN_ID=-1;class tk{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new tk(tV.min(),K.empty(),-1)}static max(){return new tk(tV.max(),K.empty(),-1)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tL{constructor(e,t=null,r=[],n=[],s=null,i=null,a=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=n,this.limit=s,this.startAt=i,this.endAt=a,this.R=null}}function tR(e,t=null,r=[],n=[],s=null,i=null,a=null){return new tL(e,t,r,n,s,i,a)}function tP(e){if(null===e.R){let t=e.path.canonicalString();null!==e.collectionGroup&&(t+="|cg:"+e.collectionGroup),t+="|f:"+e.filters.map(e=>(function e(t){if(t instanceof tg)return t.field.canonicalString()+t.op.toString()+eR(t.value);if(tv(t)&&tw(t))return t.filters.map(t=>e(t)).join(",");{let r=t.filters.map(t=>e(t)).join(",");return`${t.op}(${r})`}})(e)).join(",")+"|ob:"+e.orderBy.map(e=>e.field.canonicalString()+e.dir).join(","),null==e.limit||(t+="|l:"+e.limit),e.startAt&&(t+="|lb:"+(e.startAt.inclusive?"b:":"a:")+e.startAt.position.map(e=>eR(e)).join(",")),e.endAt&&(t+="|ub:"+(e.endAt.inclusive?"a:":"b:")+e.endAt.position.map(e=>eR(e)).join(",")),e.R=t}return e.R}function tO(e,t){if(e.limit!==t.limit||e.orderBy.length!==t.orderBy.length)return!1;for(let s=0;s<e.orderBy.length;s++){var r,n;if(r=e.orderBy[s],n=t.orderBy[s],!(r.dir===n.dir&&r.field.isEqual(n.field)))return!1}if(e.filters.length!==t.filters.length)return!1;for(let r=0;r<e.filters.length;r++)if(!function e(t,r){return t instanceof tg?r instanceof tg&&t.op===r.op&&t.field.isEqual(r.field)&&eV(t.value,r.value):t instanceof ty?r instanceof ty&&t.op===r.op&&t.filters.length===r.filters.length&&t.filters.reduce((t,n,s)=>t&&e(n,r.filters[s]),!0):void T(19439)}(e.filters[r],t.filters[r]))return!1;return e.collectionGroup===t.collectionGroup&&!!e.path.isEqual(t.path)&&!!tf(e.startAt,t.startAt)&&tf(e.endAt,t.endAt)}function tU(e){return!!e.isCorePipeline}function tM(e){return!!e.path&&K.isDocumentKey(e.path)&&null===e.collectionGroup&&0===e.filters.length}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tF{constructor(e,t=null,r=[],n=[],s=null,i="F",a=null,o=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=n,this.limit=s,this.limitType=i,this.startAt=a,this.endAt=o,this.I=null,this.A=null,this.V=null,this.startAt,this.endAt}}function tq(e){return new tF(e)}function t$(e){return 0===e.filters.length&&null===e.limit&&null==e.startAt&&null==e.endAt&&(0===e.explicitOrderBy.length||1===e.explicitOrderBy.length&&e.explicitOrderBy[0].field.isKeyField())}function tB(e){return null!==e.collectionGroup}function tz(e){if(null===e.I){let t;e.I=[];let r=new Set;for(let t of e.explicitOrderBy)e.I.push(t),r.add(t.field.canonicalString());let n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(t=new L($.comparator),e.filters.forEach(e=>{e.getFlattenedFilters().forEach(e=>{e.isInequality()&&(t=t.add(e.field))})}),t).forEach(t=>{r.has(t.canonicalString())||t.isKeyField()||e.I.push(new tC(t,n))}),r.has($.keyField().canonicalString())||e.I.push(new tC($.keyField(),n))}return e.I}function tj(e){return e.A||(e.A=function(e,t){if("F"===e.limitType)return tR(e.path,e.collectionGroup,t,e.filters,e.limit,e.startAt,e.endAt);{t=t.map(e=>{let t="desc"===e.dir?"asc":"desc";return new tC(e.field,t)});let r=e.endAt?new td(e.endAt.position,e.endAt.inclusive):null,n=e.startAt?new td(e.startAt.position,e.startAt.inclusive):null;return tR(e.path,e.collectionGroup,t,e.filters,e.limit,r,n)}}(e,tz(e))),e.A}function tG(e,t){let r=e.filters.concat([t]);return new tF(e.path,e.collectionGroup,e.explicitOrderBy.slice(),r,e.limit,e.limitType,e.startAt,e.endAt)}function tK(e,t){let r=e.explicitOrderBy.concat([t]);return new tF(e.path,e.collectionGroup,r,e.filters.slice(),e.limit,e.limitType,e.startAt,e.endAt)}function tQ(e,t,r){return new tF(e.path,e.collectionGroup,e.explicitOrderBy.slice(),e.filters.slice(),t,r,e.startAt,e.endAt)}function tW(e,t){return new tF(e.path,e.collectionGroup,e.explicitOrderBy.slice(),e.filters.slice(),e.limit,e.limitType,t,e.endAt)}function tH(e,t){return new tF(e.path,e.collectionGroup,e.explicitOrderBy.slice(),e.filters.slice(),e.limit,e.limitType,e.startAt,t)}function tY(e){var t;let r;return`Query(target=${r=(t=tj(e)).path.canonicalString(),null!==t.collectionGroup&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(e=>(function e(t){return t instanceof tg?`${t.field.canonicalString()} ${t.op} ${eR(t.value)}`:t instanceof ty?t.op.toString()+" {"+t.getFilters().map(e).join(" ,")+"}":"Filter"})(e)).join(", ")}]`),null==t.limit||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(e=>`${e.field.canonicalString()} (${e.dir})`).join(", ")}]`),t.startAt&&(r+=", startAt: "+(t.startAt.inclusive?"b:":"a:")+t.startAt.position.map(e=>eR(e)).join(",")),t.endAt&&(r+=", endAt: "+(t.endAt.inclusive?"a:":"b:")+t.endAt.position.map(e=>eR(e)).join(",")),`Target(${r})`}; limitType=${e.limitType})`}function tJ(e,t){return t.isFoundDocument()&&function(e,t){let r=t.key.path;return null!==e.collectionGroup?t.key.hasCollectionId(e.collectionGroup)&&e.path.isPrefixOf(r):K.isDocumentKey(e.path)?e.path.isEqual(r):e.path.isImmediateParentOf(r)}(e,t)&&function(e,t){for(let r of tz(e))if(!r.field.isKeyField()&&null===t.data.field(r.field))return!1;return!0}(e,t)&&function(e,t){for(let r of e.filters)if(!r.matches(t))return!1;return!0}(e,t)&&(!e.startAt||!!function(e,t,r){let n=tm(e,t,r);return e.inclusive?n<=0:n<0}(e.startAt,tz(e),t))&&(!e.endAt||!!function(e,t,r){let n=tm(e,t,r);return e.inclusive?n>=0:n>0}(e.endAt,tz(e),t))}function tX(e){return(t,r)=>{let n=!1;for(let s of tz(e)){let e=function(e,t,r){let n=e.field.isKeyField()?K.comparator(t.key,r.key):function(e,t,r){let n=t.data.field(e),s=r.data.field(e);return null!==n&&null!==s?eD(n,s):T(42886)}(e.field,t,r);switch(e.dir){case"asc":return n;case"desc":return -1*n;default:return T(19790,{direction:e.dir})}}(s,t,r);if(0!==e)return e;n=n||s.field.isKeyField()}return 0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tZ{constructor(e,t){this.count=e,this.unchangedNames=t}}function t0(e){if(void 0===e)return v("GRPC error has no .code"),P.UNKNOWN;switch(e){case s.OK:return P.OK;case s.CANCELLED:return P.CANCELLED;case s.UNKNOWN:return P.UNKNOWN;case s.DEADLINE_EXCEEDED:return P.DEADLINE_EXCEEDED;case s.RESOURCE_EXHAUSTED:return P.RESOURCE_EXHAUSTED;case s.INTERNAL:return P.INTERNAL;case s.UNAVAILABLE:return P.UNAVAILABLE;case s.UNAUTHENTICATED:return P.UNAUTHENTICATED;case s.INVALID_ARGUMENT:return P.INVALID_ARGUMENT;case s.NOT_FOUND:return P.NOT_FOUND;case s.ALREADY_EXISTS:return P.ALREADY_EXISTS;case s.PERMISSION_DENIED:return P.PERMISSION_DENIED;case s.FAILED_PRECONDITION:return P.FAILED_PRECONDITION;case s.ABORTED:return P.ABORTED;case s.OUT_OF_RANGE:return P.OUT_OF_RANGE;case s.UNIMPLEMENTED:return P.UNIMPLEMENTED;case s.DATA_LOSS:return P.DATA_LOSS;default:return T(39323,{code:e})}}(i=s||(s={}))[i.OK=0]="OK",i[i.CANCELLED=1]="CANCELLED",i[i.UNKNOWN=2]="UNKNOWN",i[i.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",i[i.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",i[i.NOT_FOUND=5]="NOT_FOUND",i[i.ALREADY_EXISTS=6]="ALREADY_EXISTS",i[i.PERMISSION_DENIED=7]="PERMISSION_DENIED",i[i.UNAUTHENTICATED=16]="UNAUTHENTICATED",i[i.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",i[i.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",i[i.ABORTED=10]="ABORTED",i[i.OUT_OF_RANGE=11]="OUT_OF_RANGE",i[i.UNIMPLEMENTED=12]="UNIMPLEMENTED",i[i.INTERNAL=13]="INTERNAL",i[i.UNAVAILABLE=14]="UNAVAILABLE",i[i.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class t1{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){let t=this.mapKeyFn(e),r=this.inner[t];if(void 0!==r){for(let[t,n]of r)if(this.equalsFn(t,e))return n}}has(e){return void 0!==this.get(e)}set(e,t){let r=this.mapKeyFn(e),n=this.inner[r];if(void 0===n)return this.inner[r]=[[e,t]],void this.innerSize++;for(let r=0;r<n.length;r++)if(this.equalsFn(n[r][0],e))return void(n[r]=[e,t]);n.push([e,t]),this.innerSize++}delete(e){let t=this.mapKeyFn(e),r=this.inner[t];if(void 0===r)return!1;for(let n=0;n<r.length;n++)if(this.equalsFn(r[n][0],e))return 1===r.length?delete this.inner[t]:r.splice(n,1),this.innerSize--,!0;return!1}forEach(e){j(this.inner,(t,r)=>{for(let[t,n]of r)e(t,n)})}isEmpty(){return G(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let t2=new A(K.comparator),t3=new A(K.comparator);function t4(...e){let t=t3;for(let r of e)t=t.insert(r.key,r);return t}function t6(){return new t1(e=>e.toString(),(e,t)=>e.isEqual(t))}new A(K.comparator);let t9=new L(K.comparator);function t5(...e){let t=t9;for(let r of e)t=t.add(r);return t}let t8=new L(S),t7=new l.z8([4294967295,4294967295],0);function re(e){let t=(new TextEncoder).encode(e),r=new l.V8;return r.update(t),new Uint8Array(r.digest())}function rt(e){let t=new DataView(e.buffer),r=t.getUint32(0,!0),n=t.getUint32(4,!0),s=t.getUint32(8,!0),i=t.getUint32(12,!0);return[new l.z8([r,n],0),new l.z8([s,i],0)]}class rr{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new rn(`Invalid padding: ${t}`);if(r<0||e.length>0&&0===this.hashCount)throw new rn(`Invalid hash count: ${r}`);if(0===e.length&&0!==t)throw new rn(`Invalid padding when bitmap length is 0: ${t}`);this.m=8*e.length-t,this.p=l.z8.fromNumber(this.m)}S(e,t,r){let n=e.add(t.multiply(l.z8.fromNumber(r)));return 1===n.compare(t7)&&(n=new l.z8([n.getBits(0),n.getBits(1)],0)),n.modulo(this.p).toNumber()}v(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(0===this.m)return!1;let[t,r]=rt(re(e));for(let e=0;e<this.hashCount;e++){let n=this.S(t,r,e);if(!this.v(n))return!1}return!0}static create(e,t,r){let n=new rr(new Uint8Array(Math.ceil(e/8)),e%8==0?0:8-e%8,t);return r.forEach(e=>n.insert(e)),n}insert(e){if(0===this.m)return;let[t,r]=rt(re(e));for(let e=0;e<this.hashCount;e++){let n=this.S(t,r,e);this.D(n)}}D(e){this.bitmap[Math.floor(e/8)]|=1<<e%8}}class rn extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rs{constructor(e,t,r,n,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=n,this.augmentedDocumentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,r){let n=new Map;return n.set(e,ri.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new rs(tV.min(),n,new A(S),t2,t2,t5())}}class ri{constructor(e,t,r,n,s){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=n,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new ri(r,t,t5(),t5(),t5())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ra{constructor(e,t,r,n){this.C=e,this.removedTargetIds=t,this.key=r,this.F=n}}class ro{constructor(e,t){this.targetId=e,this.O=t}}class ru{constructor(e,t,r=en.EMPTY_BYTE_STRING,n=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=n}}class rl{constructor(e){this.targetId=e,this.M=0,this.N=rm(),this.L=en.EMPTY_BYTE_STRING,this.B=!1,this.U=!0}get current(){return this.B}get resumeToken(){return this.L}get k(){return 0!==this.M}get q(){return this.U}$(e){e.approximateByteSize()>0&&(this.U=!0,this.L=e)}K(){let e=t5(),t=t5(),r=t5();return this.N.forEach((n,s)=>{switch(s){case 0:e=e.add(n);break;case 2:t=t.add(n);break;case 1:r=r.add(n);break;default:T(38017,{changeType:s})}}),new ri(this.L,this.B,e,t,r)}W(){this.U=!1,this.N=rm()}G(e,t){this.U=!0,this.N=this.N.insert(e,t)}j(e){this.U=!0,this.N=this.N.remove(e)}H(){this.M+=1}J(){this.M-=1,b(this.M>=0,3241,{M:this.M,targetId:this.targetId})}Y(){this.U=!0,this.B=!0}}let rc="WatchChangeAggregator";class rh{constructor(e){this.Z=e,this.X=new Map,this.ee=t2,this.te=rd(),this.ne=t2,this.re=rd(),this.ie=new A(S)}se(e){for(let t of e.C)e.F&&e.F.isFoundDocument()?this._e(t,e.F):this.oe(t,e.key,e.F);for(let t of e.removedTargetIds)this.oe(t,e.key,e.F)}ae(e){this.forEachTarget(e,t=>{let r=this.X.get(t);if(r)switch(e.state){case 0:this.ue(t)&&r.$(e.resumeToken);break;case 1:r.J(),r.k||r.W(),r.$(e.resumeToken);break;case 2:r.J(),r.k||this.removeTarget(t);break;case 3:this.ue(t)&&(r.Y(),r.$(e.resumeToken));break;case 4:this.ue(t)&&(this.ce(t),r.$(e.resumeToken));break;default:T(56790,{state:e.state})}else w(rc,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.X.forEach((e,r)=>{this.ue(r)&&t(r)})}le(e){return tU(e)?"documents"===e.getPipelineSourceType()&&1===e.getPipelineDocuments()?.length:tM(e)}Ee(e){let t=e.targetId,r=e.O.count,n=this.he(t);if(n){let s=n.target;if(this.le(s)){if(0===r){let e=new K(tU(s)?F.fromString(s.getPipelineDocuments()[0]):s.path);this.oe(t,e,tA.newNoDocument(e,tV.min()))}else b(1===r,20013,"Single document existence filter with count: "+r)}else{let n=this.Te(t);if(n!==r){let r=this.Pe(e),s=r?this.Re(r,e,n):1;0!==s&&(this.ce(t),this.ie=this.ie.insert(t,2===s?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch"))}}}}Pe(e){let t,r;let n=e.O.unchangedNames;if(!n||!n.bits)return null;let{bits:{bitmap:s="",padding:i=0},hashCount:a=0}=n;try{t=eo(s).toUint8Array()}catch(e){if(e instanceof er)return _("Decoding the base64 bloom filter in existence filter failed ("+e.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw e}try{r=new rr(t,i,a)}catch(e){return _(e instanceof rn?"BloomFilter error: ":"Applying bloom filter failed: ",e),null}return 0===r.m?null:r}Re(e,t,r){return t.O.count===r-this.Ve(e,t.targetId)?0:2}Ve(e,t){let r=this.Z.getRemoteKeysForTarget(t),n=0;return r.forEach(r=>{let s=this.Z.Ae(),i=`projects/${s.projectId}/databases/${s.database}/documents/${r.path.canonicalString()}`;e.mightContain(i)||(this.oe(t,r,null),n++)}),n}de(e){let t=new Map;this.X.forEach((r,n)=>{let s=this.he(n);if(s){if(r.current&&this.le(s.target)){let t=new K(tU(s.target)?F.fromString(s.target.getPipelineDocuments()[0]):s.target.path);this.fe(t).has(n)||this.me(n,t)||this.oe(n,t,tA.newNoDocument(t,e))}r.q&&(t.set(n,r.K()),r.W())}});let r=t5();this.re.forEach((e,t)=>{let n=!0;t.forEachWhile(e=>{let t=this.he(e);return!t||"TargetPurposeLimboResolution"===t.purpose||(n=!1,!1)}),n&&(r=r.add(e))}),this.ee.forEach((t,r)=>r.setReadTime(e)),this.ne.forEach((t,r)=>r.setReadTime(e));let n=new rs(e,t,this.ie,this.ee,this.ne,r);return this.ee=t2,this.te=rd(),this.ne=t2,this.re=rd(),this.ie=new A(S),n}_e(e,t){let r=this.X.get(e);if(!r||!this.ue(e))return void w(rc,`addDocumentToTarget received document for unknown inactive target (${e})`);let n=this.me(e,t.key)?2:0;r.G(t.key,n),tU(this.he(e).target)&&"exact"!==this.he(e).target.getPipelineFlavor()?this.ne=this.ne.insert(t.key,t):this.ee=this.ee.insert(t.key,t),this.te=this.te.insert(t.key,this.fe(t.key).add(e)),this.re=this.re.insert(t.key,this.pe(t.key).add(e))}oe(e,t,r){let n=this.X.get(e);n&&this.ue(e)?(this.me(e,t)?n.G(t,1):n.j(t),this.re=this.re.insert(t,this.pe(t).delete(e)),this.re=this.re.insert(t,this.pe(t).add(e)),r&&(tU(this.he(e).target)&&"exact"!==this.he(e).target.getPipelineFlavor()?this.ne=this.ne.insert(t,r):this.ee=this.ee.insert(t,r))):w(rc,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.X.delete(e)}Te(e){let t=this.X.get(e);if(!t)return 0;let r=t.K();return this.Z.getRemoteKeysForTarget(e).size+r.addedDocuments.size-r.removedDocuments.size}H(e){let t=this.X.get(e);t||(w(rc,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new rl(e),this.X.set(e,t)),t.H()}pe(e){let t=this.re.get(e);return t||(t=new L(S),this.re=this.re.insert(e,t)),t}fe(e){let t=this.te.get(e);return t||(t=new L(S),this.te=this.te.insert(e,t)),t}ue(e){let t=null!==this.he(e);return t||w(rc,"Detected inactive target",e),t}he(e){let t=this.X.get(e);return void 0===t||t.k?null:this.Z.ge(e)}ce(e){this.X.set(e,new rl(e)),this.Z.getRemoteKeysForTarget(e).forEach(t=>{this.oe(e,t,null)})}me(e,t){return this.Z.getRemoteKeysForTarget(e).has(t)}}function rd(){return new A(K.comparator)}function rm(){return new A(K.comparator)}let rf={asc:"ASCENDING",desc:"DESCENDING"},rp={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},rg={and:"AND",or:"OR"};class ry{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function rw(e,t){return e.useProto3Json||null==t?t:{value:t}}function rv(e,t){return e.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function r_(e){let t=ei(e);return new et(t.seconds,t.nanos)}function rE(e,t){return e.useProto3Json?t.toBase64():t.toUint8Array()}function rT(e,t){return rv(e,t.toTimestamp())}function rx(e){return b(!!e,49232),tV.fromTimestamp(r_(e))}function rb(e,t){return rN(e,t).canonicalString()}function rN(e,t){let r=new F(["projects",e.projectId,"databases",e.database]).child("documents");return void 0===t?r:r.child(t)}function rS(e){let t=F.fromString(e);return b(rL(t),10190,{key:t.toString()}),t}function rI(e,t){let r=rS(t);if(r.get(1)!==e.databaseId.projectId)throw new O(P.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+r.get(1)+" vs "+e.databaseId.projectId);if(r.get(3)!==e.databaseId.database)throw new O(P.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+r.get(3)+" vs "+e.databaseId.database);return new K(rA(r))}function rC(e,t){return rb(e.databaseId,t)}function rV(e){return new F(["projects",e.databaseId.projectId,"databases",e.databaseId.database]).canonicalString()}function rA(e){return b(e.length>4&&"documents"===e.get(4),29091,{key:e.toString()}),e.popFirst(5)}function rD(e){return{fieldPath:e.canonicalString()}}function rk(e){return $.fromServerFormat(e.fieldPath)}function rL(e){return e.length>=4&&"projects"===e.get(0)&&"databases"===e.get(2)}function rR(e){return!!e&&"function"==typeof e._toProto&&"ProtoValue"===e._protoValueType}function rP(e,t){let r={fields:{}};return t.forEach((t,n)=>{if("string"!=typeof n)throw Error(`Cannot encode map with non-string key: ${n}`);r.fields[n]=t._toProto(e)}),{mapValue:r}}function rO(e){return{stringValue:e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rU(e){return new ry(e,!0)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rM{constructor(e){this._byteString=e}static fromBase64String(e){try{return new rM(en.fromBase64String(e))}catch(e){throw new O(P.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+e)}}static fromUint8Array(e){return new rM(en.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:rM._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(ee(e,rM._jsonSchema))return rM.fromBase64String(e.bytes)}}rM._jsonSchemaVersion="firestore/bytes/1.0",rM._jsonSchema={type:Z("string",rM._jsonSchemaVersion),bytes:Z("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rF{constructor(...e){for(let t=0;t<e.length;++t)if(0===e[t].length)throw new O(P.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new $(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rq{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class r${constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new O(P.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new O(P.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return S(this._lat,e._lat)||S(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:r$._jsonSchemaVersion}}static fromJSON(e){if(ee(e,r$._jsonSchema))return new r$(e.latitude,e.longitude)}}r$._jsonSchemaVersion="firestore/geoPoint/1.0",r$._jsonSchema={type:Z("string",r$._jsonSchemaVersion),latitude:Z("number"),longitude:Z("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rB{constructor(e){this.uid=e}isAuthenticated(){return null!=this.uid}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}rB.UNAUTHENTICATED=new rB(null),rB.GOOGLE_CREDENTIALS=new rB("google-credentials-uid"),rB.FIRST_PARTY=new rB("first-party-uid"),rB.MOCK_USER=new rB("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rz{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rj{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class rG{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(rB.UNAUTHENTICATED))}shutdown(){}}class rK{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class rQ{constructor(e){this.ve=e,this.currentUser=rB.UNAUTHENTICATED,this.De=0,this.forceRefresh=!1,this.auth=null}start(e,t){b(void 0===this.xe,42304);let r=this.De,n=e=>this.De!==r?(r=this.De,t(e)):Promise.resolve(),s=new rz;this.xe=()=>{this.De++,this.currentUser=this.Ce(),s.resolve(),s=new rz,e.enqueueRetryable(()=>n(this.currentUser))};let i=()=>{let t=s;e.enqueueRetryable(async()=>{await t.promise,await n(this.currentUser)})},a=e=>{w("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=e,this.xe&&(this.auth.addAuthTokenListener(this.xe),i())};this.ve.onInit(e=>a(e)),setTimeout(()=>{if(!this.auth){let e=this.ve.getImmediate({optional:!0});e?a(e):(w("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new rz)}},0),i()}getToken(){let e=this.De,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(t=>this.De!==e?(w("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):t?(b("string"==typeof t.accessToken,31837,{Fe:t}),new rj(t.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.xe&&this.auth.removeAuthTokenListener(this.xe),this.xe=void 0}Ce(){let e=this.auth&&this.auth.getUid();return b(null===e||"string"==typeof e,2055,{Oe:e}),new rB(e)}}class rW{constructor(e,t,r){this.Me=e,this.Ne=t,this.Le=r,this.type="FirstParty",this.user=rB.FIRST_PARTY,this.Be=new Map}Ue(){return this.Le?this.Le():null}get headers(){this.Be.set("X-Goog-AuthUser",this.Me);let e=this.Ue();return e&&this.Be.set("Authorization",e),this.Ne&&this.Be.set("X-Goog-Iam-Authorization-Token",this.Ne),this.Be}}class rH{constructor(e,t,r){this.Me=e,this.Ne=t,this.Le=r}getToken(){return Promise.resolve(new rW(this.Me,this.Ne,this.Le))}start(e,t){e.enqueueRetryable(()=>t(rB.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class rY{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class rJ{constructor(e,t){this.ke=t,this.forceRefresh=!1,this.appCheck=null,this.qe=null,this.$e=null,(0,o.rh)(e)&&e.settings.appCheckToken&&(this.$e=e.settings.appCheckToken)}start(e,t){b(void 0===this.xe,3512);let r=e=>{null!=e.error&&w("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${e.error.message}`);let r=e.token!==this.qe;return this.qe=e.token,w("FirebaseAppCheckTokenProvider",`Received ${r?"new":"existing"} token.`),r?t(e.token):Promise.resolve()};this.xe=t=>{e.enqueueRetryable(()=>r(t))};let n=e=>{w("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=e,this.xe&&this.appCheck.addTokenListener(this.xe)};this.ke.onInit(e=>n(e)),setTimeout(()=>{if(!this.appCheck){let e=this.ke.getImmediate({optional:!0});e?n(e):w("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.$e)return Promise.resolve(new rY(this.$e));let e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(e=>e?(b("string"==typeof e.token,44558,{tokenResult:e}),this.qe=e.token,new rY(e.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.xe&&this.appCheck.removeTokenListener(this.xe),this.xe=void 0}}function rX(e){let t={};return void 0!==e.timeoutSeconds&&(t.timeoutSeconds=e.timeoutSeconds),t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rZ{Ke(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let r0="ConnectivityMonitor";class r1{constructor(){this.Qe=()=>this.We(),this.Ge=()=>this.ze(),this.je=[],this.He()}Ke(e){this.je.push(e)}shutdown(){window.removeEventListener("online",this.Qe),window.removeEventListener("offline",this.Ge)}He(){window.addEventListener("online",this.Qe),window.addEventListener("offline",this.Ge)}We(){for(let e of(w(r0,"Network connectivity changed: AVAILABLE"),this.je))e(0)}ze(){for(let e of(w(r0,"Network connectivity changed: UNAVAILABLE"),this.je))e(1)}static Je(){return"undefined"!=typeof window&&void 0!==window.addEventListener&&void 0!==window.removeEventListener}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let r2=null;function r3(){return null===r2?r2=268435456+Math.round(2147483648*Math.random()):r2++,"0x"+r2.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let r4="RestConnection",r6={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class r9{get Ye(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;let t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),n=encodeURIComponent(this.databaseId.database);this.Ze=t+"://"+e.host,this.Xe=`projects/${r}/databases/${n}`,this.et=this.databaseId.database===eg?`project_id=${r}`:`project_id=${r}&database_id=${n}`}tt(e,t,r,n,s){let i=r3(),a=this.nt(e,t.toUriEncodedString());w(r4,`Sending RPC '${e}' ${i}:`,a,r);let o={"google-cloud-resource-prefix":this.Xe,"x-goog-request-params":this.et};this.rt(o,n,s);let{host:l}=new URL(a),c=(0,u.Xx)(l);return this.it(e,a,o,r,c).then(t=>(w(r4,`Received RPC '${e}' ${i}: `,t),t),t=>{throw _(r4,`RPC '${e}' ${i} failed with error: `,t,"url: ",a,"request:",r),t})}st(e,t,r,n,s,i){return this.tt(e,t,r,n,s)}rt(e,t,r){if(e["X-Goog-Api-Client"]="gl-js/ fire/"+f,e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((t,r)=>e[r]=t),r&&r.headers.forEach((t,r)=>e[r]=t),this.databaseInfo._customHeaders)for(let t of Object.keys(this.databaseInfo._customHeaders))e[t]=this.databaseInfo._customHeaders[t]}nt(e,t){let r=r6[e],n=`${this.Ze}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(n=`${n}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),n}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class r5{constructor(e){this._t=e._t,this.ot=e.ot}ut(e){this.ct=e}lt(e){this.Et=e}ht(e){this.Tt=e}onMessage(e){this.Pt=e}close(){this.ot()}send(e){this._t(e)}Rt(){this.ct()}It(){this.Et()}At(e){this.Tt(e)}Vt(e){this.Pt(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let r8="WebChannelConnection",r7=(e,t,r)=>{e.listen(t,e=>{try{r(e)}catch(e){setTimeout(()=>{throw e},0)}})};class ne extends r9{constructor(e){super(e),this.dt=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static ft(){ne.gt||(r7((0,h.FJ)(),h.ju.STAT_EVENT,e=>{e.stat===h.kN.PROXY?w(r8,"STAT_EVENT: detected buffering proxy"):e.stat===h.kN.NOPROXY&&w(r8,"STAT_EVENT: detected no buffering proxy")}),ne.gt=!0)}it(e,t,r,n,s){let i=r3();return new Promise((s,a)=>{let o=new h.JJ;o.setWithCredentials(!0),o.listenOnce(h.tw.COMPLETE,()=>{try{switch(o.getLastErrorCode()){case h.jK.NO_ERROR:let t=o.getResponseJson();w(r8,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(t)),s(t);break;case h.jK.TIMEOUT:w(r8,`RPC '${e}' ${i} timed out`),a(new O(P.DEADLINE_EXCEEDED,"Request time out"));break;case h.jK.HTTP_ERROR:let r=o.getStatus();if(w(r8,`RPC '${e}' ${i} failed with status:`,r,"response text:",o.getResponseText()),r>0){let e=o.getResponseJson();Array.isArray(e)&&(e=e[0]);let t=e?.error;if(t&&t.status&&t.message){let e=function(e){let t=e.toLowerCase().replace(/_/g,"-");return Object.values(P).indexOf(t)>=0?t:P.UNKNOWN}(t.status);a(new O(e,t.message))}else a(new O(P.UNKNOWN,"Server responded with status "+o.getStatus()))}else a(new O(P.UNAVAILABLE,"Connection failed."));break;default:T(9055,{yt:e,streamId:i,wt:o.getLastErrorCode(),bt:o.getLastError()})}}finally{w(r8,`RPC '${e}' ${i} completed.`)}});let u=JSON.stringify(n);w(r8,`RPC '${e}' ${i} sending request:`,n),o.send(t,"POST",u,r,15)})}St(e,t,r){let n=r3(),i=[this.Ze,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=this.createWebChannelTransport(),o={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;void 0!==u&&(o.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(o.useFetchStreams=!0),this.rt(o.initMessageHeaders,t,r),o.encodeInitMessageHeaders=!0;let l=i.join("");w(r8,`Creating RPC '${e}' stream ${n}: ${l}`,o);let c=a.createWebChannel(l,o);this.vt(c);let d=!1,m=!1,f=new r5({_t:t=>{m?w(r8,`Not sending because RPC '${e}' stream ${n} is closed:`,t):(d||(w(r8,`Opening RPC '${e}' stream ${n} transport.`),c.open(),d=!0),w(r8,`RPC '${e}' stream ${n} sending:`,t),c.send(t))},ot:()=>c.close()});return r7(c,h.ii.EventType.OPEN,()=>{m||(w(r8,`RPC '${e}' stream ${n} transport opened.`),f.Rt())}),r7(c,h.ii.EventType.CLOSE,()=>{m||(m=!0,w(r8,`RPC '${e}' stream ${n} transport closed`),f.At(),this.Dt(c))}),r7(c,h.ii.EventType.ERROR,t=>{m||(m=!0,_(r8,`RPC '${e}' stream ${n} transport errored. Name:`,t.name,"Message:",t.message),f.At(new O(P.UNAVAILABLE,"The operation could not be completed")))}),r7(c,h.ii.EventType.MESSAGE,t=>{if(!m){let r=t.data[0];b(!!r,16349);let i=r?.error||r[0]?.error;if(i){w(r8,`RPC '${e}' stream ${n} received error:`,i);let t=i.status,r=function(e){let t=s[e];if(void 0!==t)return t0(t)}(t),a=i.message;"NOT_FOUND"===t&&a.includes("database")&&a.includes("does not exist")&&a.includes(this.databaseId.database)&&_(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),void 0===r&&(r=P.INTERNAL,a="Unknown error status: "+t+" with message "+i.message),m=!0,f.At(new O(r,a)),c.close()}else w(r8,`RPC '${e}' stream ${n} received:`,r),f.Vt(r)}}),ne.ft(),setTimeout(()=>{f.It()},0),f}terminate(){this.dt.forEach(e=>e.close()),this.dt=[]}vt(e){this.dt.push(e)}Dt(e){this.dt=this.dt.filter(t=>t===e)}rt(e,t,r){super.rt(e,t,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return(0,h.UE)()}}ne.gt=!1;class nt{constructor(e,t,r=1e3,n=1.5,s=6e4){this.xt=e,this.timerId=t,this.Ct=r,this.Ft=n,this.Ot=s,this.Mt=0,this.Nt=null,this.Lt=Date.now(),this.reset()}reset(){this.Mt=0}Bt(){this.Mt=this.Ot}Ut(e){this.cancel();let t=Math.floor(this.Mt+this.kt()),r=Math.max(0,Date.now()-this.Lt),n=Math.max(0,t-r);n>0&&w("ExponentialBackoff",`Backing off for ${n} ms (base delay: ${this.Mt} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.Nt=this.xt.enqueueAfterDelay(this.timerId,n,()=>(this.Lt=Date.now(),e())),this.Mt*=this.Ft,this.Mt<this.Ct&&(this.Mt=this.Ct),this.Mt>this.Ot&&(this.Mt=this.Ot)}qt(){null!==this.Nt&&(this.Nt.skipDelay(),this.Nt=null)}cancel(){null!==this.Nt&&(this.Nt.cancel(),this.Nt=null)}kt(){return(Math.random()-.5)*this.Mt}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nr="PersistentStream";class nn{constructor(e,t,r,n,s,i,a,o){this.xt=e,this.$t=r,this.Kt=n,this.connection=s,this.authCredentialsProvider=i,this.appCheckCredentialsProvider=a,this.listener=o,this.state=0,this.Qt=0,this.Wt=null,this.Gt=null,this.stream=null,this.zt=0,this.jt=new nt(e,t)}Ht(){return 1===this.state||5===this.state||this.Jt()}Jt(){return 2===this.state||3===this.state}start(){this.zt=0,4!==this.state?this.auth():this.Yt()}async stop(){this.Ht()&&await this.close(0)}Zt(){this.state=0,this.jt.reset()}Xt(){this.Jt()&&null===this.Wt&&(this.Wt=this.xt.enqueueAfterDelay(this.$t,6e4,()=>this.en()))}tn(e){this.nn(),this.stream.send(e)}async en(){if(this.Jt())return this.close(0)}nn(){this.Wt&&(this.Wt.cancel(),this.Wt=null)}rn(){this.Gt&&(this.Gt.cancel(),this.Gt=null)}async close(e,t){this.nn(),this.rn(),this.jt.cancel(),this.Qt++,4!==e?this.jt.reset():t&&t.code===P.RESOURCE_EXHAUSTED?(v(t.toString()),v("Using maximum backoff delay to prevent overloading the backend."),this.jt.Bt()):t&&t.code===P.UNAUTHENTICATED&&3!==this.state&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),null!==this.stream&&(this.sn(),this.stream.close(),this.stream=null),this.state=e,await this.listener.ht(t)}sn(){}auth(){this.state=1;let e=this._n(this.Qt),t=this.Qt;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([e,r])=>{this.Qt===t&&this.an(e,r)},t=>{e(()=>{let e=new O(P.UNKNOWN,"Fetching auth token failed: "+t.message);return this.un(e)})})}an(e,t){let r=this._n(this.Qt);this.stream=this.cn(e,t),this.stream.ut(()=>{r(()=>this.listener.ut())}),this.stream.lt(()=>{r(()=>(this.state=2,this.Gt=this.xt.enqueueAfterDelay(this.Kt,1e4,()=>(this.Jt()&&(this.state=3),Promise.resolve())),this.listener.lt()))}),this.stream.ht(e=>{r(()=>this.un(e))}),this.stream.onMessage(e=>{r(()=>1==++this.zt?this.En(e):this.onNext(e))})}Yt(){this.state=5,this.jt.Ut(async()=>{this.state=0,this.start()})}un(e){return w(nr,`close with error: ${e}`),this.stream=null,this.close(4,e)}_n(e){return t=>{this.xt.enqueueAndForget(()=>this.Qt===e?t():(w(nr,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class ns extends nn{constructor(e,t,r,n,s,i){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,n,i),this.serializer=s}cn(e,t){return this.connection.St("Listen",e,t)}En(e){return this.onNext(e)}onNext(e){this.jt.reset();let t=function(e,t){let r;if("targetChange"in t){var n,s;t.targetChange;let i="NO_CHANGE"===(n=t.targetChange.targetChangeType||"NO_CHANGE")?0:"ADD"===n?1:"REMOVE"===n?2:"CURRENT"===n?3:"RESET"===n?4:T(39313,{state:n}),a=t.targetChange.targetIds||[],o=(s=t.targetChange.resumeToken,e.useProto3Json?(b(void 0===s||"string"==typeof s,58123),en.fromBase64String(s||"")):(b(void 0===s||s instanceof m||s instanceof Uint8Array,16193),en.fromUint8Array(s||new Uint8Array))),u=t.targetChange.cause;r=new ru(i,a,o,u&&new O(void 0===u.code?P.UNKNOWN:t0(u.code),u.message||"")||null)}else if("documentChange"in t){t.documentChange;let n=t.documentChange;n.document,n.document.name,n.document.updateTime;let s=rI(e,n.document.name),i=rx(n.document.updateTime),a=n.document.createTime?rx(n.document.createTime):tV.min(),o=new eQ({mapValue:{fields:n.document.fields}}),u=tA.newFoundDocument(s,i,a,o);r=new ra(n.targetIds||[],n.removedTargetIds||[],u.key,u)}else if("documentDelete"in t){t.documentDelete;let n=t.documentDelete;n.document;let s=rI(e,n.document),i=n.readTime?rx(n.readTime):tV.min(),a=tA.newNoDocument(s,i);r=new ra([],n.removedTargetIds||[],a.key,a)}else if("documentRemove"in t){t.documentRemove;let n=t.documentRemove;n.document;let s=rI(e,n.document);r=new ra([],n.removedTargetIds||[],s,null)}else{if(!("filter"in t))return T(11601,{ye:t});{t.filter;let e=t.filter;e.targetId;let{count:n=0,unchangedNames:s}=e,i=new tZ(n,s);r=new ro(e.targetId,i)}}return r}(this.serializer,e),r=function(e){if(!("targetChange"in e))return tV.min();let t=e.targetChange;return t.targetIds&&t.targetIds.length?tV.min():t.readTime?rx(t.readTime):tV.min()}(e);return this.listener.hn(t,r)}Tn(e){let t={};t.database=rV(this.serializer),t.addTarget=function(e,t){let r;let n=t.target;if((r=tU(n)?{pipelineQuery:{structuredPipeline:{pipeline:{stages:n.stages.map(t=>t._toProto(e))}}}}:tM(n)?{documents:{documents:[rC(e,n.path)]}}:{query:function(e,t){var r,n;let s;let i={structuredQuery:{}},a=t.path;null!==t.collectionGroup?(s=a,i.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(s=a.popLast(),i.structuredQuery.from=[{collectionId:a.lastSegment()}]),i.parent=rC(e,s);let o=function(e){if(0!==e.length)return function e(t){return t instanceof tg?function(e){if("=="===e.op){if(e$(e.value))return{unaryFilter:{field:rD(e.field),op:"IS_NAN"}};if(eq(e.value))return{unaryFilter:{field:rD(e.field),op:"IS_NULL"}}}else if("!="===e.op){if(e$(e.value))return{unaryFilter:{field:rD(e.field),op:"IS_NOT_NAN"}};if(eq(e.value))return{unaryFilter:{field:rD(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:rD(e.field),op:rp[e.op],value:e.value}}}(t):t instanceof ty?function(t){let r=t.getFilters().map(t=>e(t));return 1===r.length?r[0]:{compositeFilter:{op:rg[t.op],filters:r}}}(t):T(54877,{filter:t})}(ty.create(e,"and"))}(t.filters);o&&(i.structuredQuery.where=o);let u=function(e){if(0!==e.length)return e.map(e=>({field:rD(e.field),direction:rf[e.dir]}))}(t.orderBy);u&&(i.structuredQuery.orderBy=u);let l=rw(e,t.limit);return null!==l&&(i.structuredQuery.limit=l),t.startAt&&(i.structuredQuery.startAt={before:(r=t.startAt).inclusive,values:r.position}),t.endAt&&(i.structuredQuery.endAt={before:!(n=t.endAt).inclusive,values:n.position}),{be:i,parent:s}}(e,n).be}).targetId=t.targetId,t.resumeToken.approximateByteSize()>0){r.resumeToken=rE(e,t.resumeToken);let n=rw(e,t.expectedCount);null!==n&&(r.expectedCount=n)}else if(t.snapshotVersion.compareTo(tV.min())>0){r.readTime=rv(e,t.snapshotVersion.toTimestamp());let n=rw(e,t.expectedCount);null!==n&&(r.expectedCount=n)}return r}(this.serializer,e);let r=function(e,t){let r=function(e){switch(e){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return T(28987,{purpose:e})}}(t.purpose);return null==r?null:{"goog-listen-tags":r}}(this.serializer,e);r&&(t.labels=r),this.tn(t)}Pn(e){let t={};t.database=rV(this.serializer),t.removeTarget=e,this.tn(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ni{}class na extends ni{constructor(e,t,r,n){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=n,this.fn=!1}mn(){if(this.fn)throw new O(P.FAILED_PRECONDITION,"The client has already been terminated.")}tt(e,t,r,n){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,i])=>this.connection.tt(e,rN(t,r),n,s,i)).catch(e=>{throw"FirebaseError"===e.name?(e.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new O(P.UNKNOWN,e.toString())})}st(e,t,r,n,s){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection.st(e,rN(t,r),n,i,a,s)).catch(e=>{throw"FirebaseError"===e.name?(e.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new O(P.UNKNOWN,e.toString())})}terminate(){this.fn=!0,this.connection.terminate()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let no=new Map,nu={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0};class nl{static withCacheSize(e){return new nl(e,nl.DEFAULT_COLLECTION_PERCENTILE,nl.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}nl.DEFAULT_COLLECTION_PERCENTILE=10,nl.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,nl.DEFAULT=new nl(41943040,nl.DEFAULT_COLLECTION_PERCENTILE,nl.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),nl.DISABLED=new nl(-1,0,0);/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nc{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=e=>this.pn(e),this.gn=e=>t.writeSequenceNumber(e))}pn(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){let e=++this.previousValue;return this.gn&&this.gn(e),e}}nc.yn=-1;class nh{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function nd(e){if(e.code!==P.FAILED_PRECONDITION||"The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab."!==e.message)throw e;w("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nm{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)},e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&T(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new nm((r,n)=>{this.nextCallback=t=>{this.wrapSuccess(e,t).next(r,n)},this.catchCallback=e=>{this.wrapFailure(t,e).next(r,n)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{let t=e();return t instanceof nm?t:nm.resolve(t)}catch(e){return nm.reject(e)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):nm.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):nm.reject(t)}static resolve(e){return new nm((t,r)=>{t(e)})}static reject(e){return new nm((t,r)=>{r(e)})}static waitFor(e){return new nm((t,r)=>{let n=0,s=0,i=!1;e.forEach(e=>{++n,e.next(()=>{++s,i&&s===n&&t()},e=>r(e))}),i=!0,s===n&&t()})}static or(e){let t=nm.resolve(!1);for(let r of e)t=t.next(e=>e?nm.resolve(e):r());return t}static forEach(e,t){let r=[];return e.forEach((e,n)=>{r.push(t.call(this,e,n))}),this.waitFor(r)}static mapArray(e,t){return new nm((r,n)=>{let s=e.length,i=Array(s),a=0;for(let o=0;o<s;o++){let u=o;t(e[u]).next(e=>{i[u]=e,++a===s&&r(i)},e=>n(e))}})}static doWhile(e,t){return new nm((r,n)=>{let s=()=>{!0===e()?t().next(()=>{s()},n):r()};s()})}}function nf(e){return"IndexedDbTransactionError"===e.name}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let np="LruGarbageCollector";function ng([e,t],[r,n]){let s=S(e,r);return 0===s?S(t,n):s}class ny{constructor(e){this.Jn=e,this.buffer=new L(ng),this.Yn=0}Zn(){return++this.Yn}Xn(e){let t=[e,this.Zn()];if(this.buffer.size<this.Jn)this.buffer=this.buffer.add(t);else{let e=this.buffer.last();0>ng(t,e)&&(this.buffer=this.buffer.delete(e).add(t))}}get maxValue(){return this.buffer.last()[0]}}class nw{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.er=null}start(){-1!==this.garbageCollector.params.cacheSizeCollectionThreshold&&this.tr(6e4)}stop(){this.er&&(this.er.cancel(),this.er=null)}get started(){return null!==this.er}tr(e){w(np,`Garbage collection scheduled in ${e}ms`),this.er=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.er=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(e){nf(e)?w(np,"Ignoring IndexedDB error during garbage collection: ",e):await nd(e)}await this.tr(3e5)})}}class nv{constructor(e,t){this.nr=e,this.params=t}calculateTargetCount(e,t){return this.nr.rr(e).next(e=>Math.floor(t/100*e))}nthSequenceNumber(e,t){if(0===t)return nm.resolve(nc.yn);let r=new ny(t);return this.nr.forEachTarget(e,e=>r.Xn(e.sequenceNumber)).next(()=>this.nr.ir(e,e=>r.Xn(e))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.nr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.nr.removeOrphanedDocuments(e,t)}collect(e,t){return -1===this.params.cacheSizeCollectionThreshold?(w("LruGarbageCollector","Garbage collection skipped; disabled"),nm.resolve(nu)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(w("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),nu):this.sr(e,t))}getCacheSize(e){return this.nr.getCacheSize(e)}sr(e,t){let r,n,s,i,a,o,u;let l=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(t=>(t>this.params.maximumSequenceNumbersToCollect?(w("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${t}`),n=this.params.maximumSequenceNumbersToCollect):n=t,i=Date.now(),this.nthSequenceNumber(e,n))).next(n=>(r=n,a=Date.now(),this.removeTargets(e,r,t))).next(t=>(s=t,o=Date.now(),this.removeOrphanedDocuments(e,r))).next(e=>(u=Date.now(),y()<=c.in.DEBUG&&w("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${i-l}ms
	Determined least recently used ${n} in `+(a-i)+"ms\n"+`	Removed ${s} targets in `+(o-a)+"ms\n"+`	Removed ${e} documents in `+(u-o)+"ms\n"+`Total Duration: ${u-l}ms`),nm.resolve({didRun:!0,sequenceNumbersCollected:n,targetsRemoved:s,documentsRemoved:e})))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let n_="firestore.googleapis.com";class nE{constructor(e){if(void 0===e.host){if(void 0!==e.ssl)throw new O(P.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=n_,this.ssl=!0}else this.host=e.host,this.ssl=e.ssl??!0;if(this.isUsingEmulator=void 0!==e.emulatorOptions,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders={...e._customHeaders}),void 0===e.cacheSizeBytes)this.cacheSizeBytes=41943040;else{if(-1!==e.cacheSizeBytes&&e.cacheSizeBytes<1048576)throw new O(P.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(function(e,t,r,n){if(!0===t&&!0===n)throw new O(P.INVALID_ARGUMENT,`${e} and ${r} cannot be used together.`)}("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:void 0===e.experimentalAutoDetectLongPolling?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=rX(e.experimentalLongPollingOptions??{}),function(e){if(void 0!==e.timeoutSeconds){if(isNaN(e.timeoutSeconds))throw new O(P.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (must not be NaN)`);if(e.timeoutSeconds<5)throw new O(P.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (minimum allowed value is 5)`);if(e.timeoutSeconds>30)throw new O(P.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,void 0!==e.grpcFlowControlWindow){if("number"!=typeof e.grpcFlowControlWindow||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new O(P.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){var t,r;return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(t=this.experimentalLongPollingOptions,r=e.experimentalLongPollingOptions,t.timeoutSeconds===r.timeoutSeconds)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&function(e,t){if(e===t)return!0;if(!e||!t)return!1;let r=Object.keys(e),n=Object.keys(t);if(r.length!==n.length)return!1;for(let n of r)if(e[n]!==t[n])return!1;return!0}(this._customHeaders,e._customHeaders)}}let nT=class{constructor(e,t,r,n){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=n,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new nE({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new O(P.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return"notTerminated"!==this._terminateTask}_setSettings(e){if(this._settingsFrozen)throw new O(P.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new nE(e),this._emulatorOptions=e.emulatorOptions||{},void 0!==e.credentials&&(this._authCredentials=function(e){if(!e)return new rG;switch(e.type){case"firstParty":return new rH(e.sessionIndex||"0",e.iamToken||null,e.authTokenFactory||null);case"provider":return e.client;default:throw new O(P.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return"notTerminated"===this._terminateTask&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){"notTerminated"===this._terminateTask?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){let t=no.get(e);t&&(w("ComponentProvider","Removing Datastore"),no.delete(e),t.terminate())}(this),Promise.resolve()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nx{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new nx(this.firestore,e,this._query)}}class nb{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new nN(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new nb(this.firestore,e,this._key)}toJSON(){return{type:nb._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(ee(t,nb._jsonSchema))return new nb(e,r||null,new K(F.fromString(t.referencePath)))}}nb._jsonSchemaVersion="firestore/documentReference/1.0",nb._jsonSchema={type:Z("string",nb._jsonSchemaVersion),referencePath:Z("string")};class nN extends nx{constructor(e,t,r){super(e,t,tq(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){let e=this._path.popLast();return e.isEmpty()?null:new nb(this.firestore,null,new K(e))}withConverter(e){return new nN(this.firestore,e,this._path)}}function nS(e,t,...r){if(e=(0,u.m9)(e),Q("collection","path",t),e instanceof nT){let n=F.fromString(t,...r);return H(n),new nN(e,null,n)}{if(!(e instanceof nb||e instanceof nN))throw new O(P.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let n=e._path.child(F.fromString(t,...r));return H(n),new nN(e.firestore,null,n)}}function nI(e,t,...r){if(e=(0,u.m9)(e),1==arguments.length&&(t=N.newId()),Q("doc","path",t),e instanceof nT){let n=F.fromString(t,...r);return W(n),new nb(e,null,new K(n))}{if(!(e instanceof nb||e instanceof nN))throw new O(P.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let n=e._path.child(F.fromString(t,...r));return W(n),new nb(e.firestore,e instanceof nN?e.converter:null,new K(n))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nC{constructor(e){this._values=(e||[]).map(e=>e)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(e,t){if(e.length!==t.length)return!1;for(let r=0;r<e.length;++r)if(e[r]!==t[r])return!1;return!0}(this._values,e._values)}toJSON(){return{type:nC._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(ee(e,nC._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(e=>"number"==typeof e))return new nC(e.vectorValues);throw new O(P.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}nC._jsonSchemaVersion="firestore/vectorValue/1.0",nC._jsonSchema={type:Z("string",nC._jsonSchemaVersion),vectorValues:Z("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nV=/^__.*__$/;class nA{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return null!==this.fieldMask?new to(e,this.data,this.fieldMask,t,this.fieldTransforms):new ta(e,this.data,t,this.fieldTransforms)}}class nD{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new to(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function nk(e){switch(e){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw T(40011,{dataSource:e})}}class nL{constructor(e,t,r,n,s,i){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=n,void 0===s&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new nL({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){let t=this.path?.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){let t=this.path?.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return nW(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return void 0!==this.fieldMask.find(t=>e.isPrefixOf(t))||void 0!==this.fieldTransforms.find(t=>e.isPrefixOf(t.field))}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(0===e.length)throw this.createError("Document fields must not be empty");if(nk(this.dataSource)&&nV.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class nR{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||rU(e)}createContext(e,t,r,n=!1){return new nL({dataSource:e,methodName:t,targetDoc:r,path:$.emptyPath(),arrayElement:!1,hasConverter:n},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function nP(e){let t=e._freezeSettings(),r=rU(e._databaseId);return new nR(e._databaseId,!!t.ignoreUndefinedProperties,r)}function nO(e,t,r,n,s,i={}){let a,o;let u=e.createContext(i.merge||i.mergeFields?2:0,t,r,s);nj("Data must be an object, but it was:",u,n);let l=nB(n,u);if(i.merge)a=new B(u.fieldMask),o=u.fieldTransforms;else if(i.mergeFields){let e=[];for(let n of i.mergeFields){let s=nG(t,n,r);if(!u.contains(s))throw new O(P.INVALID_ARGUMENT,`Field '${s}' is specified in your field mask but missing from your input data.`);nH(e,s)||e.push(s)}a=new B(e),o=u.fieldTransforms.filter(e=>a.covers(e.field))}else a=null,o=u.fieldTransforms;return new nA(new eQ(l),a,o)}class nU extends rq{_toFieldTransform(e){if(2!==e.dataSource)throw 1===e.dataSource?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof nU}}function nM(e,t,r,n){let s=e.createContext(1,t,r);nj("Data must be an object, but it was:",s,n);let i=[],a=eQ.empty();return j(n,(e,n)=>{let o=nQ(t,e,r);n=(0,u.m9)(n);let l=s.childContextForFieldPath(o);if(n instanceof nU)i.push(o);else{let e=n$(n,l);null!=e&&(i.push(o),a.set(o,e))}}),new nD(a,new B(i),s.fieldTransforms)}function nF(e,t,r,n,s,i){let a=e.createContext(1,t,r),o=[nG(t,n,r)],l=[s];if(i.length%2!=0)throw new O(P.INVALID_ARGUMENT,`Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let e=0;e<i.length;e+=2)o.push(nG(t,i[e])),l.push(i[e+1]);let c=[],h=eQ.empty();for(let e=o.length-1;e>=0;--e)if(!nH(c,o[e])){let t=o[e],r=l[e];r=(0,u.m9)(r);let n=a.childContextForFieldPath(t);if(r instanceof nU)c.push(t);else{let e=n$(r,n);null!=e&&(c.push(t),h.set(t,e))}}return new nD(h,new B(c),a.fieldTransforms)}function nq(e,t,r,n=!1){return n$(r,e.createContext(n?4:3,t))}function n$(e,t,r){if(nz(e=(0,u.m9)(e)))return nj("Unsupported field value:",t,e),nB(e,t);if(e instanceof rq)return function(e,t){if(!nk(t.dataSource))throw t.createError(`${e._methodName}() can only be used with update() and set()`);if(!t.path)throw t.createError(`${e._methodName}() is not currently supported inside arrays`);let r=e._toFieldTransform(t);r&&t.fieldTransforms.push(r)}(e,t),null;if(void 0===e&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),e instanceof Array){if(t.settings.arrayElement&&4!==t.dataSource)throw t.createError("Nested arrays are not supported");return function(e,t){let r=[],n=0;for(let s of e){let e=n$(s,t.childContextForArray(n));null==e&&(e={nullValue:"NULL_VALUE"}),r.push(e),n++}return{arrayValue:{values:r}}}(e,t)}return function(e,t,r){if(null===(e=(0,u.m9)(e)))return{nullValue:"NULL_VALUE"};if("number"==typeof e)return eY(t.serializer,e);if("boolean"==typeof e)return{booleanValue:e};if("string"==typeof e)return{stringValue:e};if(e instanceof Date){let r=et.fromDate(e);return{timestampValue:rv(t.serializer,r)}}if(e instanceof et){let r=new et(e.seconds,1e3*Math.floor(e.nanoseconds/1e3));return{timestampValue:rv(t.serializer,r)}}if(e instanceof r$)return{geoPointValue:{latitude:e.latitude,longitude:e.longitude}};if(e instanceof rM)return{bytesValue:rE(t.serializer,e._byteString)};if(e instanceof nb){let r=t.databaseId,n=e.firestore._databaseId;if(!n.isEqual(r))throw t.createError(`Document reference is for database ${n.projectId}/${n.database} but should be for database ${r.projectId}/${r.database}`);return{referenceValue:rb(e.firestore._databaseId||t.databaseId,e._key.path)}}if(e instanceof nC){var n;return{mapValue:{fields:{[e_]:{stringValue:ex},[eb]:{arrayValue:{values:((n=e)instanceof nC?n.toArray():n).map(e=>{if("number"!=typeof e)throw t.createError("VectorValues must only contain numeric values.");return eW(t.serializer,e)})}}}}}}if(rR(e))return e._toProto(t.serializer);throw t.createError(`Unsupported field value: ${J(e)}`)}(e,t)}function nB(e,t){let r={};return G(e)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):j(e,(e,n)=>{let s=n$(n,t.childContextForField(e));null!=s&&(r[e]=s)}),{mapValue:{fields:r}}}function nz(e){return!("object"!=typeof e||null===e||e instanceof Array||e instanceof Date||e instanceof et||e instanceof r$||e instanceof rM||e instanceof nb||e instanceof rq||e instanceof nC||rR(e))}function nj(e,t,r){if(!nz(r)||!Y(r)){let n=J(r);throw"an object"===n?t.createError(e+" a custom object"):t.createError(e+" "+n)}}function nG(e,t,r){if((t=(0,u.m9)(t))instanceof rF)return t._internalPath;if("string"==typeof t)return nQ(e,t);throw nW("Field path arguments must be of type string or ",e,!1,void 0,r)}let nK=RegExp("[~\\*/\\[\\]]");function nQ(e,t,r){if(t.search(nK)>=0)throw nW(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,e,!1,void 0,r);try{return new rF(...t.split("."))._internalPath}catch(n){throw nW(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,e,!1,void 0,r)}}function nW(e,t,r,n,s){let i=n&&!n.isEmpty(),a=void 0!==s,o=`Function ${t}() called with invalid data`;r&&(o+=" (via `toFirestore()`)"),o+=". ";let u="";return(i||a)&&(u+=" (found",i&&(u+=` in field ${n}`),a&&(u+=` in document ${s}`),u+=")"),new O(P.INVALID_ARGUMENT,o+e+u)}function nH(e,t){return e.some(e=>e.isEqual(t))}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nY{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){let r=eQ.empty();for(let n in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(n)){let s=this.optionDefinitions[n];if(n in e){let i;let a=e[n];s.nestedOptions&&Y(a)?i={mapValue:{fields:new nY(s.nestedOptions).getOptionsProto(t,a)}}:a&&(i=n$(a,t)??void 0),i&&r.set($.fromServerFormat(s.serverName),i)}}return r}getOptionsProto(e,t,r){let n=this._getKnownOptions(t,e);if(r){let t=new Map(function(e,t){let r=[];for(let n in e)Object.prototype.hasOwnProperty.call(e,n)&&r.push(t(e[n],n,e));return r}(r,(t,r)=>[$.fromServerFormat(r),void 0!==t?n$(t,e):null]));n.setAll(t)}return n.value.mapValue.fields??{}}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nJ(e){var t;return e instanceof n0?e:Y(e)?function(e,t){let r=[];for(let t in e)if(Object.prototype.hasOwnProperty.call(e,t)){let n=e[t];r.push(n5(t)),r.push(nJ(n))}return new n7("map",r,"map")}(e):e instanceof Array?(t="array",new n7("array",e.map(e=>nJ(e)),t)):n8(e,void 0)}function nX(e){if(e instanceof n0)return e;if(e instanceof nC)return n5(e);if(Array.isArray(e))return n5(new nC(e));throw Error("Unsupported value: "+typeof e)}function nZ(e){var t;return"string"==typeof e?(t="field",new n6("string"==typeof e?U===e?new rF(U)._internalPath:nG("field",e):e._internalPath,t)):nJ(e)}class n0{constructor(){this._protoValueType="ProtoValue"}add(e){return new n7("add",[this,nJ(e)],"add")}asBoolean(){if(this instanceof se)return this;if(this instanceof n9)return new sr(this);if(this instanceof n6)return new sn(this);if(this instanceof n7)return new st(this);throw new O("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new n7("subtract",[this,nJ(e)],"subtract")}multiply(e){return new n7("multiply",[this,nJ(e)],"multiply")}divide(e){return new n7("divide",[this,nJ(e)],"divide")}mod(e){return new n7("mod",[this,nJ(e)],"mod")}equal(e){return new n7("equal",[this,nJ(e)],"equal").asBoolean()}notEqual(e){return new n7("not_equal",[this,nJ(e)],"notEqual").asBoolean()}lessThan(e){return new n7("less_than",[this,nJ(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new n7("less_than_or_equal",[this,nJ(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new n7("greater_than",[this,nJ(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new n7("greater_than_or_equal",[this,nJ(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){return new n7("array_concat",[this,...[e,...t].map(e=>nJ(e))],"arrayConcat")}arrayContains(e){return new n7("array_contains",[this,nJ(e)],"arrayContains").asBoolean()}arrayContainsAll(e){return new n7("array_contains_all",[this,Array.isArray(e)?new n4(e.map(nJ),"arrayContainsAll"):e],"arrayContainsAll").asBoolean()}arrayContainsAny(e){return new n7("array_contains_any",[this,Array.isArray(e)?new n4(e.map(nJ),"arrayContainsAny"):e],"arrayContainsAny").asBoolean()}arrayReverse(){return new n7("array_reverse",[this])}arrayLength(){return new n7("array_length",[this],"arrayLength")}equalAny(e){return new n7("equal_any",[this,Array.isArray(e)?new n4(e.map(nJ),"equalAny"):e],"equalAny").asBoolean()}notEqualAny(e){return new n7("not_equal_any",[this,Array.isArray(e)?new n4(e.map(nJ),"notEqualAny"):e],"notEqualAny").asBoolean()}exists(){return new n7("exists",[this],"exists").asBoolean()}charLength(){return new n7("char_length",[this],"charLength")}like(e){return new n7("like",[this,nJ(e)],"like").asBoolean()}regexContains(e){return new n7("regex_contains",[this,nJ(e)],"regexContains").asBoolean()}regexFind(e){return new n7("regex_find",[this,nJ(e)],"regexFind")}regexFindAll(e){return new n7("regex_find_all",[this,nJ(e)],"regexFindAll")}regexMatch(e){return new n7("regex_match",[this,nJ(e)],"regexMatch").asBoolean()}stringContains(e){return new n7("string_contains",[this,nJ(e)],"stringContains").asBoolean()}startsWith(e){return new n7("starts_with",[this,nJ(e)],"startsWith").asBoolean()}endsWith(e){return new n7("ends_with",[this,nJ(e)],"endsWith").asBoolean()}toLower(){return new n7("to_lower",[this],"toLower")}toUpper(){return new n7("to_upper",[this],"toUpper")}trim(e){let t=[this];return e&&t.push(nJ(e)),new n7("trim",t,"trim")}ltrim(e){let t=[this];return e&&t.push(nJ(e)),new n7("ltrim",t,"ltrim")}rtrim(e){let t=[this];return e&&t.push(nJ(e)),new n7("rtrim",t,"rtrim")}type(){return new n7("type",[this])}isType(e){return new n7("is_type",[this,n5(e)],"isType").asBoolean()}stringConcat(e,...t){return new n7("string_concat",[this,...[e,...t].map(nJ)],"stringConcat")}stringIndexOf(e){return new n7("string_index_of",[this,nJ(e)],"stringIndexOf")}stringRepeat(e){return new n7("string_repeat",[this,nJ(e)],"stringRepeat")}stringReplaceAll(e,t){return new n7("string_replace_all",[this,nJ(e),nJ(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new n7("string_replace_one",[this,nJ(e),nJ(t)],"stringReplaceOne")}concat(e,...t){return new n7("concat",[this,...[e,...t].map(nJ)],"concat")}reverse(){return new n7("reverse",[this],"reverse")}arrayFilter(e,t){return new n7("array_filter",[this,nJ(e),t],"arrayFilter")}arrayTransform(e,t){return new n7("array_transform",[this,nJ(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,r){return new n7("array_transform",[this,nJ(e),nJ(t),r],"arrayTransformWithIndex")}arraySlice(e,t){let r=[this,nJ(e)];return void 0!==t&&r.push(nJ(t)),new n7("array_slice",r,"arraySlice")}arrayFirst(){return new n7("array_first",[this],"arrayFirst")}arrayFirstN(e){return new n7("array_first_n",[this,nJ(e)],"arrayFirstN")}arrayLast(){return new n7("array_last",[this],"arrayLast")}arrayLastN(e){return new n7("array_last_n",[this,nJ(e)],"arrayLastN")}arrayMaximum(){return new n7("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new n7("maximum_n",[this,nJ(e)],"arrayMaximumN")}arrayMinimum(){return new n7("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new n7("minimum_n",[this,nJ(e)],"arrayMinimumN")}arrayIndexOf(e){return new n7("array_index_of",[this,nJ(e),nJ("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new n7("array_index_of",[this,nJ(e),nJ("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new n7("array_index_of_all",[this,nJ(e)],"arrayIndexOfAll")}byteLength(){return new n7("byte_length",[this],"byteLength")}ceil(){return new n7("ceil",[this])}floor(){return new n7("floor",[this])}abs(){return new n7("abs",[this])}exp(){return new n7("exp",[this])}mapGet(e){return new n7("map_get",[this,n5(e)],"mapGet")}mapSet(e,t,...r){return new n7("map_set",[this,nJ(e),nJ(t),...r.map(nJ)],"mapSet")}mapKeys(){return new n7("map_keys",[this],"mapKeys")}mapValues(){return new n7("map_values",[this],"mapValues")}mapEntries(){return new n7("map_entries",[this],"mapEntries")}getField(e){return new n7("get_field",[this,nJ(e)],"get_field")}count(){return n1._create("count",[this],"count")}sum(){return n1._create("sum",[this],"sum")}average(){return n1._create("average",[this],"average")}minimum(){return n1._create("minimum",[this],"minimum")}maximum(){return n1._create("maximum",[this],"maximum")}first(){return n1._create("first",[this],"first")}last(){return n1._create("last",[this],"last")}arrayAgg(){return n1._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return n1._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return n1._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){return new n7("maximum",[this,...[e,...t].map(nJ)],"logicalMaximum")}logicalMinimum(e,...t){return new n7("minimum",[this,...[e,...t].map(nJ)],"minimum")}vectorLength(){return new n7("vector_length",[this],"vectorLength")}cosineDistance(e){return new n7("cosine_distance",[this,nX(e)],"cosineDistance")}dotProduct(e){return new n7("dot_product",[this,nX(e)],"dotProduct")}euclideanDistance(e){return new n7("euclidean_distance",[this,nX(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new n7("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new n7("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new n7("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new n7("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new n7("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new n7("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new n7("timestamp_add",[this,nJ(e),nJ(t)],"timestampAdd")}timestampSubtract(e,t){return new n7("timestamp_subtract",[this,nJ(e),nJ(t)],"timestampSubtract")}timestampDiff(e,t){return new n7("timestamp_diff",[this,nZ(e),nJ(t)],"timestampDiff")}timestampExtract(e,t){let r=[this,nJ(e)];return t&&r.push(nJ(t)),new n7("timestamp_extract",r,"timestampExtract")}documentId(){return new n7("document_id",[this],"documentId")}parent(){return new n7("parent",[this],"parent")}substring(e,t){let r=nJ(e);return new n7("substring",void 0===t?[this,r]:[this,r,nJ(t)],"substring")}arrayGet(e){return new n7("array_get",[this,nJ(e)],"arrayGet")}isError(){return new n7("is_error",[this],"isError").asBoolean()}ifError(e){let t=new n7("if_error",[this,nJ(e)],"ifError");return e instanceof se?t.asBoolean():t}isAbsent(){return new n7("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new n7("map_remove",[this,nJ(e)],"mapRemove")}mapMerge(e,...t){return new n7("map_merge",[this,nJ(e),...t.map(nJ)],"mapMerge")}pow(e){return new n7("pow",[this,nJ(e)])}trunc(e){return void 0===e?new n7("trunc",[this]):new n7("trunc",[this,nJ(e)],"trunc")}round(e){return void 0===e?new n7("round",[this]):new n7("round",[this,nJ(e)],"round")}collectionId(){return new n7("collection_id",[this])}length(){return new n7("length",[this])}ln(){return new n7("ln",[this])}sqrt(){return new n7("sqrt",[this])}stringReverse(){return new n7("string_reverse",[this])}ifAbsent(e){return new n7("if_absent",[this,nJ(e)],"ifAbsent")}ifNull(e){return new n7("if_null",[this,nJ(e)],"ifNull")}coalesce(e,...t){return new n7("coalesce",[this,nJ(e),...t.map(nJ)],"coalesce")}join(e){return new n7("join",[this,nJ(e)],"join")}log10(){return new n7("log10",[this])}arraySum(){return new n7("sum",[this])}split(e){return new n7("split",[this,nJ(e)])}timestampTruncate(e,t){let r=[this,nJ(e)];return t&&r.push(nJ(t)),new n7("timestamp_trunc",r)}ascending(){return new ss(nZ(this),"ascending","ascending")}descending(){return new ss(nZ(this),"descending","descending")}as(e){return new n3(this,e,"as")}}class n1{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,r){let n=new n1(e,t);return n._methodName=r,n}as(e){return new n2(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map(t=>t._toProto(e))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach(t=>t._readUserData(e))}}class n2{constructor(e,t,r){this.aggregate=e,this.alias=t,this._methodName=r}_readUserData(e){this.aggregate._readUserData(e)}}class n3{constructor(e,t,r){this.expr=e,this.alias=t,this._methodName=r,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class n4 extends n0{constructor(e,t){super(),this.ur=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.ur.map(t=>t._toProto(e))}}}_readUserData(e){this.ur.forEach(t=>t._readUserData(e))}}class n6 extends n0{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new n7("geo_distance",[this,nJ(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}class n9 extends n0{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){let t=new n9(e,void 0);return t._protoValue=e,t}_toProto(e){return b(void 0!==this._protoValue,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){var t,r,n,s,i,a,o;e=this._methodName?e.contextWith({methodName:this._methodName}):e,"object"==typeof(t=this._protoValue)&&null!==t&&("nullValue"in t&&(null===t.nullValue||"NULL_VALUE"===t.nullValue)||"booleanValue"in t&&(null===t.booleanValue||"boolean"==typeof t.booleanValue)||"integerValue"in t&&(null===t.integerValue||"number"==typeof t.integerValue||"string"==typeof t.integerValue)||"doubleValue"in t&&(null===t.doubleValue||"number"==typeof t.doubleValue)||"timestampValue"in t&&(null===t.timestampValue||"object"==typeof(r=t.timestampValue)&&null!==r&&"seconds"in r&&(null===r.seconds||"number"==typeof r.seconds||"string"==typeof r.seconds)&&"nanos"in r&&(null===r.nanos||"number"==typeof r.nanos))||"stringValue"in t&&(null===t.stringValue||"string"==typeof t.stringValue)||"bytesValue"in t&&(null===t.bytesValue||t.bytesValue instanceof Uint8Array)||"referenceValue"in t&&(null===t.referenceValue||"string"==typeof t.referenceValue)||"geoPointValue"in t&&(null===t.geoPointValue||"object"==typeof(n=t.geoPointValue)&&null!==n&&"latitude"in n&&(null===n.latitude||"number"==typeof n.latitude)&&"longitude"in n&&(null===n.longitude||"number"==typeof n.longitude))||"arrayValue"in t&&(null===t.arrayValue||"object"==typeof(s=t.arrayValue)&&null!==s&&!(!("values"in s)||null!==s.values&&!Array.isArray(s.values)))||"mapValue"in t&&(null===t.mapValue||"object"==typeof(i=t.mapValue)&&null!==i&&!(!("fields"in i)||null!==i.fields&&!Y(i.fields)))||"fieldReferenceValue"in t&&(null===t.fieldReferenceValue||"string"==typeof t.fieldReferenceValue)||"functionValue"in t&&(null===t.functionValue||"object"==typeof(a=t.functionValue)&&null!==a&&!(!("name"in a)||null!==a.name&&"string"!=typeof a.name||!("args"in a)||null!==a.args&&!Array.isArray(a.args)))||"pipelineValue"in t&&(null===t.pipelineValue||"object"==typeof(o=t.pipelineValue)&&null!==o&&!(!("stages"in o)||null!==o.stages&&!Array.isArray(o.stages))))||(this._protoValue=n$(this.value,e))}}function n5(e,t){return n8(e,"constant")}function n8(e,t){let r=new n9(e,t);return"boolean"==typeof e?new sr(r):r}class n7 extends n0{constructor(e,t,r,n){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,void 0!==r&&(this._methodName=r),void 0!==n&&(this._options=n)}get _optionsUtil(){return new nY({})}_toProto(e){let t={functionValue:{name:this.name,args:this.params.map(t=>t._toProto(e))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach(t=>t._readUserData(e)),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class se extends n0{get _methodName(){return this._expr._methodName}countIf(){return n1._create("count_if",[this],"countIf")}not(){return new n7("not",[this],"not").asBoolean()}conditional(e,t){return new n7("conditional",[this,e,t],"conditional")}ifError(e){let t=nJ(e),r=new n7("if_error",[this,t],"ifError");return t instanceof se?r.asBoolean():r}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class st extends se{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class sr extends se{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class sn extends se{constructor(e){super(),this._expr=e,this.expressionType="Field"}}class ss{constructor(e,t,r){this.expr=e,this.direction=t,this._methodName=r,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:rO(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class si{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class sa extends si{get _name(){return"add_fields"}get _optionsUtil(){return new nY({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[rP(e,this.fields)]}}_readUserData(e){super._readUserData(e),sv(this.fields,e)}}class so extends si{get _name(){return"aggregate"}get _optionsUtil(){return new nY({})}constructor(e,t,r){super(r),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[rP(e,this.accumulators),rP(e,this.groups)]}}_readUserData(e){super._readUserData(e),sv(this.groups,e),sv(this.accumulators,e)}}class su extends si{get _name(){return"distinct"}get _optionsUtil(){return new nY({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[rP(e,this.groups)]}}_readUserData(e){super._readUserData(e),sv(this.groups,e)}}class sl extends si{get _name(){return"collection"}get _optionsUtil(){return new nY({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.Er=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.Er}]}}_readUserData(e){super._readUserData(e)}}class sc extends si{get _name(){return"collection_group"}get _optionsUtil(){return new nY({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class sh extends si{get _name(){return"database"}get _optionsUtil(){return new nY({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class sd extends si{get _name(){return"documents"}get _optionsUtil(){return new nY({})}constructor(e,t){if(super(t),!e||0===e.length)throw new O(P.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");let r=e.map(e=>e.startsWith("/")?e:"/"+e),n=new Set(r);if(n.size!==r.length)throw new O(P.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.hr=r,this.Tr=n}_toProto(e){return{...super._toProto(e),args:this.hr.map(e=>({referenceValue:e}))}}_readUserData(e){super._readUserData(e)}}class sm extends si{get _name(){return"where"}get _optionsUtil(){return new nY({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),sv(this.condition,e)}}class sf extends si{get _name(){return"limit"}get _optionsUtil(){return new nY({})}constructor(e,t){b(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[eY(e,this.limit)]}}}class sp extends si{get _name(){return"offset"}get _optionsUtil(){return new nY({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[eY(e,this.offset)]}}}class sg extends si{get _name(){return"select"}get _optionsUtil(){return new nY({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[rP(e,this.selections)]}}_readUserData(e){super._readUserData(e),sv(this.selections,e)}}class sy extends si{get _name(){return"sort"}get _optionsUtil(){return new nY({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map(t=>t._toProto(e))}}_readUserData(e){super._readUserData(e),sv(this.orderings,e)}}class sw extends si{get _name(){return"replace_with"}get _optionsUtil(){return new nY({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),rO(sw.Pr)]}}_readUserData(e){super._readUserData(e),sv(this.map,e)}}function sv(e,t){return"function"==typeof e._readUserData?e._readUserData(t):Array.isArray(e)?e.forEach(e=>e._readUserData(t)):e instanceof Map?e.forEach(e=>e._readUserData(t)):Object.values(e).forEach(e=>e._readUserData(t)),e}sw.Pr="full_replace";// Copyright 2024 Google LLC* @license
class s_{constructor(e,t,r){this.serializer=e,this.stages=t,this.listenOptions=r,this.isCorePipeline=!0}getPipelineCollection(){return sT(this)}getPipelineCollectionGroup(){return sx(this)}getPipelineCollectionId(){return function(e){switch(sE(e)){case"collection":return F.fromString(sT(e)).lastSegment();case"collection_group":return sx(e);default:return}}(this)}getPipelineDocuments(){return sb(this)}getPipelineFlavor(){var e;let t;return e=this,t="exact",e.stages.forEach((r,n)=>{r._name!==su.name&&r._name!==so.name||(t="keyless"),r._name===sg.name&&"exact"===t&&(t="augmented"),r._name===sa.name&&n<e.stages.length-1&&"exact"===t&&(t="augmented")}),t}getPipelineSourceType(){return sE(this)}}function sE(e){let t=e.stages[0];return t instanceof sl||t instanceof sc||t instanceof sh||t instanceof sd?t._name:"unknown"}function sT(e){if("collection"===sE(e))return e.stages[0].Er}function sx(e){if("collection_group"===sE(e))return e.stages[0].collectionId}function sb(e){if("documents"===sE(e))return e.stages[0].hr}class sN{constructor(e,t){this.type=e,this.value=t}static dr(){return new sN("ERROR",void 0)}static mr(){return new sN("UNSET",void 0)}static pr(){return new sN("NULL",eN)}static newValue(e){return eq(e)?new sN("NULL",eN):e&&"booleanValue"in e?new sN("BOOLEAN",e):eO(e)?new sN("INT",e):eU(e)?new sN("DOUBLE",e):e&&"timestampValue"in e&&e.timestampValue?new sN("TIMESTAMP",e):e&&"stringValue"in e?new sN("STRING",e):e&&"bytesValue"in e?new sN("BYTES",e):e.referenceValue?new sN("REFERENCE",e):e.geoPointValue?new sN("GEO_POINT",e):eF(e)?new sN("ARRAY",e):ez(e)?new sN("VECTOR",e):eB(e)?new sN("MAP",e):new sN("ERROR",void 0)}gr(){return"ERROR"===this.type||"UNSET"===this.type}yr(){return"NULL"===this.type}}function sS(e){if(!e.gr())return e.value}function sI(e){return e instanceof se?e._expr:e}function sC(e){if((e=sI(e))instanceof n6)return new sV(e);if(e instanceof n9)return new sA(e);if(e instanceof n4)return new sD(e);if(e instanceof n7){if("add"===e.name)return new sM(e);if("subtract"===e.name)return new sF(e);if("multiply"===e.name)return new sq(e);if("divide"===e.name)return new s$(e);if("mod"===e.name)return new sB(e);if("and"===e.name)return new sz(e);if("equal"===e.name)return new s6(e);if("not_equal"===e.name)return new s9(e);if("less_than"===e.name)return new s5(e);if("less_than_or_equal"===e.name)return new s8(e);if("greater_than"===e.name)return new s7(e);if("greater_than_or_equal"===e.name)return new ie(e);if("array_concat"===e.name)return new it(e);if("array_reverse"===e.name)return new ir(e);if("array_contains"===e.name)return new is(e);if("array_contains_all"===e.name)return new ii(e);if("array_contains_any"===e.name)return new ia(e);if("array_length"===e.name)return new io(e);if("array_element"===e.name)return new iu(e);if("equal_any"===e.name)return new sQ(e);if("not_equal_any"===e.name)return new sW(e);if("is_nan"===e.name)return new sH(e);if("is_not_nan"===e.name)return new sY(e);if("is_null"===e.name)return new sJ(e);if("is_not_null"===e.name)return new sX(e);if("is_error"===e.name)return new sZ(e);if("exists"===e.name)return new s0(e);if("not"===e.name)return new sj(e);if("or"===e.name)return new sG(e);if("xor"===e.name)return new sK(e);if("conditional"===e.name)return new s1(e);if("maximum"===e.name)return new s2(e);if("minimum"===e.name)return new s3(e);if("reverse"===e.name)return new il(e);if("replace_first"===e.name)return new ic(e);if("replace_all"===e.name)return new ih(e);if("char_length"===e.name)return new id(e);if("byte_length"===e.name)return new im(e);if("like"===e.name)return new ig(e);if("regex_contains"===e.name)return new iy(e);if("regex_match"===e.name)return new iw(e);if("string_contains"===e.name)return new iv(e);if("starts_with"===e.name)return new i_(e);if("ends_with"===e.name)return new iE(e);if("to_lower"===e.name)return new iT(e);if("to_upper"===e.name)return new ix(e);if("trim"===e.name)return new ib(e);if("string_concat"===e.name)return new iN(e);if("map_get"===e.name)return new iS(e);if("cosine_distance"===e.name)return new iC(e);if("dot_product"===e.name)return new iV(e);if("euclidean_distance"===e.name)return new iA(e);if("vector_length"===e.name)return new iD(e);if("unix_micros_to_timestamp"===e.name)return new iG(e);if("timestamp_to_unix_micros"===e.name)return new iH(e);if("unix_millis_to_timestamp"===e.name)return new iK(e);if("timestamp_to_unix_millis"===e.name)return new iY(e);if("unix_seconds_to_timestamp"===e.name)return new iQ(e);if("timestamp_to_unix_seconds"===e.name)return new iJ(e);if("timestamp_add"===e.name)return new iZ(e);if("timestamp_subtract"===e.name)return new i0(e)}throw Error(`Unknown Expr : ${e}`)}class sV{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===U){var r,n;return sN.newValue({referenceValue:(r=e.serializer,n=t.key,rb(r.databaseId,n.path))})}if("__update_time__"===this.expr.fieldName)return sN.newValue({timestampValue:rT(e.serializer,t.version)});if("__create_time__"===this.expr.fieldName)return sN.newValue({timestampValue:rT(e.serializer,t.createTime)});let s=t.data.field(this.expr._fieldPath);return s?ed(s)?sN.newValue(function(e,t){if("estimate"===e.serverTimestampBehavior)return{timestampValue:rT(e.serializer,tV.fromTimestamp(ef(t)))};if("previous"===e.serverTimestampBehavior){let e=em(t);if(e)return e}return{nullValue:"NULL_VALUE"}}(e,s)):sN.newValue(s):sN.mr()}}class sA{constructor(e){this.expr=e}evaluate(e,t){return sN.newValue(this.expr._getValue())}}class sD{constructor(e){this.expr=e}evaluate(e,t){let r=this.expr.ur.map(r=>sC(r).evaluate(e,t));return r.some(e=>e.gr())?sN.dr():sN.newValue({arrayValue:{values:r.map(e=>e.value)}})}}function sk(e){return eU(e)?Number(e.doubleValue):Number(e.integerValue)}function sL(e){return BigInt(e.integerValue)}let sR=BigInt("0x7fffffffffffffff"),sP=-BigInt("0x8000000000000000");class sO{constructor(e){this.expr=e}evaluate(e,t){b(this.expr.params.length>=2,24778);let r=sC(this.expr.params[0]).evaluate(e,t),n=sC(this.expr.params[1]).evaluate(e,t),s=this.wr(r,n);for(let r of this.expr.params.slice(2)){let n=sC(r).evaluate(e,t);s=this.wr(s,n)}return s}wr(e,t){if(e.gr()||t.gr())return sN.dr();if(e.yr()||t.yr())return sN.pr();let r=e.value,n=t.value;if(!eU(r)&&!eO(r)||!eU(n)&&!eO(n))return sN.dr();if(eU(r)||eU(n)){let e=this.br(r,n);return e?sN.newValue(e):sN.dr()}if(eO(r)&&eO(n)){let e=this.Sr(r,n);return void 0===e?sN.dr():"number"==typeof e?sN.newValue({doubleValue:e}):e<sP||e>sR?sN.dr():sN.newValue({integerValue:`${e}`})}return sN.dr()}}function sU(e,t){return eC(e)!==eC(t)?"TYPE_MISMATCH":e$(e)||e$(t)?"NOT_EQ":eq(e)&&eq(t)?"EQ":eq(e)||eq(t)?"NULL":eF(e)&&eF(t)?function(e,t){if(e.values?.length!==t.values?.length)return"NOT_EQ";let r=!1;for(let n=0;n<(e.values?.length??0);n++){let s=e.values[n],i=t.values[n];switch(sU(s,i)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":r=!0;break;default:T(44609,{vr:s,Dr:i})}}return r?"NULL":"EQ"}(e.arrayValue,t.arrayValue):ez(e)&&ez(t)||eB(e)&&eB(t)?function(e,t){let r=e.fields||{},n=t.fields||{};if(z(r)!==z(n))return"NOT_EQ";let s=!1;for(let e in r)if(r.hasOwnProperty(e)){if(void 0===n[e])return"NOT_EQ";switch(sU(r[e],n[e])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":s=!0}}return s?"NULL":"EQ"}(e.mapValue,t.mapValue):eV(e,t,{o:!1,t:!0,i:!0})?"EQ":"NOT_EQ"}class sM extends sO{Sr(e,t){return sL(e)+sL(t)}br(e,t){return{doubleValue:sk(e)+sk(t)}}}class sF extends sO{constructor(e){super(e),this.expr=e}Sr(e,t){return sL(e)-sL(t)}br(e,t){return{doubleValue:sk(e)-sk(t)}}}class sq extends sO{constructor(e){super(e),this.expr=e}Sr(e,t){return sL(e)*sL(t)}br(e,t){return{doubleValue:sk(e)*sk(t)}}}class s$ extends sO{constructor(e){super(e),this.expr=e}Sr(e,t){let r=sL(t);if(r!==BigInt(0))return sL(e)/r}br(e,t){let r=sk(t);return 0===r?{doubleValue:ev(r)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:sk(e)/r}}}class sB extends sO{constructor(e){super(e),this.expr=e}Sr(e,t){let r=sL(t);if(r!==BigInt(0))return sL(e)%r}br(e,t){let r=sk(t);if(0!==r)return{doubleValue:sk(e)%r}}}class sz{constructor(e){this.expr=e}evaluate(e,t){let r=!1,n=!1;for(let s of this.expr.params){let i=sC(s).evaluate(e,t);switch(i.type){case"BOOLEAN":if(!i.value?.booleanValue)return sN.newValue(eI);break;case"NULL":n=!0;break;default:r=!0}}return r?sN.dr():n?sN.pr():sN.newValue(eS)}}class sj{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,9634);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return sN.newValue({booleanValue:!r.value?.booleanValue});case"NULL":return sN.pr();default:return sN.dr()}}}class sG{constructor(e){this.expr=e}evaluate(e,t){let r=!1,n=!1;for(let s of this.expr.params){let i=sC(s).evaluate(e,t);switch(i.type){case"BOOLEAN":if(i.value?.booleanValue)return sN.newValue(eS);break;case"NULL":n=!0;break;default:r=!0}}return r?sN.dr():n?sN.pr():sN.newValue(eI)}}class sK{constructor(e){this.expr=e}evaluate(e,t){let r=!1,n=!1;for(let s of this.expr.params){let i=sC(s).evaluate(e,t);switch(i.type){case"BOOLEAN":r=sK.xor(r,!!i.value?.booleanValue);break;case"NULL":n=!0;break;default:return sN.dr()}}return n?sN.pr():sN.newValue({booleanValue:r})}static xor(e,t){return(e||t)&&!(e&&t)}}class sQ{constructor(e){this.expr=e}evaluate(e,t){b(2===this.expr.params.length,55094);let r=!1,n=sC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":r=!0;break;case"ERROR":case"UNSET":return sN.dr()}let s=sC(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return sN.dr()}if(r)return sN.pr();for(let e of s.value?.arrayValue?.values??[])switch(eq(n.value)&&eq(e)?"EQ":sU(n.value,e)){case"EQ":return sN.newValue(eS);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:T(44608,{value:n.value,candidate:e})}return r?sN.pr():sN.newValue(eI)}}class sW{constructor(e){this.expr=e}evaluate(e,t){return new sj(new n7("not",[new n7("equal_any",this.expr.params)])).evaluate(e,t)}}class sH{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,23322);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return sN.newValue(eI);case"DOUBLE":return sN.newValue({booleanValue:isNaN(sk(r.value))});case"NULL":return sN.pr();default:return sN.dr()}}}class sY{constructor(e){this.expr=e}evaluate(e,t){return b(1===this.expr.params.length,50406),new sj(new n7("not",[new n7("is_nan",this.expr.params)])).evaluate(e,t)}}class sJ{constructor(e){this.expr=e}evaluate(e,t){switch(b(1===this.expr.params.length,23123),sC(this.expr.params[0]).evaluate(e,t).type){case"NULL":return sN.newValue(eS);case"UNSET":case"ERROR":return sN.dr();default:return sN.newValue(eI)}}}class sX{constructor(e){this.expr=e}evaluate(e,t){return b(1===this.expr.params.length,23167),new sj(new n7("not",[new n7("is_null",this.expr.params)])).evaluate(e,t)}}class sZ{constructor(e){this.expr=e}evaluate(e,t){return b(1===this.expr.params.length,5228),"ERROR"===sC(this.expr.params[0]).evaluate(e,t).type?sN.newValue(eS):sN.newValue(eI)}}class s0{constructor(e){this.expr=e}evaluate(e,t){switch(b(1===this.expr.params.length,6877),sC(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return sN.dr();case"UNSET":return sN.newValue(eI);default:return sN.newValue(eS)}}}class s1{constructor(e){this.expr=e}evaluate(e,t){b(3===this.expr.params.length,11706);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return r.value?.booleanValue?sC(this.expr.params[1]).evaluate(e,t):sC(this.expr.params[2]).evaluate(e,t);case"NULL":return sC(this.expr.params[2]).evaluate(e,t);default:return sN.dr()}}}class s2{constructor(e){this.expr=e}evaluate(e,t){let r;for(let n of this.expr.params.map(r=>sC(r).evaluate(e,t)))switch(n.type){case"ERROR":case"UNSET":case"NULL":continue;default:r=void 0===r||eD(n.value,r.value)>0?n:r}return void 0===r?sN.pr():r}}class s3{constructor(e){this.expr=e}evaluate(e,t){let r;for(let n of this.expr.params.map(r=>sC(r).evaluate(e,t)))switch(n.type){case"ERROR":case"UNSET":case"NULL":continue;default:r=void 0===r||0>eD(n.value,r.value)?n:r}return void 0===r?sN.pr():r}}class s4{constructor(e){this.expr=e}evaluate(e,t){b(2===this.expr.params.length,31033,`${this.expr.name}() function should have exactly 2 params`);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"ERROR":case"UNSET":return sN.dr()}let n=sC(this.expr.params[1]).evaluate(e,t);switch(n.type){case"ERROR":case"UNSET":return sN.dr()}return this.Cr(r,n)}}class s6 extends s4{constructor(e){super(e),this.expr=e}Cr(e,t){if(e.yr()&&t.yr())return sN.newValue(eS);if(e.yr()||t.yr()||e$(e.value)||e$(t.value)||eC(e.value)!==eC(t.value))return sN.newValue(eI);switch(sU(e.value,t.value)){case"EQ":return sN.newValue(eS);case"NOT_EQ":return sN.newValue(eI);case"NULL":return sN.pr();default:T(44615,{left:e,right:t})}}}class s9 extends s4{constructor(e){super(e),this.expr=e}Cr(e,t){switch(sU(e.value,t.value)){case"EQ":return sN.newValue(eI);case"NOT_EQ":case"TYPE_MISMATCH":return sN.newValue(eS);case"NULL":return sN.pr();default:T(44614,{left:e,right:t})}}}class s5 extends s4{constructor(e){super(e),this.expr=e}Cr(e,t){return eC(e.value)!==eC(t.value)||e$(e.value)||e$(t.value)?sN.newValue(eI):sN.newValue({booleanValue:0>eD(e.value,t.value)})}}class s8 extends s4{constructor(e){super(e),this.expr=e}Cr(e,t){return eC(e.value)!==eC(t.value)||e$(e.value)||e$(t.value)?sN.newValue(eI):"EQ"===sU(e.value,t.value)?sN.newValue(eS):sN.newValue({booleanValue:0>eD(e.value,t.value)})}}class s7 extends s4{constructor(e){super(e),this.expr=e}Cr(e,t){return eC(e.value)!==eC(t.value)||e$(e.value)||e$(t.value)?sN.newValue(eI):sN.newValue({booleanValue:eD(e.value,t.value)>0})}}class ie extends s4{constructor(e){super(e),this.expr=e}Cr(e,t){return eC(e.value)!==eC(t.value)||e$(e.value)||e$(t.value)?sN.newValue(eI):"EQ"===sU(e.value,t.value)?sN.newValue(eS):sN.newValue({booleanValue:eD(e.value,t.value)>0})}}class it{constructor(e){this.expr=e}evaluate(e,t){throw Error("Unimplemented")}}class ir{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,216);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return sN.pr();case"ARRAY":{let e=r.value.arrayValue?.values??[];return sN.newValue({arrayValue:{values:[...e].reverse()}})}default:return sN.dr()}}}class is{constructor(e){this.expr=e}evaluate(e,t){return b(2===this.expr.params.length,52884),new sQ(new n7("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class ii{constructor(e){this.expr=e}evaluate(e,t){b(2===this.expr.params.length,1392);let r=!1,n=sC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"ARRAY":break;case"NULL":r=!0;break;default:return sN.dr()}let s=sC(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return sN.dr()}if(r)return sN.pr();let i=s.value?.arrayValue?.values??[],a=n.value?.arrayValue?.values??[];for(let e of i){let t=!1;for(let n of(r=!1,a)){switch(eq(e)&&eq(n)?"EQ":sU(e,n)){case"EQ":t=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:T(44613,{value:n,search:e})}if(t)break}if(!t)return sN.newValue(eI)}return sN.newValue(eS)}}class ia{constructor(e){this.expr=e}evaluate(e,t){b(2===this.expr.params.length,2680);let r=!1,n=sC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"ARRAY":break;case"NULL":r=!0;break;default:return sN.dr()}let s=sC(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return sN.dr()}if(r)return sN.pr();let i=s.value?.arrayValue?.values??[];for(let e of n.value?.arrayValue?.values??[])for(let t of i)switch(eq(e)&&eq(t)?"EQ":sU(e,t)){case"EQ":return sN.newValue(eS);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:T(60403,{value:e,search:t})}return r?sN.pr():sN.newValue(eI)}}class io{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,38605);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return sN.pr();case"ARRAY":return sN.newValue({integerValue:`${r.value?.arrayValue?.values?.length??0}`});default:return sN.dr()}}}class iu{constructor(e){this.expr=e}evaluate(e,t){throw Error("Unimplemented")}}class il{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,1508);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return sN.pr();case"BYTES":{let e=r.value?.bytesValue;if("string"==typeof e){let t=en.fromBase64String(e).toUint8Array();return t.reverse(),sN.newValue({bytesValue:en.fromUint8Array(t).toBase64()})}return sN.newValue({bytesValue:new Uint8Array(e).reverse()})}case"STRING":{let e=r.value?.stringValue,t=Array.from(new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(e),e=>e.segment).reverse();return sN.newValue({stringValue:t.join("")})}default:return sN.dr()}}}class ic{constructor(e){this.expr=e}evaluate(e,t){throw Error("Unimplemented")}}class ih{constructor(e){this.expr=e}evaluate(e,t){throw Error("Unimplemented")}}class id{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,19400);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return sN.pr();case"STRING":{let e=function(e){let t=0;for(let r=0;r<e.length;r++){let n=e.codePointAt(r);if(void 0===n)return;if(n<=65535){if(n>=55296&&n<=57343){if(n<=56319){let n=e.codePointAt(r+1);void 0!==n&&n>=56320&&n<=57343?(t+=1,r++):t+=1}else t+=1}else t+=1}else{if(!(n<=1114111))return;t+=1,r++}}return t}(r.value.stringValue);return void 0===e?sN.dr():sN.newValue({integerValue:e})}default:return sN.dr()}}}class im{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,8486);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BYTES":{let e=r.value?.bytesValue;return"string"==typeof e?sN.newValue({integerValue:en.fromBase64String(e).toUint8Array().length}):sN.newValue({integerValue:new Uint8Array(e).length})}case"STRING":{let e=function(e){let t=0;for(let r=0;r<e.length;r++){let n=e.codePointAt(r);if(void 0===n)return;if(n>=55296&&n<=57343){if(!(n<=56319))return;{let n=e.codePointAt(r+1);if(void 0===n||!(n>=56320&&n<=57343))return;t+=4,r++}}else if(n<=127)t+=1;else if(n<=2047)t+=2;else if(n<=65535)t+=3;else{if(!(n<=1114111))return;t+=4,r++}}return t}(r.value?.stringValue);return void 0===e?sN.dr():sN.newValue({integerValue:e})}case"NULL":return sN.pr();default:return sN.dr()}}}class ip{constructor(e){this.expr=e}evaluate(e,t){b(2===this.expr.params.length,39773,`${this.expr.name}() function should have exactly two parameters`);let r=!1,n=sC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":break;case"NULL":r=!0;break;default:return sN.dr()}let s=sC(this.expr.params[1]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":r=!0;break;default:return sN.dr()}return r?sN.pr():this.Fr(n.value?.stringValue,s.value?.stringValue)}}class ig extends ip{Fr(e,t){try{let r=function(e){let t="";for(let r=0;r<e.length;r++){let n=e.charAt(r);switch(n){case"_":t+=".";break;case"%":t+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":t+="\\"+n;break;default:t+=n}}return"^"+t+"$"}(t),n=d.n_.compile(r);return sN.newValue({booleanValue:n.matches(e)})}catch(e){return _(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${e}`),sN.dr()}}}class iy extends ip{Fr(e,t){try{let r=d.n_.compile(t);return sN.newValue({booleanValue:r.test(e)})}catch(e){return _(`Invalid regex pattern found in regex_contains: ${t}, returning error`),sN.dr()}}}class iw extends ip{Fr(e,t){try{return sN.newValue({booleanValue:d.n_.compile(t).matches(e)})}catch(e){return _(`Invalid regex pattern found in regex_match: ${t}, returning error`),sN.dr()}}}class iv extends ip{Fr(e,t){return sN.newValue({booleanValue:e.includes(t)})}}class i_ extends ip{Fr(e,t){return sN.newValue({booleanValue:e.startsWith(t)})}}class iE extends ip{Fr(e,t){return sN.newValue({booleanValue:e.endsWith(t)})}}class iT{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,29079);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return sN.newValue({stringValue:r.value?.stringValue?.toLowerCase()});case"NULL":return sN.pr();default:return sN.dr()}}}class ix{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,60487);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return sN.newValue({stringValue:r.value?.stringValue?.toUpperCase()});case"NULL":return sN.pr();default:return sN.dr()}}}class ib{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,28544);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return sN.newValue({stringValue:r.value?.stringValue?.trim()});case"NULL":return sN.pr();default:return sN.dr()}}}class iN{constructor(e){this.expr=e}evaluate(e,t){let r=this.expr.params.map(r=>sC(r).evaluate(e,t)),n="",s=!1;for(let e of r)switch(e.type){case"STRING":n+=e.value.stringValue;break;case"NULL":s=!0;break;default:return sN.dr()}return s?sN.pr():sN.newValue({stringValue:n})}}class iS{constructor(e){this.expr=e}evaluate(e,t){b(2===this.expr.params.length,4483);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"UNSET":return sN.mr();case"MAP":break;default:return sN.dr()}let n=sC(this.expr.params[1]).evaluate(e,t);if("STRING"!==n.type)return sN.dr();let s=r.value?.mapValue?.fields?.[n.value?.stringValue];return void 0===s?sN.mr():sN.newValue(s)}}class iI{constructor(e){this.expr=e}evaluate(e,t){b(2===this.expr.params.length,25231,`${this.expr.name}() function should have exactly 2 params`);let r=!1,n=sC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"VECTOR":break;case"NULL":r=!0;break;default:return sN.dr()}let s=sC(this.expr.params[1]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":r=!0;break;default:return sN.dr()}if(r)return sN.pr();let i=ej(n.value),a=ej(s.value);if(void 0===i||void 0===a||i.values?.length!==a.values?.length)return sN.dr();let o=this.Or(i,a);return void 0===o||isNaN(o)?sN.dr():sN.newValue({doubleValue:o})}}class iC extends iI{Or(e,t){let r=e?.values??[],n=t?.values??[];if(0===r.length)return;let s=0,i=0,a=0;for(let e=0;e<r.length;e++){if(!eM(r[e])||!eM(n[e]))return;let t=sk(r[e]),o=sk(n[e]);s+=t*o,i+=t*t,a+=o*o}let o=Math.sqrt(i)*Math.sqrt(a);if(0!==o)return 1-Math.max(-1,Math.min(1,s/o))}}class iV extends iI{Or(e,t){let r=e?.values??[],n=t?.values??[];if(0===r.length)return 0;let s=0;for(let e=0;e<r.length;e++){if(!eM(r[e])||!eM(n[e]))return;s+=sk(r[e])*sk(n[e])}return s}}class iA extends iI{Or(e,t){let r=e?.values??[],n=t?.values??[];if(0===r.length)return 0;let s=0;for(let e=0;e<r.length;e++){if(!eM(r[e])||!eM(n[e]))return;s+=Math.pow(sk(r[e])-sk(n[e]),2)}return Math.sqrt(s)}}class iD{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,39044);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"VECTOR":{let e=ej(r.value);return sN.newValue({integerValue:e?.values?.length??0})}case"NULL":return sN.pr();default:return sN.dr()}}}let ik=BigInt(-62135596800),iL=BigInt(253402300799),iR=BigInt(1e3),iP=BigInt(1e6),iO=ik*iR,iU=iL*iR+BigInt(999),iM=ik*iP,iF=iL*iP+BigInt(999999);function iq(e){return e>=iM&&e<=iF}function i$(e,t){let r=BigInt(e);return!(r<ik||r>iL)&&!(t<0||t>=1e9)&&(r!==ik||0===t)&&!(r===iL&&t>999999999)}function iB(e,t){return t<0?{seconds:e-1,nanos:t+1e9}:{seconds:e,nanos:t}}function iz(e){return BigInt(e.seconds)*iP+BigInt(Math.trunc(e.nanoseconds/1e3))}class ij{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,49262,`${this.expr.name}() function should have exactly one parameter`);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return this.toTimestamp(BigInt(r.value.integerValue));case"NULL":return sN.pr();default:return sN.dr()}}}class iG extends ij{toTimestamp(e){if(!iq(e))return sN.dr();let t=Number(e/iP),r=Number(e%iP*BigInt(1e3)),n=iB(t,r);return i$(t=n.seconds,r=n.nanos)?sN.newValue({timestampValue:{seconds:t,nanos:r}}):sN.dr()}}class iK extends ij{toTimestamp(e){if(!(e>=iO&&e<=iU))return sN.dr();let t=Number(e/iR),r=Number(e%iR*BigInt(1e6)),n=iB(t,r);return i$(t=n.seconds,r=n.nanos)?sN.newValue({timestampValue:{seconds:t,nanos:r}}):sN.dr()}}class iQ extends ij{toTimestamp(e){if(!(e>=ik&&e<=iL))return sN.dr();let t=Number(e);return sN.newValue({timestampValue:{seconds:t,nanos:0}})}}class iW{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,1265,`${this.expr.name}() function should have exactly one parameter`);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"TIMESTAMP":break;case"NULL":return sN.pr();default:return sN.dr()}let n=r_(r.value.timestampValue);return i$(n.seconds,n.nanoseconds)?this.Mr(n):sN.dr()}}class iH extends iW{Mr(e){let t=iz(e);return iq(t)?sN.newValue({integerValue:`${t.toString()}`}):sN.dr()}}class iY extends iW{Mr(e){let t=iz(e),r=t/BigInt(1e3),n=t%BigInt(1e3);return r>BigInt(0)||n===BigInt(0)?sN.newValue({integerValue:r.toString()}):sN.newValue({integerValue:(r-BigInt(1)).toString()})}}class iJ extends iW{Mr(e){let t=BigInt(e.seconds);return t>=ik&&t<=iL?sN.newValue({integerValue:t.toString()}):sN.dr()}}class iX{constructor(e){this.expr=e}evaluate(e,t){let r,n;b(3===this.expr.params.length,2775,`${this.expr.name}() function should have exactly 3 parameters`);let s=!1,i=sC(this.expr.params[0]).evaluate(e,t);switch(i.type){case"TIMESTAMP":break;case"NULL":s=!0;break;default:return sN.dr()}let a=sC(this.expr.params[1]).evaluate(e,t);switch(a.type){case"STRING":if(void 0===(r=function(e){switch(e){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}}(a.value.stringValue)))return sN.dr();break;case"NULL":s=!0;break;default:return sN.dr()}let o=sC(this.expr.params[2]).evaluate(e,t);switch(o.type){case"INT":break;case"NULL":s=!0;break;default:return sN.dr()}if(s)return sN.pr();let u=BigInt(o.value.integerValue);try{switch(r){case"microsecond":n=u;break;case"millisecond":n=u*BigInt(1e3);break;case"second":n=u*BigInt(1e6);break;case"minute":n=u*BigInt(6e7);break;case"hour":n=u*BigInt(36e8);break;case"day":n=u*BigInt(864e8);break;default:return sN.dr()}if("microsecond"!==r&&u!==BigInt(0)&&n/u!==BigInt(this.Nr(r)))return sN.dr()}catch(e){return _(`Error during timestamp arithmetic: ${e}`),sN.dr()}let l=r_(i.value.timestampValue);if(!i$(l.seconds,l.nanoseconds))return sN.dr();let c=iz(l),h=this.Lr(c,n);if(!iq(h))return sN.dr();let d=Number(h/iP),m=h%iP,f=Number((m<0?m+iP:m)*BigInt(1e3)),p=m<0?d-1:d;return i$(p,f)?sN.newValue({timestampValue:{seconds:p,nanos:f}}):sN.dr()}Nr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class iZ extends iX{Lr(e,t){return e+t}}class i0 extends iX{Lr(e,t){return e-t}}function i1(e){if((e=sI(e))instanceof n6)return`fld(${e.fieldName})`;if(e instanceof n9){var t;return`cst(${null===(t=e.value)?"null":"number"==typeof t?t.toString():"string"==typeof t?`"${t}"`:t instanceof nb?`ref(${t.path})`:t instanceof nC?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})`}if(e instanceof n7)return`fn(${e.name},[${e.params.map(i1).join(",")}])`;if("ListOfExpressions"===e.expressionType)return`list([${e.ur.map(i1).join(",")}])`;throw Error(`Unrecognized expr ${JSON.stringify(e,null,2)}`)}function i2(e){return`${Array.from(e.entries()).sort().map(([e,t])=>`${e}=${i1(t)}`).join(",")}`}function i3(e){return e.stages.map(e=>(function(e){if(e instanceof sa)return`${e._name}(${i2(e.fields)})`;if(e instanceof so){let t=`${e._name}(${i2(e.accumulators)})`;return e.groups.size>0&&(t+=`grouping(${i2(e.groups)})`),t}if(e instanceof su)return`${e._name}(${i2(e.groups)})`;if(e instanceof sl)return`${e._name}(${e.Er})`;if(e instanceof sc)return`${e._name}(${e.collectionId})`;if(e instanceof sh)return`${e._name}()`;if(e instanceof sd)return`${e._name}(${e.hr.sort()})`;if(e instanceof sm)return`${e._name}(${i1(e.condition)})`;if(e instanceof sf)return`${e._name}(${e.limit})`;if(e instanceof sy)return`${e._name}(${e.orderings.map(e=>`${i1(e.expr)}${e.direction}`).join(",")})`;throw Error(`Unrecognized stage ${e._name}`)})(e)).join("|")}function i4(e){return e instanceof s_}function i6(e){return i4(e)?i3(e):tY(e)}function i9(e){return i4(e)?i3(e):`${tP(tj(e))}|lt:${e.limitType}`}function i5(e,t){return e instanceof s_&&t instanceof s_?i3(e)===i3(t):!(e instanceof s_&&!(t instanceof s_)||!(e instanceof s_)&&t instanceof s_)&&tO(tj(e),tj(t))&&e.limitType===t.limitType}function i8(e){return tU(e)?i3(e):tP(e)}function i7(e,t){return e instanceof s_&&t instanceof s_?i3(e)===i3(t):!(e instanceof s_&&!(t instanceof s_)||!(e instanceof s_)&&t instanceof s_)&&tO(e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ae{constructor(e,t,r,n){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=n}applyToRemoteDocument(e,t){let r=t.mutationResults;for(let t=0;t<this.mutations.length;t++){let s=this.mutations[t];if(s.key.isEqual(e.key)){var n;n=r[t],s instanceof ta?function(e,t,r){let n=e.value.clone(),s=tl(e.fieldTransforms,t,r.transformResults);n.setAll(s),t.convertToFoundDocument(r.version,n).setHasCommittedMutations()}(s,e,n):s instanceof to?function(e,t,r){if(!tt(e.precondition,t))return void t.convertToUnknownDocument(r.version);let n=tl(e.fieldTransforms,t,r.transformResults),s=t.data;s.setAll(tu(e)),s.setAll(n),t.convertToFoundDocument(r.version,s).setHasCommittedMutations()}(s,e,n):function(e,t,r){t.convertToNoDocument(r.version).setHasCommittedMutations()}(0,e,n)}}}applyToLocalView(e,t){for(let r of this.baseMutations)r.key.isEqual(e.key)&&(t=ts(r,e,t,this.localWriteTime));for(let r of this.mutations)r.key.isEqual(e.key)&&(t=ts(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){let r=t6();return this.mutations.forEach(n=>{let s=e.get(n.key),i=s.overlayedDocument,a=this.applyToLocalView(i,s.mutatedFields),o=tn(i,a=t.has(n.key)?null:a);null!==o&&r.set(n.key,o),i.isValidDocument()||i.convertToNoDocument(tV.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),t5())}isEqual(e){return this.batchId===e.batchId&&V(this.mutations,e.mutations,(e,t)=>ti(e,t))&&V(this.baseMutations,e.baseMutations,(e,t)=>ti(e,t))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class at{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return null!==e&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ar{constructor(e,t,r,n,s=tV.min(),i=tV.min(),a=en.EMPTY_BYTE_STRING,o=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=n,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=i,this.resumeToken=a,this.expectedCount=o}withSequenceNumber(e){return new ar(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new ar(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new ar(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new ar(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class an{constructor(e){this.qr=e}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class as{constructor(){}Xr(e,t){this.ei(e,t),t.ti()}ei(e,t){if("nullValue"in e)this.ni(t,5);else if("booleanValue"in e)this.ni(t,10),t.ri(e.booleanValue?1:0);else if("integerValue"in e)this.ni(t,15),t.ri(ea(e.integerValue));else if("doubleValue"in e){let r=ea(e.doubleValue);isNaN(r)?this.ni(t,13):(this.ni(t,15),ev(r)?t.ri(0):t.ri(r))}else if("timestampValue"in e){let r=e.timestampValue;this.ni(t,20),"string"==typeof r&&(r=ei(r)),t.ii(`${r.seconds||""}`),t.ri(r.nanos||0)}else if("stringValue"in e)this.si(e.stringValue,t),this._i(t);else if("bytesValue"in e)this.ni(t,30),t.oi(eo(e.bytesValue)),this._i(t);else if("referenceValue"in e)this.ai(e.referenceValue,t);else if("geoPointValue"in e){let r=e.geoPointValue;this.ni(t,45),t.ri(r.latitude||0),t.ri(r.longitude||0)}else"mapValue"in e?eK(e)?this.ni(t,Number.MAX_SAFE_INTEGER):ez(e)?this.ui(e.mapValue,t):(this.ci(e.mapValue,t),this._i(t)):"arrayValue"in e?(this.li(e.arrayValue,t),this._i(t)):T(19022,{Ei:e})}si(e,t){this.ni(t,25),this.hi(e,t)}hi(e,t){t.ii(e)}ci(e,t){let r=e.fields||{};for(let e of(this.ni(t,55),Object.keys(r)))this.si(e,t),this.ei(r[e],t)}ui(e,t){let r=e.fields||{};this.ni(t,53);let n=r[eb].arrayValue?.values?.length||0;this.ni(t,15),t.ri(ea(n)),this.si(eb,t),this.ei(r[eb],t)}li(e,t){let r=e.values||[];for(let e of(this.ni(t,50),r))this.ei(e,t)}ai(e,t){this.ni(t,37),K.fromName(e).path.forEach(e=>{this.ni(t,60),this.hi(e,t)})}ni(e,t){e.ri(t)}_i(e){e.ri(2)}}as.Ti=new as;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ai{constructor(){this.Yi=new aa}addToCollectionParentIndex(e,t){return this.Yi.add(t),nm.resolve()}getCollectionParents(e,t){return nm.resolve(this.Yi.getEntries(t))}addFieldIndex(e,t){return nm.resolve()}deleteFieldIndex(e,t){return nm.resolve()}deleteAllFieldIndexes(e){return nm.resolve()}createTargetIndexes(e,t){return nm.resolve()}getDocumentsMatchingTarget(e,t){return nm.resolve(null)}getIndexType(e,t){return nm.resolve(0)}getFieldIndexes(e,t){return nm.resolve([])}getNextCollectionGroupToUpdate(e){return nm.resolve(null)}getMinOffset(e,t){return nm.resolve(tk.min())}getMinOffsetFromCollectionGroup(e,t){return nm.resolve(tk.min())}updateCollectionGroup(e,t,r){return nm.resolve()}updateIndexEntries(e,t){return nm.resolve()}}class aa{constructor(){this.index={}}add(e){let t=e.lastSegment(),r=e.popLast(),n=this.index[t]||new L(F.comparator),s=!n.has(r);return this.index[t]=n.add(r),s}has(e){let t=e.lastSegment(),r=e.popLast(),n=this.index[t];return n&&n.has(r)}getEntries(e){return(this.index[e]||new L(F.comparator)).toArray()}}new Uint8Array(0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ao{constructor(e){this.gs=e}next(){return this.gs+=2,this.gs}static ys(){return new ao(0)}static ws(){return new ao(-1)}}// Copyright 2024 Google LLC* @license
function au(e,t){let r=t;for(let t of e.stages)r=function(e,t,r){if(t instanceof sl)return r.filter(e=>e.isFoundDocument()&&`/${e.key.getCollectionPath().canonicalString()}`===t.Er);if(t instanceof sm)return r.filter(r=>{let n=sS(sC(t.condition).evaluate(e,r));return void 0!==n&&eV(n,eS)});if(t instanceof sc)return r.filter(e=>e.isFoundDocument()&&e.key.getCollectionPath().lastSegment()===t.collectionId);if(t instanceof sh)return r.filter(e=>e.isFoundDocument());if(t instanceof sd)return r.filter(e=>e.isFoundDocument()&&t.Tr.has(e.key.path.toStringWithLeadingSlash()));if(t instanceof sf)return r.slice(0,t.limit);if(t instanceof sy)return function(e,t,r){let n=t.orderings.map(e=>({Os:sC(e.expr),direction:e.direction}));return[...r].sort((t,r)=>{for(let{Os:s,direction:i}of n){let n=eD(sS(s.evaluate(e,t))??eN,sS(s.evaluate(e,r))??eN);if(0!==n)return"ascending"===i?n:-n}return 0})}(e,t,r);throw Error(`Unknown stage: ${t._name}`)}({serializer:e.serializer,serverTimestampBehavior:e.listenOptions?.serverTimestampBehavior},t,r);return r}function al(e,t){return au(e,[t]).length>0}function ac(e){let t=function(e){for(let t=e.stages.length-1;t>=0;t--){let r=e.stages[t];if(r instanceof sy)return r.orderings}throw Error("Pipeline must contain at least one Sort stage")}(e);return(r,n)=>{for(let s of t){let t=eD(sS(sC(s.expr).evaluate({serializer:e.serializer},r))||eN,sS(sC(s.expr).evaluate({serializer:e.serializer},n))||eN);if(0!==t)return"ascending"===s.direction?t:-t}return 0}}function ah(e){for(let t=e.stages.length-1;t>=0;t--){let r=e.stages[t];if(r instanceof sf)return{limit:r.limit}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ad{constructor(){this.changes=new t1(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,tA.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();let r=this.changes.get(t);return void 0!==r?nm.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class am{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class af{constructor(e,t,r,n){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=n}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(n=>(r=n,this.remoteDocumentCache.getEntry(e,t))).next(e=>(null!==r&&ts(r.mutation,e,B.empty(),et.now()),e))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(t=>this.getLocalViewOfDocuments(e,t,t5()).next(()=>t))}getLocalViewOfDocuments(e,t,r=t5()){let n=t6();return this.populateOverlays(e,n,t).next(()=>this.computeViews(e,t,n,r).next(e=>{let t=t4();return e.forEach((e,r)=>{t=t.insert(e,r.overlayedDocument)}),t}))}getOverlayedDocuments(e,t){let r=t6();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,t5()))}populateOverlays(e,t,r){let n=[];return r.forEach(e=>{t.has(e)||n.push(e)}),this.documentOverlayCache.getOverlays(e,n).next(e=>{e.forEach((e,r)=>{t.set(e,r)})})}computeViews(e,t,r,n){let s=t2,i=t6(),a=t6();return t.forEach((e,t)=>{let a=r.get(t.key);n.has(t.key)&&(void 0===a||a.mutation instanceof to)?s=s.insert(t.key,t):void 0!==a?(i.set(t.key,a.mutation.getFieldMask()),ts(a.mutation,t,a.mutation.getFieldMask(),et.now())):i.set(t.key,B.empty())}),this.recalculateAndSaveOverlays(e,s).next(e=>(e.forEach((e,t)=>i.set(e,t)),t.forEach((e,t)=>a.set(e,new am(t,i.get(e)??null))),a))}recalculateAndSaveOverlays(e,t){let r=t6(),n=new A((e,t)=>e-t),s=t5();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(e=>{for(let s of e)s.keys().forEach(e=>{let i=t.get(e);if(null===i)return;let a=r.get(e)||B.empty();a=s.applyToLocalView(i,a),r.set(e,a);let o=(n.get(s.batchId)||t5()).add(e);n=n.insert(s.batchId,o)})}).next(()=>{let i=[],a=n.getReverseIterator();for(;a.hasNext();){let n=a.getNext(),o=n.key,u=n.value,l=t6();u.forEach(e=>{if(!s.has(e)){let n=tn(t.get(e),r.get(e));null!==n&&l.set(e,n),s=s.add(e)}}),i.push(this.documentOverlayCache.saveOverlays(e,o,l))}return nm.waitFor(i)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(t=>this.recalculateAndSaveOverlays(e,t))}getDocumentsMatchingQuery(e,t,r,n){return i4(t)?this.getDocumentsMatchingPipeline(e,t,r,n):K.isDocumentKey(t.path)&&null===t.collectionGroup&&0===t.filters.length?this.getDocumentsMatchingDocumentQuery(e,t.path):tB(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,n):this.getDocumentsMatchingCollectionQuery(e,t,r,n)}getNextDocuments(e,t,r,n){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,n).next(s=>{let i=n-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,n-s.size):nm.resolve(t6()),a=-1,o=s;return i.next(t=>nm.forEach(t,(t,r)=>(a<r.largestBatchId&&(a=r.largestBatchId),s.get(t)?nm.resolve():this.remoteDocumentCache.getEntry(e,t).next(e=>{o=o.insert(t,e)}))).next(()=>this.populateOverlays(e,t,s)).next(()=>this.computeViews(e,o,t,t5())).next(e=>{let t;return{batchId:a,changes:(t=t3,e.forEach((e,r)=>t=t.insert(e,r.overlayedDocument)),t)}}))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new K(t)).next(e=>{let t=t4();return e.isFoundDocument()&&(t=t.insert(e.key,e)),t})}getDocumentsMatchingCollectionGroupQuery(e,t,r,n){let s=t.collectionGroup,i=t4();return this.indexManager.getCollectionParents(e,s).next(a=>nm.forEach(a,a=>{let o=new tF(a.child(s),null,t.explicitOrderBy.slice(),t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt);return this.getDocumentsMatchingCollectionQuery(e,o,r,n).next(e=>{e.forEach((e,t)=>{i=i.insert(e,t)})})}).next(()=>i))}getDocumentsMatchingCollectionQuery(e,t,r,n){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(i=>(s=i,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,n))).next(e=>this.retrieveMatchingLocalDocuments(s,e,e=>tJ(t,e)))}getDocumentsMatchingPipeline(e,t,r,n){if("collection_group"===sE(t)){let s=sx(t),i=t4();return this.indexManager.getCollectionParents(e,s).next(a=>nm.forEach(a,a=>{let o=function(e,t){let r=e.stages.map(e=>e instanceof sc?new sl(t.canonicalString(),{}):e);return new s_(e.serializer,r)}(t,a.child(s));return this.getDocumentsMatchingPipeline(e,o,r,n).next(e=>{e.forEach((e,t)=>{i=i.insert(e,t)})})}).next(()=>i))}{let s;return this.getOverlaysForPipeline(e,t,r.largestBatchId).next(i=>{switch(s=i,sE(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,n);case"documents":let a=t5();for(let e of sb(t))a=a.add(K.fromPath(e));return this.remoteDocumentCache.getEntries(e,a);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new O("invalid-argument",`Invalid pipeline source to execute offline: ${i3(t)}`)}}).next(e=>this.retrieveMatchingLocalDocuments(s,e,e=>al(t,e)))}}retrieveMatchingLocalDocuments(e,t,r){e.forEach((e,r)=>{let n=r.getKey();null===t.get(n)&&(t=t.insert(n,tA.newInvalidDocument(n)))});let n=t4();return t.forEach((t,s)=>{let i=e.get(t);void 0!==i&&ts(i.mutation,s,B.empty(),et.now()),r(s)&&(n=n.insert(t,s))}),n}getOverlaysForPipeline(e,t,r){switch(sE(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,F.fromString(sT(t)),r);case"collection_group":throw new O("invalid-argument",`Unexpected collection group pipeline: ${i3(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,sb(t).map(e=>K.fromPath(e)));case"database":return this.documentOverlayCache.getAllOverlays(e,r);default:throw new O("invalid-argument",`Failed to get overlays for pipeline: ${i3(t)}`)}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ap{constructor(e){this.serializer=e,this.Ks=new Map,this.Qs=new Map}getBundleMetadata(e,t){return nm.resolve(this.Ks.get(t))}saveBundleMetadata(e,t){return this.Ks.set(t.id,{id:t.id,version:t.version,createTime:rx(t.createTime)}),nm.resolve()}getNamedQuery(e,t){return nm.resolve(this.Qs.get(t))}saveNamedQuery(e,t){return this.Qs.set(t.name,{name:t.name,query:function(e){let t=function(e){var t;let r,n=function(e){let t=rS(e);return 4===t.length?F.emptyPath():rA(t)}(e.parent),s=e.structuredQuery,i=s.from?s.from.length:0,a=null;if(i>0){b(1===i,65062);let e=s.from[0];e.allDescendants?a=e.collectionId:n=n.child(e.collectionId)}let o=[];s.where&&(o=function(e){var t;let r=function e(t){return void 0!==t.unaryFilter?function(e){switch(e.unaryFilter.op){case"IS_NAN":let t=rk(e.unaryFilter.field);return tg.create(t,"==",{doubleValue:NaN});case"IS_NULL":let r=rk(e.unaryFilter.field);return tg.create(r,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":let n=rk(e.unaryFilter.field);return tg.create(n,"!=",{doubleValue:NaN});case"IS_NOT_NULL":let s=rk(e.unaryFilter.field);return tg.create(s,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return T(61313);default:return T(60726)}}(t):void 0!==t.fieldFilter?tg.create(rk(t.fieldFilter.field),function(e){switch(e){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return T(58110);default:return T(50506)}}(t.fieldFilter.op),t.fieldFilter.value):void 0!==t.compositeFilter?ty.create(t.compositeFilter.filters.map(t=>e(t)),function(e){switch(e){case"AND":return"and";case"OR":return"or";default:return T(1026)}}(t.compositeFilter.op)):T(30097,{filter:t})}(e);return r instanceof ty&&tv(t=r)&&tw(t)?r.getFilters():[r]}(s.where));let u=[];s.orderBy&&(u=s.orderBy.map(e=>new tC(rk(e.field),function(e){switch(e){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(e.direction))));let l=null;s.limit&&(l=null==(r="object"==typeof(t=s.limit)?t.value:t)?null:r);let c=null;s.startAt&&(c=function(e){let t=!!e.before;return new td(e.values||[],t)}(s.startAt));let h=null;return s.endAt&&(h=function(e){let t=!e.before;return new td(e.values||[],t)}(s.endAt)),new tF(n,a,u,o,l,"F",c,h)}({parent:e.parent,structuredQuery:e.structuredQuery});return"LAST"===e.limitType?tQ(t,t.limit,"L"):t}(t.bundledQuery),readTime:rx(t.readTime)}),nm.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ag{constructor(){this.overlays=new A(K.comparator),this.Ws=new Map}getOverlay(e,t){return nm.resolve(this.overlays.get(t))}getOverlays(e,t){let r=t6();return nm.forEach(t,t=>this.getOverlay(e,t).next(e=>{null!==e&&r.set(t,e)})).next(()=>r)}getAllOverlays(e,t){let r=t6();return this.overlays.forEach((e,n)=>{n.largestBatchId>t&&r.set(e,n)}),nm.resolve(r)}saveOverlays(e,t,r){return r.forEach((r,n)=>{this.Yr(e,t,n)}),nm.resolve()}removeOverlaysForBatchId(e,t,r){let n=this.Ws.get(r);return void 0!==n&&(n.forEach(e=>this.overlays=this.overlays.remove(e)),this.Ws.delete(r)),nm.resolve()}getOverlaysForCollection(e,t,r){let n=t6(),s=t.length+1,i=new K(t.child("")),a=this.overlays.getIteratorFrom(i);for(;a.hasNext();){let e=a.getNext().value,i=e.getKey();if(!t.isPrefixOf(i.path))break;i.path.length===s&&e.largestBatchId>r&&n.set(e.getKey(),e)}return nm.resolve(n)}getOverlaysForCollectionGroup(e,t,r,n){let s=new A((e,t)=>e-t),i=this.overlays.getIterator();for(;i.hasNext();){let e=i.getNext().value;if(e.getKey().getCollectionGroup()===t&&e.largestBatchId>r){let t=s.get(e.largestBatchId);null===t&&(t=t6(),s=s.insert(e.largestBatchId,t)),t.set(e.getKey(),e)}}let a=t6(),o=s.getIterator();for(;o.hasNext()&&(o.getNext().value.forEach((e,t)=>a.set(e,t)),!(a.size()>=n)););return nm.resolve(a)}Yr(e,t,r){let n=this.overlays.get(r.key);if(null!==n){let e=this.Ws.get(n.largestBatchId).delete(r.key);this.Ws.set(n.largestBatchId,e)}this.overlays=this.overlays.insert(r.key,new at(t,r));let s=this.Ws.get(t);void 0===s&&(s=t5(),this.Ws.set(t,s)),this.Ws.set(t,s.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ay{constructor(){this.sessionToken=en.EMPTY_BYTE_STRING}getSessionToken(e){return nm.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,nm.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aw{constructor(){this.Gs=new L(av.zs),this.js=new L(av.Hs)}isEmpty(){return this.Gs.isEmpty()}addReference(e,t){let r=new av(e,t);this.Gs=this.Gs.add(r),this.js=this.js.add(r)}Js(e,t){e.forEach(e=>this.addReference(e,t))}removeReference(e,t){this.Ys(new av(e,t))}Zs(e,t){e.forEach(e=>this.removeReference(e,t))}Xs(e){let t=new K(new F([])),r=new av(t,e),n=new av(t,e+1),s=[];return this.js.forEachInRange([r,n],e=>{this.Ys(e),s.push(e.key)}),s}e_(){this.Gs.forEach(e=>this.Ys(e))}Ys(e){this.Gs=this.Gs.delete(e),this.js=this.js.delete(e)}t_(e){let t=new K(new F([])),r=new av(t,e),n=new av(t,e+1),s=t5();return this.js.forEachInRange([r,n],e=>{s=s.add(e.key)}),s}containsKey(e){let t=new av(e,0),r=this.Gs.firstAfterOrEqual(t);return null!==r&&e.isEqual(r.key)}}class av{constructor(e,t){this.key=e,this.n_=t}static zs(e,t){return K.comparator(e.key,t.key)||S(e.n_,t.n_)}static Hs(e,t){return S(e.n_,t.n_)||K.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class a_{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Wr=1,this.r_=new L(av.zs)}checkEmpty(e){return nm.resolve(0===this.mutationQueue.length)}addMutationBatch(e,t,r,n){let s=this.Wr;this.Wr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];let i=new ae(s,t,r,n);for(let t of(this.mutationQueue.push(i),n))this.r_=this.r_.add(new av(t.key,s)),this.indexManager.addToCollectionParentIndex(e,t.key.path.popLast());return nm.resolve(i)}lookupMutationBatch(e,t){return nm.resolve(this.i_(t))}getNextMutationBatchAfterBatchId(e,t){let r=this.s_(t+1),n=r<0?0:r;return nm.resolve(this.mutationQueue.length>n?this.mutationQueue[n]:null)}getHighestUnacknowledgedBatchId(){return nm.resolve(0===this.mutationQueue.length?-1:this.Wr-1)}getAllMutationBatches(e){return nm.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){let r=new av(t,0),n=new av(t,Number.POSITIVE_INFINITY),s=[];return this.r_.forEachInRange([r,n],e=>{let t=this.i_(e.n_);s.push(t)}),nm.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new L(S);return t.forEach(e=>{let t=new av(e,0),n=new av(e,Number.POSITIVE_INFINITY);this.r_.forEachInRange([t,n],e=>{r=r.add(e.n_)})}),nm.resolve(this.__(r))}getAllMutationBatchesAffectingQuery(e,t){let r=t.path,n=r.length+1,s=r;K.isDocumentKey(s)||(s=s.child(""));let i=new av(new K(s),0),a=new L(S);return this.r_.forEachWhile(e=>{let t=e.key.path;return!!r.isPrefixOf(t)&&(t.length===n&&(a=a.add(e.n_)),!0)},i),nm.resolve(this.__(a))}__(e){let t=[];return e.forEach(e=>{let r=this.i_(e);null!==r&&t.push(r)}),t}removeMutationBatch(e,t){b(0===this.o_(t.batchId,"removed"),55003),this.mutationQueue.shift();let r=this.r_;return nm.forEach(t.mutations,n=>{let s=new av(n.key,t.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,n.key)}).next(()=>{this.r_=r})}jr(e){}containsKey(e,t){let r=new av(t,0),n=this.r_.firstAfterOrEqual(r);return nm.resolve(t.isEqual(n&&n.key))}performConsistencyCheck(e){return this.mutationQueue.length,nm.resolve()}o_(e,t){return this.s_(e)}s_(e){return 0===this.mutationQueue.length?0:e-this.mutationQueue[0].batchId}i_(e){let t=this.s_(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aE{constructor(e){this.a_=e,this.docs=new A(K.comparator),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){let r=t.key,n=this.docs.get(r),s=n?n.size:0,i=this.a_(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:i}),this.size+=i-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){let t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){let r=this.docs.get(t);return nm.resolve(r?r.document.mutableCopy():tA.newInvalidDocument(t))}getEntries(e,t){let r=t2;return t.forEach(e=>{let t=this.docs.get(e);r=r.insert(e,t?t.document.mutableCopy():tA.newInvalidDocument(e))}),nm.resolve(r)}getAllEntries(e){let t=t2;return this.docs.forEach((e,r)=>{t=t.insert(e,r.document)}),nm.resolve(t)}getDocumentsMatchingQuery(e,t,r,n){let s,i;i4(t)?(s=F.fromString(sT(t)),i=e=>al(t,e)):(s=t.path,i=e=>tJ(t,e));let a=t2,o=new K(s.child("__id-9223372036854775808__")),u=this.docs.getIteratorFrom(o);for(;u.hasNext();){let{key:e,value:{document:t}}=u.getNext();if(!s.isPrefixOf(e.path))break;e.path.length>s.length+1||0>=function(e,t){let r=e.readTime.compareTo(t.readTime);return 0!==r?r:0!==(r=K.comparator(e.documentKey,t.documentKey))?r:S(e.largestBatchId,t.largestBatchId)}(new tk(t.readTime,t.key,-1),r)||(n.has(t.key)||i(t))&&(a=a.insert(t.key,t.mutableCopy()))}return nm.resolve(a)}getAllFromCollectionGroup(e,t,r,n){T(9500)}u_(e,t){return nm.forEach(this.docs,e=>t(e))}newChangeBuffer(e){return new aT(this)}getSize(e){return nm.resolve(this.size)}}class aT extends ad{constructor(e){super(),this.qs=e}applyChanges(e){let t=[];return this.changes.forEach((r,n)=>{n.isValidDocument()?t.push(this.qs.addEntry(e,n)):this.qs.removeEntry(r)}),nm.waitFor(t)}getFromCache(e,t){return this.qs.getEntry(e,t)}getAllFromCache(e,t){return this.qs.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ax{constructor(e){this.persistence=e,this.c_=new t1(e=>i8(e),i7),this.lastRemoteSnapshotVersion=tV.min(),this.highestTargetId=0,this.l_=0,this.E_=new aw,this.targetCount=0,this.h_=ao.ys()}forEachTarget(e,t){return this.c_.forEach((e,r)=>t(r)),nm.resolve()}getLastRemoteSnapshotVersion(e){return nm.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return nm.resolve(this.l_)}allocateTargetId(e){return this.highestTargetId=this.h_.next(),nm.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.l_&&(this.l_=t),nm.resolve()}vs(e){this.c_.set(e.target,e);let t=e.targetId;t>this.highestTargetId&&(this.h_=new ao(t),this.highestTargetId=t),e.sequenceNumber>this.l_&&(this.l_=e.sequenceNumber)}addTargetData(e,t){return this.vs(t),this.targetCount+=1,nm.resolve()}updateTargetData(e,t){return this.vs(t),nm.resolve()}removeTargetData(e,t){return this.c_.delete(t.target),this.E_.Xs(t.targetId),this.targetCount-=1,nm.resolve()}removeTargets(e,t,r){let n=0,s=[];return this.c_.forEach((i,a)=>{a.sequenceNumber<=t&&null===r.get(a.targetId)&&(this.c_.delete(i),s.push(this.removeMatchingKeysForTargetId(e,a.targetId)),n++)}),nm.waitFor(s).next(()=>n)}getTargetCount(e){return nm.resolve(this.targetCount)}getTargetData(e,t){let r=this.c_.get(t)||null;return nm.resolve(r)}addMatchingKeys(e,t,r){return this.E_.Js(t,r),nm.resolve()}removeMatchingKeys(e,t,r){this.E_.Zs(t,r);let n=this.persistence.referenceDelegate,s=[];return n&&t.forEach(t=>{s.push(n.markPotentiallyOrphaned(e,t))}),nm.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.E_.Xs(t),nm.resolve()}getMatchingKeysForTargetId(e,t){let r=this.E_.t_(t);return nm.resolve(r)}containsKey(e,t){return nm.resolve(this.E_.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ab{constructor(e,t){this.T_={},this.overlays={},this.P_=new nc(0),this.R_=!1,this.R_=!0,this.I_=new ay,this.referenceDelegate=e(this),this.A_=new ax(this),this.indexManager=new ai,this.remoteDocumentCache=new aE(e=>this.referenceDelegate.V_(e)),this.serializer=new an(t),this.d_=new ap(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.R_=!1,Promise.resolve()}get started(){return this.R_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new ag,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.T_[e.toKey()];return r||(r=new a_(t,this.referenceDelegate),this.T_[e.toKey()]=r),r}getGlobalsCache(){return this.I_}getTargetCache(){return this.A_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.d_}runTransaction(e,t,r){w("MemoryPersistence","Starting transaction:",e);let n=new aN(this.P_.next());return this.referenceDelegate.f_(),r(n).next(e=>this.referenceDelegate.m_(n).next(()=>e)).toPromise().then(e=>(n.raiseOnCommittedEvent(),e))}p_(e,t){return nm.or(Object.values(this.T_).map(r=>()=>r.containsKey(e,t)))}}class aN extends nh{constructor(e){super(),this.currentSequenceNumber=e}}class aS{constructor(e){this.persistence=e,this.g_=new aw,this.y_=null}static w_(e){return new aS(e)}get b_(){if(this.y_)return this.y_;throw T(60996)}addReference(e,t,r){return this.g_.addReference(r,t),this.b_.delete(r.toString()),nm.resolve()}removeReference(e,t,r){return this.g_.removeReference(r,t),this.b_.add(r.toString()),nm.resolve()}markPotentiallyOrphaned(e,t){return this.b_.add(t.toString()),nm.resolve()}removeTarget(e,t){this.g_.Xs(t.targetId).forEach(e=>this.b_.add(e.toString()));let r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(e=>{e.forEach(e=>this.b_.add(e.toString()))}).next(()=>r.removeTargetData(e,t))}f_(){this.y_=new Set}m_(e){let t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return nm.forEach(this.b_,r=>{let n=K.fromPath(r);return this.S_(e,n).next(e=>{e||t.removeEntry(n,tV.min())})}).next(()=>(this.y_=null,t.apply(e)))}updateLimboDocument(e,t){return this.S_(e,t).next(e=>{e?this.b_.delete(t.toString()):this.b_.add(t.toString())})}V_(e){return 0}S_(e,t){return nm.or([()=>nm.resolve(this.g_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.p_(e,t)])}}class aI{constructor(e,t){this.persistence=e,this.v_=new t1(e=>(function(e){let t="";for(let r=0;r<e.length;r++)t.length>0&&(t+="\x01\x01"),t=function(e,t){let r=t,n=e.length;for(let t=0;t<n;t++){let n=e.charAt(t);switch(n){case"\0":r+="\x01\x10";break;case"\x01":r+="\x01\x11";break;default:r+=n}}return r}(e.get(r),t);return t+"\x01\x01"})(e.path),(e,t)=>e.isEqual(t)),this.garbageCollector=new nv(this,t)}static w_(e,t){return new aI(e,t)}f_(){}m_(e){return nm.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}rr(e){let t=this.xs(e);return this.persistence.getTargetCache().getTargetCount(e).next(e=>t.next(t=>e+t))}xs(e){let t=0;return this.ir(e,e=>{t++}).next(()=>t)}ir(e,t){return nm.forEach(this.v_,(r,n)=>this.Fs(e,r,n).next(e=>e?nm.resolve():t(n)))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0,n=this.persistence.getRemoteDocumentCache(),s=n.newChangeBuffer();return n.u_(e,n=>this.Fs(e,n,t).next(e=>{e||(r++,s.removeEntry(n,tV.min()))})).next(()=>s.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,t){return this.v_.set(t,e.currentSequenceNumber),nm.resolve()}removeTarget(e,t){let r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.v_.set(r,e.currentSequenceNumber),nm.resolve()}removeReference(e,t,r){return this.v_.set(r,e.currentSequenceNumber),nm.resolve()}updateLimboDocument(e,t){return this.v_.set(t,e.currentSequenceNumber),nm.resolve()}V_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=function e(t){switch(eC(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:let r=em(t);return r?16+e(r):16;case 5:return 2*t.stringValue.length;case 6:return eo(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return(t.arrayValue.values||[]).reduce((t,r)=>t+e(r),0);case 10:case 11:var n;let s;return n=t.mapValue,s=0,j(n.fields,(t,r)=>{s+=t.length+e(r)}),s;default:throw T(13486,{value:t})}}(e.data.value)),t}Fs(e,t,r){return nm.or([()=>this.persistence.p_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{let e=this.v_.get(t);return nm.resolve(void 0!==e&&e>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aC{constructor(e,t,r,n){this.targetId=e,this.fromCache=t,this.Ao=r,this.Vo=n}static fo(e,t){let r=t5(),n=t5();for(let e of t.docChanges)switch(e.type){case 0:r=r.add(e.doc.key);break;case 1:n=n.add(e.doc.key)}return new aC(e,t.fromCache,r,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aV(e,t){return K.comparator(e.key,t.key)}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aA{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aD{constructor(){this.mo=!1,this.po=!1,this.yo=100,this.wo=(0,u.G6)()?8:function(e){let t=e.match(/Android ([\d.]+)/i);return Number(t?t[1].split(".").slice(0,2).join("."):"-1")}((0,u.z$)())>0?6:4}initialize(e,t){this.bo=e,this.indexManager=t,this.mo=!0}getDocumentsMatchingQuery(e,t,r,n){let s={result:null};return this.So(e,t).next(e=>{s.result=e}).next(()=>{if(!s.result)return this.vo(e,t,n,r).next(e=>{s.result=e})}).next(()=>{if(s.result)return;let r=new aA;return this.Do(e,t,r).next(n=>{if(s.result=n,this.po)return this.xo(e,t,r,n.size)})}).next(()=>s.result)}xo(e,t,r,n){return i4(t)?nm.resolve():r.documentReadCount<this.yo?(y()<=c.in.DEBUG&&w("QueryEngine","SDK will not create cache indexes for query:",tY(t),"since it only creates cache indexes for collection contains","more than or equal to",this.yo,"documents"),nm.resolve()):(y()<=c.in.DEBUG&&w("QueryEngine","Query:",tY(t),"scans",r.documentReadCount,"local documents and returns",n,"documents as results."),r.documentReadCount>this.wo*n?(y()<=c.in.DEBUG&&w("QueryEngine","The SDK decides to create cache indexes for query:",tY(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,tj(t))):nm.resolve())}So(e,t){if(i4(t))return nm.resolve(null);let r=t;if(t$(r))return nm.resolve(null);let n=tj(r);return this.indexManager.getIndexType(e,n).next(t=>0===t?null:(null!==r.limit&&1===t&&(n=tj(r=tQ(r,null,"F"))),this.indexManager.getDocumentsMatchingTarget(e,n).next(t=>{let s=t5(...t);return this.bo.getDocuments(e,s).next(t=>this.indexManager.getMinOffset(e,n).next(n=>{let i=this.Co(r,t);return this.Fo(r,i,s,n.readTime)?this.So(e,tQ(r,null,"F")):this.Oo(e,i,r,n)}))})))}vo(e,t,r,n){return(i4(t)?function(e){for(let t of e.stages){if(t instanceof sf||t instanceof sp)return!1;if(t instanceof sm){if(t.condition instanceof st&&"exists"===t.condition._expr.name&&t.condition._expr.params[0]instanceof n6&&t.condition._expr.params[0].fieldName===U)continue;return!1}}return!0}(t):t$(t))||n.isEqual(tV.min())?nm.resolve(null):this.bo.getDocuments(e,r).next(s=>{let i=this.Co(t,s);return this.Fo(t,i,r,n)?nm.resolve(null):(y()<=c.in.DEBUG&&w("QueryEngine","Re-using previous result from %s to execute query: %s",n.toString(),i6(t)),this.Oo(e,i,t,function(e,t){let r=e.toTimestamp().seconds,n=e.toTimestamp().nanoseconds+1;return new tk(tV.fromTimestamp(1e9===n?new et(r+1,0):new et(r,n)),K.empty(),-1)}(n,0)).next(e=>e))})}Co(e,t){let r,n;return i4(e)?(r=new L(aV),n=t=>al(e,t)):(r=new L(tX(e)),n=t=>tJ(e,t)),t.forEach((e,t)=>{n(t)&&(r=r.add(t))}),r}Fo(e,t,r,n){if(i4(e))return e.stages.some(e=>e instanceof sf||e instanceof sp);if(null===e.limit)return!1;if(r.size!==t.size)return!0;let s="F"===e.limitType?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(n)>0)}Do(e,t,r){return y()<=c.in.DEBUG&&w("QueryEngine","Using full collection scan to execute query:",i6(t)),this.bo.getDocumentsMatchingQuery(e,t,tk.min(),r)}Oo(e,t,r,n){return this.bo.getDocumentsMatchingQuery(e,r,n).next(e=>(t.forEach(t=>{e=e.insert(t.key,t)}),e))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ak="LocalStore";class aL{constructor(e,t,r,n){this.persistence=e,this.Mo=t,this.serializer=n,this.No=new A(S),this.Lo=new t1(e=>i8(e),i7),this.Bo=new Map,this.Uo=e.getRemoteDocumentCache(),this.A_=e.getTargetCache(),this.d_=e.getBundleCache(),this.ko(r)}ko(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new af(this.Uo,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Uo.setIndexManager(this.indexManager),this.Mo.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.No))}}async function aR(e,t){return await e.persistence.runTransaction("Handle user change","readonly",r=>{let n;return e.mutationQueue.getAllMutationBatches(r).next(s=>(n=s,e.ko(t),e.mutationQueue.getAllMutationBatches(r))).next(t=>{let s=[],i=[],a=t5();for(let e of n)for(let t of(s.push(e.batchId),e.mutations))a=a.add(t.key);for(let e of t)for(let t of(i.push(e.batchId),e.mutations))a=a.add(t.key);return e.localDocuments.getDocuments(r,a).next(e=>({qo:e,removedBatchIds:s,addedBatchIds:i}))})})}function aP(e){return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.A_.getLastRemoteSnapshotVersion(t))}async function aO(e,t,r){let n=e.No.get(t);try{r||await e.persistence.runTransaction("Release target",r?"readwrite":"readwrite-primary",t=>e.persistence.referenceDelegate.removeTarget(t,n))}catch(e){if(!nf(e))throw e;w(ak,`Failed to update sequence numbers for target ${t}: ${e}`)}e.No=e.No.remove(t),e.Lo.delete(n.target)}function aU(e,t,r){let n=tV.min(),s=t5();return e.persistence.runTransaction("Execute query","readwrite",i=>(function(e,t,r){let n=e.Lo.get(r);return void 0!==n?nm.resolve(e.No.get(n)):e.A_.getTargetData(t,r)})(e,i,i4(t)?t:tj(t)).next(t=>{if(t)return n=t.lastLimboFreeSnapshotVersion,e.A_.getMatchingKeysForTargetId(i,t.targetId).next(e=>{s=e})}).next(()=>e.Mo.getDocumentsMatchingQuery(i,t,r?n:tV.min(),r?s:t5())).next(t=>((function(e,t){t.forEach((t,r)=>{let n=r.key.getCollectionGroup(),s=e.Bo.get(n)||tV.min();r.readTime.compareTo(s)>0&&e.Bo.set(n,r.readTime)})})(e,t),{documents:t,Qo:s})))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aM{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Jo=0,this.Yo=null,this.Zo=!0}Xo(){0===this.Jo&&(this.ea("Unknown"),this.Yo=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.Yo=null,this.ta("Backend didn't respond within 10 seconds."),this.ea("Offline"),Promise.resolve())))}na(e){"Online"===this.state?this.ea("Unknown"):(this.Jo++,this.Jo>=1&&(this.ra(),this.ta(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ea("Offline")))}set(e){this.ra(),this.Jo=0,"Online"===e&&(this.Zo=!1),this.ea(e)}ea(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ta(e){let t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Zo?(v(t),this.Zo=!1):w("OnlineStateTracker",t)}ra(){null!==this.Yo&&(this.Yo.cancel(),this.Yo=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let aF="RemoteStore";class aq{constructor(e,t,r,n,s){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.ia=[],this.sa=new Map,this._a=new Map,this.oa=new Map,this.aa=new ao(1e3),this.ua=new ao(1001),this.ca=new Set,this.la=[],this.Ea=s,this.Ea.Ke(e=>{r.enqueueAndForget(async()=>{aY(this)&&(w(aF,"Restarting streams for network reachability change."),await async function(e){e.ca.add(4),await aB(e),e.ha.set("Unknown"),e.ca.delete(4),await a$(e)}(this))})}),this.ha=new aM(r,n)}}async function a$(e){if(aY(e))for(let t of e.la)await t(!0)}async function aB(e){for(let t of e.la)await t(!1)}function az(e,t){return e._a.get(t)||void 0}function aj(e,t){let r=az(e,t.targetId);if(void 0!==r&&e.sa.has(r))return;let n=function(e,t){let r=az(e,t);void 0!==r&&e.oa.delete(r);let n=t%2!=0?e.ua.next():e.aa.next();return e._a.set(t,n),e.oa.set(n,t),n}(e,t.targetId);w(aF,"remoteStoreListen mapping SDK target ID to remote",t.targetId,n);let s=new ar(t.target,n,t.purpose,t.sequenceNumber,t.snapshotVersion,t.lastLimboFreeSnapshotVersion,t.resumeToken);e.sa.set(n,s),aH(e)?aW(e):a4(e).Jt()&&aK(e,s)}function aG(e,t){let r=a4(e),n=az(e,t);w(aF,"remoteStoreUnlisten removing mapping of SDK target ID to remote",t,n),e.sa.delete(n),e._a.delete(t),e.oa.delete(n),r.Jt()&&aQ(e,n),0===e.sa.size&&(r.Jt()?r.Xt():aY(e)&&e.ha.set("Unknown"))}function aK(e,t){if(e.Ta.H(t.targetId),t.resumeToken.approximateByteSize()>0||t.snapshotVersion.compareTo(tV.min())>0){let r=e.oa.get(t.targetId);if(void 0===r)return void w(aF,"SDK target ID not found for remote ID: "+t.targetId);let n=e.remoteSyncer.getRemoteKeysForTarget(r).size;t=t.withExpectedCount(n)}a4(e).Tn(t)}function aQ(e,t){e.Ta.H(t),a4(e).Pn(t)}function aW(e){e.Ta=new rh({getRemoteKeysForTarget:t=>{let r=e.oa.get(t);return void 0!==r?e.remoteSyncer.getRemoteKeysForTarget(r):t5()},ge:t=>e.sa.get(t)||null,Ae:()=>e.datastore.serializer.databaseId}),a4(e).start(),e.ha.Xo()}function aH(e){return aY(e)&&!a4(e).Ht()&&e.sa.size>0}function aY(e){return 0===e.ca.size}async function aJ(e){e.ha.set("Online")}async function aX(e){e.sa.forEach((t,r)=>{aK(e,t)})}async function aZ(e,t){e.Ta=void 0,aH(e)?(e.ha.na(t),aW(e)):e.ha.set("Unknown")}async function a0(e,t,r){if(e.ha.set("Online"),t instanceof ru&&2===t.state&&t.cause)try{await async function(e,t){let r=t.cause;for(let n of t.targetIds){if(e.sa.has(n)){let t=e.oa.get(n);void 0!==t&&(await e.remoteSyncer.rejectListen(t,r),e._a.delete(t),e.oa.delete(n)),e.sa.delete(n)}e.Ta.removeTarget(n)}}(e,t)}catch(r){w(aF,"Failed to remove targets %s: %s ",t.targetIds.join(","),r),await a1(e,r)}else if(t instanceof ra?e.Ta.se(t):t instanceof ro?e.Ta.Ee(t):e.Ta.ae(t),!r.isEqual(tV.min()))try{let t=await aP(e.localStore);r.compareTo(t)>=0&&await function(e,t){let r=e.Ta.de(t);r.targetChanges.forEach((r,n)=>{if(r.resumeToken.approximateByteSize()>0){let s=e.sa.get(n);s&&e.sa.set(n,s.withResumeToken(r.resumeToken,t))}}),r.targetMismatches.forEach((t,r)=>{let n=e.sa.get(t);if(!n)return;e.sa.set(t,n.withResumeToken(en.EMPTY_BYTE_STRING,n.snapshotVersion)),aQ(e,t);let s=new ar(n.target,t,r,n.sequenceNumber);aK(e,s)});let n=function(e,t){let r=new Map;t.targetChanges.forEach((t,n)=>{let s=e.oa.get(n);void 0!==s&&r.set(s,t)});let n=new A(S);return t.targetMismatches.forEach((t,r)=>{let s=e.oa.get(t);void 0!==s&&(n=n.insert(s,r))}),new rs(t.snapshotVersion,r,n,t.documentUpdates,t.augmentedDocumentUpdates,t.resolvedLimboDocuments)}(e,r);return e.remoteSyncer.applyRemoteEvent(n)}(e,r)}catch(t){w(aF,"Failed to raise snapshot:",t),await a1(e,t)}}async function a1(e,t,r){if(!nf(t))throw t;e.ca.add(1),await aB(e),e.ha.set("Offline"),r||(r=()=>aP(e.localStore)),e.asyncQueue.enqueueRetryable(async()=>{w(aF,"Retrying IndexedDB access"),await r(),e.ca.delete(1),await a$(e)})}async function a2(e,t){e.asyncQueue.verifyOperationInProgress(),w(aF,"RemoteStore received new credentials");let r=aY(e);e.ca.add(3),await aB(e),r&&e.ha.set("Unknown"),await e.remoteSyncer.handleCredentialChange(t),e.ca.delete(3),await a$(e)}async function a3(e,t){t?(e.ca.delete(2),await a$(e)):t||(e.ca.add(2),await aB(e),e.ha.set("Unknown"))}function a4(e){var t,r,n;return e.Pa||(e.Pa=(t=e.datastore,r=e.asyncQueue,n={ut:aJ.bind(null,e),lt:aX.bind(null,e),ht:aZ.bind(null,e),hn:a0.bind(null,e)},t.mn(),new ns(r,t.connection,t.authCredentials,t.appCheckCredentials,t.serializer,n)),e.la.push(async t=>{t?(e.Pa.Zt(),aH(e)?aW(e):e.ha.set("Unknown")):(await e.Pa.stop(),e.Ta=void 0)})),e.Pa}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class a6{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ia(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ia(this.observer.error,e):v("Uncaught Error in snapshot listener:",e.toString()))}Aa(){this.muted=!0}Ia(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class a9{constructor(e,t,r,n,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=n,this.removalCallback=s,this.deferred=new rz,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(e=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,n,s){let i=new a9(e,t,Date.now()+r,n,s);return i.start(r),i}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){null!==this.timerHandle&&(this.clearTimeout(),this.deferred.reject(new O(P.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>null!==this.timerHandle?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){null!==this.timerHandle&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function a5(e,t){if(v("AsyncQueue",`${t}: ${e}`),nf(e))return new O(P.UNAVAILABLE,`${t}: ${e}`);throw e}class a8{constructor(){this.activeTargetIds=t8}La(e){this.activeTargetIds=this.activeTargetIds.add(e)}Ba(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Na(){return JSON.stringify({activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()})}}class a7{constructor(){this.du=new a8,this.fu={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.du.La(e),this.fu[e]||"not-current"}updateQueryState(e,t,r){this.fu[e]=t}removeLocalQueryTarget(e){this.du.Ba(e)}isLocalQueryTarget(e){return this.du.activeTargetIds.has(e)}clearQueryState(e){delete this.fu[e]}getAllActiveQueryTargets(){return this.du.activeTargetIds}isActiveQueryTarget(e){return this.du.activeTargetIds.has(e)}start(){return this.du=new a8,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}function oe(){return"undefined"!=typeof document?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ot{static emptySet(e){return new ot(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||K.comparator(t.key,r.key):(e,t)=>K.comparator(e.key,t.key),this.keyedMap=t4(),this.sortedSet=new A(this.comparator)}has(e){return null!=this.keyedMap.get(e)}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){let t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){let t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){let t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof ot)||this.size!==e.size)return!1;let t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){let e=t.getNext().key,n=r.getNext().key;if(!e.isEqual(n))return!1}return!0}toString(){let e=[];return this.forEach(t=>{e.push(t.toString())}),0===e.length?"DocumentSet ()":"DocumentSet (\n  "+e.join("  \n")+"\n)"}copy(e,t){let r=new ot;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class or{constructor(){this.mu=new A(K.comparator)}track(e){let t=e.doc.key,r=this.mu.get(t);r?0!==e.type&&3===r.type?this.mu=this.mu.insert(t,e):3===e.type&&1!==r.type?this.mu=this.mu.insert(t,{type:r.type,doc:e.doc}):2===e.type&&2===r.type?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):2===e.type&&0===r.type?this.mu=this.mu.insert(t,{type:0,doc:e.doc}):1===e.type&&0===r.type?this.mu=this.mu.remove(t):1===e.type&&2===r.type?this.mu=this.mu.insert(t,{type:1,doc:r.doc}):0===e.type&&1===r.type?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):T(63341,{ye:e,pu:r}):this.mu=this.mu.insert(t,e)}gu(){let e=[];return this.mu.inorderTraversal((t,r)=>{e.push(r)}),e}}class on{constructor(e,t,r,n,s,i,a,o,u){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=n,this.mutatedKeys=s,this.fromCache=i,this.syncStateChanged=a,this.excludesMetadataChanges=o,this.hasCachedResults=u}static fromInitialDocuments(e,t,r,n,s){let i=[];return t.forEach(e=>{i.push({type:0,doc:e})}),new on(e,t,ot.emptySet(t),i,r,n,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&i5(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;let t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let e=0;e<t.length;e++)if(t[e].type!==r[e].type||!t[e].doc.isEqual(r[e].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class os{constructor(){this.yu=void 0,this.wu=[]}bu(){return this.wu.some(e=>e.Su())}}class oi{constructor(){this.queries=oa(),this.onlineState="Unknown",this.vu=new Set}terminate(){!function(e,t){let r=e.queries;e.queries=oa(),r.forEach((e,r)=>{for(let e of r.wu)e.onError(t)})}(this,new O(P.ABORTED,"Firestore shutting down"))}}function oa(){return new t1(e=>i9(e),i5)}async function oo(e,t){let r=3,n=t.query,s=e.queries.get(n);s?!s.bu()&&t.Su()&&(r=2):(s=new os,r=t.Su()?0:1);try{switch(r){case 0:s.yu=await e.onListen(n,!0);break;case 1:s.yu=await e.onListen(n,!1);break;case 2:await e.onFirstRemoteStoreListen(n)}}catch(r){let e=a5(r,`Initialization of query '${i4(t.query)?i3(t.query):tY(t.query)}' failed`);return void t.onError(e)}e.queries.set(n,s),s.wu.push(t),t.Du(e.onlineState),s.yu&&t.xu(s.yu)&&oh(e)}async function ou(e,t){let r=t.query,n=3,s=e.queries.get(r);if(s){let e=s.wu.indexOf(t);e>=0&&(s.wu.splice(e,1),0===s.wu.length?n=t.Su()?0:1:!s.bu()&&t.Su()&&(n=2))}switch(n){case 0:return e.queries.delete(r),e.onUnlisten(r,!0);case 1:return e.queries.delete(r),e.onUnlisten(r,!1);case 2:return e.onLastRemoteStoreUnlisten(r);default:return}}function ol(e,t){let r=!1;for(let n of t){let t=n.query,s=e.queries.get(t);if(s){for(let e of s.wu)e.xu(n)&&(r=!0);s.yu=n}}r&&oh(e)}function oc(e,t,r){let n=e.queries.get(t);if(n)for(let e of n.wu)e.onError(r);e.queries.delete(t)}function oh(e){e.vu.forEach(e=>{e.next()})}(n=a||(a={})).Default="default",n.Cache="cache";class od{constructor(e,t,r){this.query=e,this.Cu=t,this.Fu=!1,this.Ou=null,this.onlineState="Unknown",this.options=r||{}}xu(e){if(!this.options.includeMetadataChanges){let t=[];for(let r of e.docChanges)3!==r.type&&t.push(r);e=new on(e.query,e.docs,e.oldDocs,t,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Fu?this.Mu(e)&&(this.Cu.next(e),t=!0):this.Nu(e,this.onlineState)&&(this.Lu(e),t=!0),this.Ou=e,t}onError(e){this.Cu.error(e)}Du(e){this.onlineState=e;let t=!1;return this.Ou&&!this.Fu&&this.Nu(this.Ou,e)&&(this.Lu(this.Ou),t=!0),t}Nu(e,t){return!(e.fromCache&&this.Su())||(!this.options.waitForSyncWhenOnline||!("Offline"!==t))&&(!e.docs.isEmpty()||e.hasCachedResults||"Offline"===t)}Mu(e){if(e.docChanges.length>0)return!0;let t=this.Ou&&this.Ou.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&!0===this.options.includeMetadataChanges}Lu(e){e=on.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Fu=!0,this.Cu.next(e)}Su(){return this.options.source!==a.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class om{constructor(e){this.key=e}}class of{constructor(e){this.key=e}}class op{constructor(e,t){this.query=e,this.Gu=t,this.zu=null,this.hasCachedResults=!1,this.current=!1,this.ju=t5(),this.mutatedKeys=t5(),this.Hu=i4(e)?ac(e):tX(e),this.Ju=new ot(this.Hu)}get Yu(){return this.Gu}Zu(e,t){let r=t?t.Xu:new or,n=t?t.Ju:this.Ju,s=t?t.mutatedKeys:this.mutatedKeys,i=n,a=!1,[o,u]=this.ec(this.query,n);e.inorderTraversal((e,t)=>{var l;let c=n.get(e),h=(i4(l=this.query)?al(l,t):tJ(l,t))?t:null,d=!!c&&this.mutatedKeys.has(c.key),m=!!h&&(h.hasLocalMutations||this.mutatedKeys.has(h.key)&&h.hasCommittedMutations),f=!1;c&&h?c.data.isEqual(h.data)?d!==m&&(r.track({type:3,doc:h}),f=!0):this.tc(c,h)||(r.track({type:2,doc:h}),f=!0,(o&&this.Hu(h,o)>0||u&&0>this.Hu(h,u))&&(a=!0)):!c&&h?(r.track({type:0,doc:h}),f=!0):c&&!h&&(r.track({type:1,doc:c}),f=!0,(o||u)&&(a=!0)),f&&(h?(i=i.add(h),s=m?s.add(e):s.delete(e)):(i=i.delete(e),s=s.delete(e)))});let l=this.nc(this.query);if(l){if(i4(this.query)){let e=[];i.forEach(t=>e.push(t));let t=au(this.query,e),n=new ot(ac(this.query));for(let e of t)n=n.add(e);i.forEach(e=>{n.has(e.key)||(s=s.delete(e.key),r.track({type:1,doc:e}))}),i=n}else{let e=this.rc(this.query);for(;i.size>l;){let t="F"===e?i.last():i.first();i=i.delete(t.key),s=s.delete(t.key),r.track({type:1,doc:t})}}}return{Ju:i,Xu:r,Fo:a,mutatedKeys:s}}nc(e){return i4(e)?ah(e)?.limit:e.limit||void 0}rc(e){if(i4(e)){let t=ah(e);return t&&t.limit<0?"L":"F"}return e.limitType}ec(e,t){if(i4(e)){let r=ah(e)?.limit;return[t.size===r?t.last():null,null]}return["F"===e.limitType&&t.size===this.nc(this.query)?t.last():null,"L"===e.limitType&&t.size===this.nc(this.query)?t.first():null]}tc(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,n){let s=this.Ju;this.Ju=e.Ju,this.mutatedKeys=e.mutatedKeys;let i=e.Xu.gu();i.sort((e,t)=>(function(e,t){let r=e=>{switch(e){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return T(20277,{ye:e})}};return r(e)-r(t)})(e.type,t.type)||this.Hu(e.doc,t.doc)),this.sc(r),n=n??!1;let a=t&&!n?this._c():[],o=0===this.ju.size&&this.current&&!n?1:0,u=o!==this.zu;return(this.zu=o,0!==i.length||u)?{snapshot:new on(this.query,e.Ju,s,i,e.mutatedKeys,0===o,u,!1,!!r&&r.resumeToken.approximateByteSize()>0),oc:a}:{oc:a}}Du(e){return this.current&&"Offline"===e?(this.current=!1,this.applyChanges({Ju:this.Ju,Xu:new or,mutatedKeys:this.mutatedKeys,Fo:!1},!1)):{oc:[]}}ac(e){return!this.Gu.has(e)&&!!this.Ju.has(e)&&!this.Ju.get(e).hasLocalMutations}sc(e){e&&(e.addedDocuments.forEach(e=>this.Gu=this.Gu.add(e)),e.modifiedDocuments.forEach(e=>{}),e.removedDocuments.forEach(e=>this.Gu=this.Gu.delete(e)),this.current=e.current)}_c(){if(!this.current)return[];let e=this.ju;this.ju=t5(),this.Ju.forEach(e=>{this.ac(e.key)&&(this.ju=this.ju.add(e.key))});let t=[];return e.forEach(e=>{this.ju.has(e)||t.push(new of(e))}),this.ju.forEach(r=>{e.has(r)||t.push(new om(r))}),t}uc(e){this.Gu=e.Qo,this.ju=t5();let t=this.Zu(e.documents);return this.applyChanges(t,!0)}cc(){return on.fromInitialDocuments(this.query,this.Ju,this.mutatedKeys,0===this.zu,this.hasCachedResults)}}let og="SyncEngine";class oy{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class ow{constructor(e){this.key=e,this.lc=!1}}class ov{constructor(e,t,r,n,s,i){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=n,this.currentUser=s,this.maxConcurrentLimboResolutions=i,this.Ec={},this.hc=new t1(e=>i9(e),i5),this.Tc=new Map,this.Pc=new Set,this.Rc=new A(K.comparator),this.Ic=new Map,this.Ac=new aw,this.Vc={},this.dc=new Map,this.fc=ao.ws(),this.onlineState="Unknown",this.mc=void 0}get isPrimaryClient(){return!0===this.mc}}async function o_(e,t,r=!0){let n;let s=oO(e),i=s.hc.get(t);return i?(s.sharedClientState.addLocalQueryTarget(i.targetId),n=i.view.cc()):n=await oT(s,t,r,!0),n}async function oE(e,t){let r=oO(e);await oT(r,t,!0,!1)}async function oT(e,t,r,n){var s,i;let a;let o=await (s=e.localStore,i=i4(t)?t:tj(t),s.persistence.runTransaction("Allocate target","readwrite",e=>{let t;return s.A_.getTargetData(e,i).next(r=>r?(t=r,nm.resolve(t)):s.A_.allocateTargetId(e).next(r=>(t=new ar(i,r,"TargetPurposeListen",e.currentSequenceNumber),s.A_.addTargetData(e,t).next(()=>t))))}).then(e=>{let t=s.No.get(e.targetId);return(null===t||e.snapshotVersion.compareTo(t.snapshotVersion)>0)&&(s.No=s.No.insert(e.targetId,e),s.Lo.set(i,e.targetId)),e})),u=o.targetId,l=e.sharedClientState.addLocalQueryTarget(u,r);return n&&(a=await ox(e,t,u,"current"===l,o.resumeToken)),e.isPrimaryClient&&r&&aj(e.remoteStore,o),a}async function ox(e,t,r,n,s){e.gc=(t,r,n)=>(async function(e,t,r,n){let s=t.view.Zu(r);s.Fo&&(s=await aU(e.localStore,t.query,!1).then(({documents:e})=>t.view.Zu(e,s)));let i=n&&n.targetChanges.get(t.targetId),a=n&&null!=n.targetMismatches.get(t.targetId),o=t.view.applyChanges(s,e.isPrimaryClient,i,a);return oD(e,t.targetId,o.oc),o.snapshot})(e,t,r,n);let i=await aU(e.localStore,t,!0),a=new op(t,i.Qo),o=a.Zu(i.documents),u=ri.createSynthesizedTargetChangeForCurrentChange(r,n&&"Offline"!==e.onlineState,s),l=a.applyChanges(o,e.isPrimaryClient,u);oD(e,r,l.oc);let c=new oy(t,r,a);return e.hc.set(t,c),e.Tc.has(r)?e.Tc.get(r).push(t):e.Tc.set(r,[t]),l.snapshot}async function ob(e,t,r){let n=e.hc.get(t),s=e.Tc.get(n.targetId);if(s.length>1)return e.Tc.set(n.targetId,s.filter(e=>!i5(e,t))),void e.hc.delete(t);e.isPrimaryClient?(e.sharedClientState.removeLocalQueryTarget(n.targetId),e.sharedClientState.isActiveQueryTarget(n.targetId)||await aO(e.localStore,n.targetId,!1).then(()=>{e.sharedClientState.clearQueryState(n.targetId),r&&aG(e.remoteStore,n.targetId),oV(e,n.targetId)}).catch(nd)):(oV(e,n.targetId),await aO(e.localStore,n.targetId,!0))}async function oN(e,t){let r=e.hc.get(t),n=e.Tc.get(r.targetId);e.isPrimaryClient&&1===n.length&&(e.sharedClientState.removeLocalQueryTarget(r.targetId),aG(e.remoteStore,r.targetId))}async function oS(e,t){try{let r=await function(e,t){let r=t.snapshotVersion,n=e.No;return e.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{var i;let a,o;let u=e.Uo.newChangeBuffer({trackRemovals:!0});n=e.No;let l=[];t.targetChanges.forEach((i,a)=>{var o;let u=n.get(a);if(!u)return;l.push(e.A_.removeMatchingKeys(s,i.removedDocuments,a).next(()=>e.A_.addMatchingKeys(s,i.addedDocuments,a)));let c=u.withSequenceNumber(s.currentSequenceNumber);null!==t.targetMismatches.get(a)?c=c.withResumeToken(en.EMPTY_BYTE_STRING,tV.min()).withLastLimboFreeSnapshotVersion(tV.min()):i.resumeToken.approximateByteSize()>0&&(c=c.withResumeToken(i.resumeToken,r)),n=n.insert(a,c),o=c,(0===u.resumeToken.approximateByteSize()||o.snapshotVersion.toMicroseconds()-u.snapshotVersion.toMicroseconds()>=3e8||i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size>0)&&l.push(e.A_.updateTargetData(s,c))});let c=t2,h=t5();if(t.documentUpdates.forEach(r=>{t.resolvedLimboDocuments.has(r)&&l.push(e.persistence.referenceDelegate.updateLimboDocument(s,r))}),l.push((i=t.documentUpdates,a=t5(),o=t5(),i.forEach(e=>a=a.add(e)),u.getEntries(s,a).next(e=>{let t=t2;return i.forEach((r,n)=>{let s=e.get(r);n.isFoundDocument()!==s.isFoundDocument()&&(o=o.add(r)),n.isNoDocument()&&n.version.isEqual(tV.min())?(u.removeEntry(r,n.readTime),t=t.insert(r,n)):!s.isValidDocument()||n.version.compareTo(s.version)>0||0===n.version.compareTo(s.version)&&s.hasPendingWrites?(u.addEntry(n),t=t.insert(r,n)):w(ak,"Ignoring outdated watch update for ",r,". Current version:",s.version," Watch version:",n.version)}),{$o:t,Ko:o}})).next(e=>{c=e.$o,h=e.Ko})),!r.isEqual(tV.min())){let t=e.A_.getLastRemoteSnapshotVersion(s).next(t=>e.A_.setTargetsMetadata(s,s.currentSequenceNumber,r));l.push(t)}return nm.waitFor(l).next(()=>u.apply(s)).next(()=>e.localDocuments.getLocalViewOfDocuments(s,c,h)).next(()=>c)}).then(t=>(e.No=n,t))}(e.localStore,t);t.targetChanges.forEach((t,r)=>{let n=e.Ic.get(r);n&&(b(t.addedDocuments.size+t.modifiedDocuments.size+t.removedDocuments.size<=1,22616),t.addedDocuments.size>0?n.lc=!0:t.modifiedDocuments.size>0?b(n.lc,14607):t.removedDocuments.size>0&&(b(n.lc,42227),n.lc=!1))}),await oL(e,r,t)}catch(e){await nd(e)}}function oI(e,t,r){var n;if(e.isPrimaryClient&&0===r||!e.isPrimaryClient&&1===r){let r;let s=[];e.hc.forEach((e,r)=>{let n=r.view.Du(t);n.snapshot&&s.push(n.snapshot)}),(n=e.eventManager).onlineState=t,r=!1,n.queries.forEach((e,n)=>{for(let e of n.wu)e.Du(t)&&(r=!0)}),r&&oh(n),s.length&&e.Ec.hn(s),e.onlineState=t,e.isPrimaryClient&&e.sharedClientState.setOnlineState(t)}}async function oC(e,t,r){e.sharedClientState.updateQueryState(t,"rejected",r);let n=e.Ic.get(t),s=n&&n.key;if(s){let r=new A(K.comparator);r=r.insert(s,tA.newNoDocument(s,tV.min()));let n=t5().add(s),i=new rs(tV.min(),new Map,new A(S),r,t2,n);await oS(e,i),e.Rc=e.Rc.remove(s),e.Ic.delete(t),ok(e)}else await aO(e.localStore,t,!1).then(()=>oV(e,t,r)).catch(nd)}function oV(e,t,r=null){for(let n of(e.sharedClientState.removeLocalQueryTarget(t),e.Tc.get(t)))e.hc.delete(n),r&&e.Ec.yc(n,r);e.Tc.delete(t),e.isPrimaryClient&&e.Ac.Xs(t).forEach(t=>{e.Ac.containsKey(t)||oA(e,t)})}function oA(e,t){e.Pc.delete(t.path.canonicalString());let r=e.Rc.get(t);null!==r&&(aG(e.remoteStore,r),e.Rc=e.Rc.remove(t),e.Ic.delete(r),ok(e))}function oD(e,t,r){for(let n of r)n instanceof om?(e.Ac.addReference(n.key,t),function(e,t){let r=t.key,n=r.path.canonicalString();e.Rc.get(r)||e.Pc.has(n)||(w(og,"New document in limbo: "+r),e.Pc.add(n),ok(e))}(e,n)):n instanceof of?(w(og,"Document no longer in limbo: "+n.key),e.Ac.removeReference(n.key,t),e.Ac.containsKey(n.key)||oA(e,n.key)):T(19791,{wc:n})}function ok(e){for(;e.Pc.size>0&&e.Rc.size<e.maxConcurrentLimboResolutions;){let t=e.Pc.values().next().value;e.Pc.delete(t);let r=new K(F.fromString(t)),n=e.fc.next();e.Ic.set(n,new ow(r)),e.Rc=e.Rc.insert(r,n),aj(e.remoteStore,new ar(tj(tq(r.path)),n,"TargetPurposeLimboResolution",nc.yn))}}async function oL(e,t,r){let n=[],s=[],i=[];e.hc.isEmpty()||(e.hc.forEach((a,o)=>{i.push(e.gc(o,t,r).then(t=>{if((t||r)&&e.isPrimaryClient){let n=t?!t.fromCache:r?.targetChanges.get(o.targetId)?.current;e.sharedClientState.updateQueryState(o.targetId,n?"current":"not-current")}if(t){n.push(t);let e=aC.fo(o.targetId,t);s.push(e)}}))}),await Promise.all(i),e.Ec.hn(n),await async function(e,t){try{await e.persistence.runTransaction("notifyLocalViewChanges","readwrite",r=>nm.forEach(t,t=>nm.forEach(t.Ao,n=>e.persistence.referenceDelegate.addReference(r,t.targetId,n)).next(()=>nm.forEach(t.Vo,n=>e.persistence.referenceDelegate.removeReference(r,t.targetId,n)))))}catch(e){if(!nf(e))throw e;w(ak,"Failed to update sequence numbers: "+e)}for(let r of t){let t=r.targetId;if(!r.fromCache){let r=e.No.get(t),n=r.snapshotVersion,s=r.withLastLimboFreeSnapshotVersion(n);e.No=e.No.insert(t,s)}}}(e.localStore,s))}async function oR(e,t){var r;if(!e.currentUser.isEqual(t)){w(og,"User change. New user:",t.toKey());let n=await aR(e.localStore,t);e.currentUser=t,r="'waitForPendingWrites' promise is rejected due to a user change.",e.dc.forEach(e=>{e.forEach(e=>{e.reject(new O(P.CANCELLED,r))})}),e.dc.clear(),e.sharedClientState.handleUserChange(t,n.removedBatchIds,n.addedBatchIds),await oL(e,n.qo)}}function oP(e,t){let r=e.Ic.get(t);if(r&&r.lc)return t5().add(r.key);{let r=t5(),n=e.Tc.get(t);if(!n)return r;for(let t of n??[]){let n=e.hc.get(t);r=r.unionWith(n.view.Yu)}return r}}function oO(e){return e.remoteStore.remoteSyncer.applyRemoteEvent=oS.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=oP.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=oC.bind(null,e),e.Ec.hn=ol.bind(null,e.eventManager),e.Ec.yc=oc.bind(null,e.eventManager),e}class oU{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=rU(e.databaseInfo.databaseId),this.sharedClientState=this.Sc(e),this.persistence=this.vc(e),await this.persistence.start(),this.localStore=this.Dc(e),this.gcScheduler=this.xc(e,this.localStore),this.indexBackfillerScheduler=this.Cc(e,this.localStore)}xc(e,t){return null}Cc(e,t){return null}Dc(e){var t;return t=this.persistence,new aL(t,new aD,e.initialUser,this.serializer)}vc(e){return new ab(aS.w_,this.serializer)}Sc(e){return new a7}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}oU.provider={build:()=>new oU};class oM extends oU{constructor(e){super(),this.cacheSizeBytes=e}xc(e,t){return b(this.persistence.referenceDelegate instanceof aI,46915),new nw(this.persistence.referenceDelegate.garbageCollector,e.asyncQueue,t)}vc(e){let t=void 0!==this.cacheSizeBytes?nl.withCacheSize(this.cacheSizeBytes):nl.DEFAULT;return new ab(e=>aI.w_(e,t),this.serializer)}}class oF{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=e=>oI(this.syncEngine,e,1),this.remoteStore.remoteSyncer.handleCredentialChange=oR.bind(null,this.syncEngine),await a3(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return new oi}createDatastore(e){let t=rU(e.databaseInfo.databaseId),r=new ne(e.databaseInfo);return new na(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){var t;return t=this.localStore,new aq(t,this.datastore,e.asyncQueue,e=>oI(this.syncEngine,e,0),r1.Je()?new r1:new rZ)}createSyncEngine(e,t){return function(e,t,r,n,s,i,a){let o=new ov(e,t,r,n,s,i);return a&&(o.mc=!0),o}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){await async function(e){w(aF,"RemoteStore shutting down."),e.ca.add(5),await aB(e),e.Ea.shutdown(),e.ha.set("Unknown")}(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}}oF.provider={build:()=>new oF};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let oq="FirestoreClient";class o${constructor(e,t,r,n,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this._databaseInfo=n,this.user=rB.UNAUTHENTICATED,this.clientId=N.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,async e=>{w(oq,"Received user=",e.uid),await this.authCredentialListener(e),this.user=e}),this.appCheckCredentials.start(r,e=>(w(oq,"Received new app check token=",e),this.appCheckCredentialListener(e,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();let e=new rz;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(r){let t=a5(r,"Failed to shutdown persistence");e.reject(t)}}),e.promise}}async function oB(e,t){e.asyncQueue.verifyOperationInProgress(),w(oq,"Initializing OfflineComponentProvider");let r=e.configuration;await t.initialize(r);let n=r.initialUser;e.setCredentialChangeListener(async e=>{n.isEqual(e)||(await aR(t.localStore,e),n=e)}),t.persistence.setDatabaseDeletedListener(()=>e.terminate()),e._offlineComponents=t}async function oz(e,t){e.asyncQueue.verifyOperationInProgress();let r=await oj(e);w(oq,"Initializing OnlineComponentProvider"),await t.initialize(r,e.configuration),e.setCredentialChangeListener(e=>a2(t.remoteStore,e)),e.setAppCheckTokenChangeListener((e,r)=>a2(t.remoteStore,r)),e._onlineComponents=t}async function oj(e){if(!e._offlineComponents){if(e._uninitializedComponentsProvider){w(oq,"Using user provided OfflineComponentProvider");try{await oB(e,e._uninitializedComponentsProvider._offline)}catch(t){if(!("FirebaseError"===t.name?t.code===P.FAILED_PRECONDITION||t.code===P.UNIMPLEMENTED:!("undefined"!=typeof DOMException&&t instanceof DOMException)||22===t.code||20===t.code||11===t.code))throw t;_("Error using user provided cache. Falling back to memory cache: "+t),await oB(e,new oU)}}else w(oq,"Using default OfflineComponentProvider"),await oB(e,new oM(void 0))}return e._offlineComponents}async function oG(e){return e._onlineComponents||(e._uninitializedComponentsProvider?(w(oq,"Using user provided OnlineComponentProvider"),await oz(e,e._uninitializedComponentsProvider._online)):(w(oq,"Using default OnlineComponentProvider"),await oz(e,new oF))),e._onlineComponents}async function oK(e){let t=await oG(e),r=t.eventManager;return r.onListen=o_.bind(null,t.syncEngine),r.onUnlisten=ob.bind(null,t.syncEngine),r.onFirstRemoteStoreListen=oE.bind(null,t.syncEngine),r.onLastRemoteStoreUnlisten=oN.bind(null,t.syncEngine),r}function oQ(e,t,r,n){let s=new a6(n),i=new od(t,s,r);return e.asyncQueue.enqueueAndForget(async()=>oo(await oK(e),i)),()=>{s.Aa(),e.asyncQueue.enqueueAndForget(async()=>ou(await oK(e),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let oW=class{constructor(e,t,r,n,s){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=n,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new nb(this._firestore,this._converter,this._key)}exists(){return null!==this._document}data(){if(this._document){if(this._converter){let e=new oH(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){return this._document?.data.clone().value.mapValue.fields??void 0}get(e){if(this._document){let t=this._document.data.field(nG("DocumentSnapshot.get",e));if(null!==t)return this._userDataWriter.convertValue(t)}}},oH=class extends oW{data(){return super.data()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oY{convertValue(e,t="none"){switch(eC(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ea(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(eo(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw T(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){let r={};return j(e,(e,n)=>{r[e]=this.convertValue(n,t)}),r}convertVectorValue(e){return new nC(e.fields?.[eb].arrayValue?.values?.map(e=>ea(e.doubleValue)))}convertGeoPoint(e){return new r$(ea(e.latitude),ea(e.longitude))}convertArray(e,t){return(e.values||[]).map(e=>this.convertValue(e,t))}convertServerTimestamp(e,t){switch(t){case"previous":let r=em(e);return null==r?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(ef(e));default:return null}}convertTimestamp(e){let t=ei(e);return new et(t.seconds,t.nanos)}convertDocumentKey(e,t){let r=F.fromString(e);b(rL(r),9688,{name:e});let n=new ey(r.get(1),r.get(3)),s=new K(r.popFirst(5));return n.isEqual(t)||v(`A document reference to ${s} refers to a different database (${n.projectId}/${n.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oJ(e,t,r){return e?r&&(r.merge||r.mergeFields)?e.toFirestore(t,r):e.toFirestore(t):t}class oX extends oY{constructor(e){super(),this.firestore=e}convertBytes(e){return new rM(e)}convertReference(e){let t=this.convertDocumentKey(e,this.firestore._databaseId);return new nb(this.firestore,null,t)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let oZ="AsyncQueue";class o0{constructor(e=Promise.resolve()){this.qc=[],this.$c=!1,this.Kc=[],this.Qc=null,this.Wc=!1,this.Gc=!1,this.zc=[],this.jt=new nt(this,"async_queue_retry"),this.jc=()=>{let e=oe();e&&w(oZ,"Visibility state changed to "+e.visibilityState),this.jt.qt()},this.Hc=e;let t=oe();t&&"function"==typeof t.addEventListener&&t.addEventListener("visibilitychange",this.jc)}get isShuttingDown(){return this.$c}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Jc(),this.Yc(e)}enterRestrictedMode(e){if(!this.$c){this.$c=!0,this.Gc=e||!1;let t=oe();t&&"function"==typeof t.removeEventListener&&t.removeEventListener("visibilitychange",this.jc)}}enqueue(e){if(this.Jc(),this.$c)return new Promise(()=>{});let t=new rz;return this.Yc(()=>this.$c&&this.Gc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.qc.push(e),this.Zc()))}async Zc(){if(0!==this.qc.length){try{await this.qc[0](),this.qc.shift(),this.jt.reset()}catch(e){if(!nf(e))throw e;w(oZ,"Operation failed with retryable error: "+e)}this.qc.length>0&&this.jt.Ut(()=>this.Zc())}}Yc(e){let t=this.Hc.then(()=>(this.Wc=!0,e().catch(e=>{throw this.Qc=e,this.Wc=!1,v("INTERNAL UNHANDLED ERROR: ",o1(e)),e}).then(e=>(this.Wc=!1,e))));return this.Hc=t,t}enqueueAfterDelay(e,t,r){this.Jc(),this.zc.indexOf(e)>-1&&(t=0);let n=a9.createAndSchedule(this,e,t,r,e=>this.Xc(e));return this.Kc.push(n),n}Jc(){this.Qc&&T(47125,{el:o1(this.Qc)})}verifyOperationInProgress(){}async tl(){let e;do e=this.Hc,await e;while(e!==this.Hc)}nl(e){for(let t of this.Kc)if(t.timerId===e)return!0;return!1}rl(e){return this.tl().then(()=>{for(let t of(this.Kc.sort((e,t)=>e.targetTimeMs-t.targetTimeMs),this.Kc))if(t.skipDelay(),"all"!==e&&t.timerId===e)break;return this.tl()})}il(e){this.zc.push(e)}Xc(e){let t=this.Kc.indexOf(e);this.Kc.splice(t,1)}}function o1(e){let t=e.message||"";return e.stack&&(t=e.stack.includes(e.message)?e.stack:e.message+"\n"+e.stack),t}class o2 extends nT{constructor(e,t,r,n){super(e,t,r,n),this.type="firestore",this._queue=new o0,this._persistenceKey=n?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){let e=this._firestoreClient.terminate();this._queue=new o0(e),this._firestoreClient=void 0,await e}}}function o3(e,t){let r="object"==typeof e?e:(0,o.Mq)(),n=(0,o.qX)(r,"firestore").getImmediate({identifier:"string"==typeof e?e:t||eg});if(!n._initialized){let e=(0,u.P0)("firestore");e&&function(e,t,r,n={}){e=X(e,nT);let s=(0,u.Xx)(t),i=e._getSettings(),a={...i,emulatorOptions:e._getEmulatorOptions()},o=`${t}:${r}`;s&&(0,u.Uo)(`https://${o}`),i.host!==n_&&i.host!==o&&_("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");let l={...i,host:o,ssl:s,emulatorOptions:n};if(!(0,u.vZ)(l,a)&&(e._setSettings(l),n.mockUserToken)){let t,r;if("string"==typeof n.mockUserToken)t=n.mockUserToken,r=rB.MOCK_USER;else{t=(0,u.Sg)(n.mockUserToken,e._app?.options.projectId);let s=n.mockUserToken.sub||n.mockUserToken.user_id;if(!s)throw new O(P.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");r=new rB(s)}e._authCredentials=new rK(new rj(t,r))}}(n,...e)}return n}function o4(e){if(e._terminated)throw new O(P.FAILED_PRECONDITION,"The client has already been terminated.");return e._firestoreClient||function(e){var t,r,n,s;let i=e._freezeSettings(),a=(t=e._databaseId,r=e._app?.options.appId||"",n=e._persistenceKey,s=e._app?.options.apiKey,new ep(t,r,n,i.host,i.ssl,i.experimentalForceLongPolling,i.experimentalAutoDetectLongPolling,rX(i.experimentalLongPollingOptions),i.useFetchStreams,i.isUsingEmulator,s,i._customHeaders,i.grpcFlowControlWindow));e._componentsProvider||i.localCache?._offlineComponentProvider&&i.localCache?._onlineComponentProvider&&(e._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),e._firestoreClient=new o$(e._authCredentials,e._appCheckCredentials,e._queue,a,e._componentsProvider&&function(e){let t=e?._online.build();return{_offline:e?._offline.build(t),_online:t}}(e._componentsProvider))}(e),e._firestoreClient}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class o6 extends oY{constructor(e){super(),this.firestore=e}convertBytes(e){return new rM(e)}convertReference(e){let t=this.convertDocumentKey(e,this.firestore._databaseId);return new nb(this.firestore,null,t)}}class o9{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class o5 extends oW{constructor(e,t,r,n,s,i){super(e,t,r,n,i),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){let t=new o8(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){let r=this._document.data.field(nG("DocumentSnapshot.get",e));if(null!==r)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new O(P.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e=this._document,t={};return t.type=o5._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),e&&e.isValidDocument()&&e.isFoundDocument()&&(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED")),t}}o5._jsonSchemaVersion="firestore/documentSnapshot/1.0",o5._jsonSchema={type:Z("string",o5._jsonSchemaVersion),bundleSource:Z("string","DocumentSnapshot"),bundleName:Z("string"),bundle:Z("string")};class o8 extends o5{data(e={}){return super.data(e)}}class o7{constructor(e,t,r,n){this._firestore=e,this._userDataWriter=t,this._snapshot=n,this.metadata=new o9(n.hasPendingWrites,n.fromCache),this.query=r}get docs(){let e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return 0===this.size}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new o8(this._firestore,this._userDataWriter,r.key,r,new o9(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){let t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new O(P.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(e,t){if(e._snapshot.oldDocs.isEmpty()){let t=0;return e._snapshot.docChanges.map(r=>{i4(e._snapshot.query)?ac(e._snapshot.query):tX(e.query._query);let n=new o8(e._firestore,e._userDataWriter,r.doc.key,r.doc,new o9(e._snapshot.mutatedKeys.has(r.doc.key),e._snapshot.fromCache),e.query.converter);return r.doc,{type:"added",doc:n,oldIndex:-1,newIndex:t++}})}{let r=e._snapshot.oldDocs;return e._snapshot.docChanges.filter(e=>t||3!==e.type).map(t=>{let n=new o8(e._firestore,e._userDataWriter,t.doc.key,t.doc,new o9(e._snapshot.mutatedKeys.has(t.doc.key),e._snapshot.fromCache),e.query.converter),s=-1,i=-1;return 0!==t.type&&(s=r.indexOf(t.doc.key),r=r.delete(t.doc.key)),1!==t.type&&(i=(r=r.add(t.doc)).indexOf(t.doc.key)),{type:function(e){switch(e){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return T(61501,{type:e})}}(t.type),doc:n,oldIndex:s,newIndex:i}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new O(P.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e={};e.type=o7._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=N.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;let t=[],r=[],n=[];return this.docs.forEach(e=>{null!==e._document&&(t.push(e._document),r.push(this._userDataWriter.convertObjectMap(e._document.data.value.mapValue.fields,"previous")),n.push(e.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */o7._jsonSchemaVersion="firestore/querySnapshot/1.0",o7._jsonSchema={type:Z("string",o7._jsonSchemaVersion),bundleSource:Z("string","QuerySnapshot"),bundleName:Z("string"),bundle:Z("string")}}}]);