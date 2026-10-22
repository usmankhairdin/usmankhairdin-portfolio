import{r as O,j as F}from"./loaderCarton-BoLaSt0p.js";import{J as He,K as _e,Q as ue,R as G,U as Ve,B as pe,x as Re,V as v,X as qe,Y as Z,Z as We,i as Ye,_ as ee,d as V,$ as q,a0 as $e,a1 as Je,M as je,W as Qe,m as Ee,A as Xe,S as Ke,o as Ze,G as ze,H as et,D as tt,l as nt,a2 as it,b as Ae,k as Ue,v as ot,g as rt,a3 as Le,a4 as st}from"./scene-CByeHQaW.js";function te(s,e,n=1){const i=s*Math.PI/180,t=e*Math.PI/180;return[n*Math.cos(t)*Math.sin(i),n*Math.sin(t),n*Math.cos(t)*Math.cos(i)]}function Pe(s,e,n){let i=!1;for(let t=0,a=n.length-1;t<n.length;a=t++){const[d,c]=n[t],[g,h]=n[a];c>e!=h>e&&s<(g-d)*(e-c)/(h-c)+d&&(i=!i)}return i}function at(s){return s.features.flatMap(({geometry:e})=>e.type==="Polygon"?[e.coordinates]:e.type==="MultiPolygon"?e.coordinates:[])}function lt(s,e,n){return n.some(i=>Pe(s,e,i[0])&&!i.slice(1).some(t=>Pe(s,e,t)))}function ct(s,e,n){return e+(s-e)*Math.exp(-Math.max(0,n)/.3)}function dt(s,e,{radius:n=1.516,curvature:i=.05,steps:t=192}={}){const a=te(...s),d=te(...e),c=Math.acos(Math.max(-1,Math.min(1,a.reduce((m,S,_)=>m+S*d[_],0)))),g=Math.sin(c),h=[a[1]*d[2]-a[2]*d[1],a[2]*d[0]-a[0]*d[2],a[0]*d[1]-a[1]*d[0]],f=Math.hypot(...h)||1;return Array.from({length:t+1},(m,S)=>{const _=S/t,W=Math.sin(Math.PI*_),j=c<1e-7?1-_:Math.sin((1-_)*c)/g,D=c<1e-7?_:Math.sin(_*c)/g,z=a.map((b,I)=>b*j+d[I]*D+h[I]/f*i*W),k=Math.hypot(...z),E=n+1.5*i*W;return z.map(b=>b/k*E)})}const ke=new pe,Q=new v;class Ie extends He{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],n=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],i=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(i),this.setAttribute("position",new _e(e,3)),this.setAttribute("uv",new _e(n,2))}applyMatrix4(e){const n=this.attributes.instanceStart,i=this.attributes.instanceEnd;return n!==void 0&&(n.applyMatrix4(e),i.applyMatrix4(e),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let n;e instanceof Float32Array?n=e:Array.isArray(e)&&(n=new Float32Array(e));const i=new ue(n,6,1);return this.setAttribute("instanceStart",new G(i,3,0)),this.setAttribute("instanceEnd",new G(i,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let n;e instanceof Float32Array?n=e:Array.isArray(e)&&(n=new Float32Array(e));const i=new ue(n,6,1);return this.setAttribute("instanceColorStart",new G(i,3,0)),this.setAttribute("instanceColorEnd",new G(i,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new Ve(e.geometry)),this}fromLineSegments(e){const n=e.geometry;return this.setPositions(n.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new pe);const e=this.attributes.instanceStart,n=this.attributes.instanceEnd;e!==void 0&&n!==void 0&&(this.boundingBox.setFromBufferAttribute(e),ke.setFromBufferAttribute(n),this.boundingBox.union(ke))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Re),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,n=this.attributes.instanceEnd;if(e!==void 0&&n!==void 0){const i=this.boundingSphere.center;this.boundingBox.getCenter(i);let t=0;for(let a=0,d=e.count;a<d;a++)Q.fromBufferAttribute(e,a),t=Math.max(t,i.distanceToSquared(Q)),Q.fromBufferAttribute(n,a),t=Math.max(t,i.distanceToSquared(Q));this.boundingSphere.radius=Math.sqrt(t),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}}ee.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new Ye(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};Z.line={uniforms:We.merge([ee.common,ee.fog,ee.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			float alpha = opacity;
			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};class he extends qe{constructor(e){super({type:"LineMaterial",uniforms:We.clone(Z.line.uniforms),vertexShader:Z.line.vertexShader,fragmentShader:Z.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const ce=new q,Ce=new v,Be=new v,w=new q,y=new q,U=new q,de=new v,fe=new Je,x=new $e,Te=new v,X=new pe,K=new Re,L=new q;let P,R;function De(s,e,n){return L.set(0,0,-e,1).applyMatrix4(s.projectionMatrix),L.multiplyScalar(1/L.w),L.x=R/n.width,L.y=R/n.height,L.applyMatrix4(s.projectionMatrixInverse),L.multiplyScalar(1/L.w),Math.abs(Math.max(L.x,L.y))}function ft(s,e){const n=s.matrixWorld,i=s.geometry,t=i.attributes.instanceStart,a=i.attributes.instanceEnd,d=Math.min(i.instanceCount,t.count);for(let c=0,g=d;c<g;c++){x.start.fromBufferAttribute(t,c),x.end.fromBufferAttribute(a,c),x.applyMatrix4(n);const h=new v,f=new v;P.distanceSqToSegment(x.start,x.end,f,h),f.distanceTo(h)<R*.5&&e.push({point:f,pointOnLine:h,distance:P.origin.distanceTo(f),object:s,face:null,faceIndex:c,uv:null,uv1:null})}}function ut(s,e,n){const i=e.projectionMatrix,a=s.material.resolution,d=s.matrixWorld,c=s.geometry,g=c.attributes.instanceStart,h=c.attributes.instanceEnd,f=Math.min(c.instanceCount,g.count),m=-e.near;P.at(1,U),U.w=1,U.applyMatrix4(e.matrixWorldInverse),U.applyMatrix4(i),U.multiplyScalar(1/U.w),U.x*=a.x/2,U.y*=a.y/2,U.z=0,de.copy(U),fe.multiplyMatrices(e.matrixWorldInverse,d);for(let S=0,_=f;S<_;S++){if(w.fromBufferAttribute(g,S),y.fromBufferAttribute(h,S),w.w=1,y.w=1,w.applyMatrix4(fe),y.applyMatrix4(fe),w.z>m&&y.z>m)continue;if(w.z>m){const E=w.z-y.z,b=(w.z-m)/E;w.lerp(y,b)}else if(y.z>m){const E=y.z-w.z,b=(y.z-m)/E;y.lerp(w,b)}w.applyMatrix4(i),y.applyMatrix4(i),w.multiplyScalar(1/w.w),y.multiplyScalar(1/y.w),w.x*=a.x/2,w.y*=a.y/2,y.x*=a.x/2,y.y*=a.y/2,x.start.copy(w),x.start.z=0,x.end.copy(y),x.end.z=0;const j=x.closestPointToPointParameter(de,!0);x.at(j,Te);const D=je.lerp(w.z,y.z,j),z=D>=-1&&D<=1,k=de.distanceTo(Te)<R*.5;if(z&&k){x.start.fromBufferAttribute(g,S),x.end.fromBufferAttribute(h,S),x.start.applyMatrix4(d),x.end.applyMatrix4(d);const E=new v,b=new v;P.distanceSqToSegment(x.start,x.end,b,E),n.push({point:b,pointOnLine:E,distance:P.origin.distanceTo(b),object:s,face:null,faceIndex:S,uv:null,uv1:null})}}}class pt extends V{constructor(e=new Ie,n=new he({color:Math.random()*16777215})){super(e,n),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,n=e.attributes.instanceStart,i=e.attributes.instanceEnd,t=new Float32Array(2*n.count);for(let d=0,c=0,g=n.count;d<g;d++,c+=2)Ce.fromBufferAttribute(n,d),Be.fromBufferAttribute(i,d),t[c]=c===0?0:t[c-1],t[c+1]=t[c]+Ce.distanceTo(Be);const a=new ue(t,2,1);return e.setAttribute("instanceDistanceStart",new G(a,1,0)),e.setAttribute("instanceDistanceEnd",new G(a,1,1)),this}raycast(e,n){const i=this.material.worldUnits,t=e.camera;t===null&&!i&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const a=e.params.Line2!==void 0&&e.params.Line2.threshold||0;P=e.ray;const d=this.matrixWorld,c=this.geometry,g=this.material;R=g.linewidth+a,c.boundingSphere===null&&c.computeBoundingSphere(),K.copy(c.boundingSphere).applyMatrix4(d);let h;if(i)h=R*.5;else{const m=Math.max(t.near,K.distanceToPoint(P.origin));h=De(t,m,g.resolution)}if(K.radius+=h,P.intersectsSphere(K)===!1)return;c.boundingBox===null&&c.computeBoundingBox(),X.copy(c.boundingBox).applyMatrix4(d);let f;if(i)f=R*.5;else{const m=Math.max(t.near,X.distanceToPoint(P.origin));f=De(t,m,g.resolution)}X.expandByScalar(f),P.intersectsBox(X)!==!1&&(i?ft(this,n):ut(this,t,n))}onBeforeRender(e){const n=this.material.uniforms;n&&n.resolution&&(e.getViewport(ce),this.material.uniforms.resolution.value.set(ce.z,ce.w))}}class Oe extends Ie{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const n=e.length-3,i=new Float32Array(2*n);for(let t=0;t<n;t+=3)i[2*t]=e[t],i[2*t+1]=e[t+1],i[2*t+2]=e[t+2],i[2*t+3]=e[t+3],i[2*t+4]=e[t+4],i[2*t+5]=e[t+5];return super.setPositions(i),this}setColors(e){const n=e.length-3,i=new Float32Array(2*n);for(let t=0;t<n;t+=3)i[2*t]=e[t],i[2*t+1]=e[t+1],i[2*t+2]=e[t+2],i[2*t+3]=e[t+3],i[2*t+4]=e[t+4],i[2*t+5]=e[t+5];return super.setColors(i),this}setFromPoints(e){const n=e.length-1,i=new Float32Array(6*n);for(let t=0;t<n;t++)i[6*t]=e[t].x,i[6*t+1]=e[t].y,i[6*t+2]=e[t].z||0,i[6*t+3]=e[t+1].x,i[6*t+4]=e[t+1].y,i[6*t+5]=e[t+1].z||0;return super.setPositions(i),this}fromLine(e){const n=e.geometry;return this.setPositions(n.attributes.position.array),this}}class ht extends pt{constructor(e=new Oe,n=new he({color:Math.random()*16777215})){super(e,n),this.isLine2=!0,this.type="Line2"}}const H={London:[-.12,51.5],"New York":[-74,40.7],Tokyo:[139.69,35.68]};function mt(s,e){let n;try{n=new Qe({canvas:s,alpha:!0,antialias:!0,powerPreference:"high-performance"})}catch{return null}n.setClearColor(0,0),n.setPixelRatio(Math.min(devicePixelRatio,1.5)),n.outputColorSpace=Ee,n.toneMapping=Xe;const i=new Ke,t=new Ze(34,1,.1,30),a=new ze;i.add(a),t.position.set(0,0,5.8),i.add(new et("#fff4df","#8c4d30",2));const d=new tt("#fff4e6",3);d.position.set(-3,4,5),i.add(d);const c=at(e),g=[];for(let o=-57;o<80;o+=1.8)for(let r=-180;r<180;r+=1.8/Math.max(.3,Math.cos(o*Math.PI/180)))lt(r,o,c)&&g.push([r,o]);const h=document.createElement("canvas");h.width=4096,h.height=2048;const f=h.getContext("2d"),m=new nt(h);m.colorSpace=Ee,m.anisotropy=Math.min(8,n.capabilities.getMaxAnisotropy()),m.wrapS=it;const S=([o,r])=>[(o+180)/360*4096,(90-r)/180*2048];function _(o){f.fillStyle=o?"#33251d":"#eedccd",f.fillRect(0,0,4096,2048),f.lineWidth=2,f.strokeStyle=o?"#76513b":"#d5b59d",f.globalAlpha=.4;for(const r of[-60,-30,0,30,60]){const p=S([0,r])[1];f.beginPath(),f.moveTo(0,p),f.lineTo(4096,p),f.stroke()}for(let r=-180;r<180;r+=60){const p=S([r,0])[0];f.beginPath(),f.moveTo(p,0),f.lineTo(p,2048),f.stroke()}f.globalAlpha=1,f.fillStyle=o?"#e9a16f":"#a34e2c";for(const r of g){const[p,l]=S(r);f.beginPath(),f.ellipse(p,l,3.2/Math.max(.25,Math.cos(r[1]*Math.PI/180)),3.2,0,0,Math.PI*2),f.fill()}f.strokeStyle=o?"#c8895d":"#b97953",f.lineWidth=2.2,f.globalAlpha=.72;for(const r of c)for(const p of r)f.beginPath(),p.forEach((l,u)=>{const[A,M]=S(l);u===0||Math.abs(l[0]-p[u-1][0])>180?f.moveTo(A,M):f.lineTo(A,M)}),f.stroke();f.globalAlpha=1,m.needsUpdate=!0}_(!1);const W=new Ae({map:m,color:"#ffffff",roughness:.78,metalness:.06}),j=new V(new Ue(1.5,160,112,Math.PI*1.5),W);a.add(j);const D=Object.entries(H),z=D.map(([,o])=>new v(...te(...o))),k={uMarketTime:{value:0},uMarketWeights:{value:new v(1,0,0)},uMarketInk:{value:new ot("#61412c")}};z.forEach((o,r)=>{k["uMarket"+r]={value:o}}),W.onBeforeCompile=o=>{Object.assign(o.uniforms,k),o.vertexShader=`varying vec3 vMarketPoint;
`+o.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vMarketPoint=normalize(position);`),o.fragmentShader=`varying vec3 vMarketPoint;
   uniform vec3 uMarket0,uMarket1,uMarket2,uMarketWeights,uMarketInk;
   uniform float uMarketTime;
   float marketGlow(vec3 direction,float weight){
    float distance=acos(clamp(dot(normalize(vMarketPoint),direction),-1.0,1.0));
    float wave=fract(uMarketTime*.18)*.42;
    float pulse=exp(-pow((distance-wave)/.028,2.0))*pow(1.0-wave/.42,1.5);
    float focus=exp(-distance*distance/.018);
    return weight*(focus*.12+pulse*.24);
   }
  `+o.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
   float focus=marketGlow(uMarket0,uMarketWeights.x)+marketGlow(uMarket1,uMarketWeights.y)+marketGlow(uMarket2,uMarketWeights.z);
   diffuseColor.rgb=mix(diffuseColor.rgb,uMarketInk,clamp(focus,0.0,.35));`)};const E=new Ae({color:"#2b231e",roughness:.3,metalness:.25}),b=new rt({color:"#fff4df"}),I=D.map(([o],r)=>{const p=o==="New York"?E.clone():E;o==="New York"&&p.color.set("#d95a31");const l=new ze;l.position.copy(z[r]).multiplyScalar(1.5),l.quaternion.setFromUnitVectors(new v(0,1,0),z[r]);const u=new V(new Le(.067,32),b);u.rotation.x=-Math.PI/2,u.position.y=.007,l.add(u);const A=new V(new Ue(.039,24,16),p);A.position.y=.028,l.add(A);const M=new V(new Le(.014,24),b);return M.rotation.x=-Math.PI/2,M.position.y=.068,l.add(M),a.add(l),{name:o,group:l,direction:z[r],weight:r===0?1:0,target:r===0?1:0,label:s.parentElement.querySelector(`[data-city="${o}"]`)}});let me="London",ge=!1;const C=[],ve=o=>{const r=Math.max(0,Math.min(1,o));return r*r*r*(r*(r*6-15)+10)};function Fe(o){for(const T of C)T.closing=!0,T.elapsed=0,T.start=T.progress;if(o==="London")return;const r=o==="New York"?"London":"New York",p=dt(H[r],H[o]),l=new Oe;l.setPositions(p.flat());const u=new he({color:o==="New York"?"#d95a31":ge?"#ffecd1":"#493124",linewidth:1.8,dashed:!0,dashSize:.055,gapSize:.038,transparent:!0,opacity:.95,depthWrite:!1}),A={value:0};u.onBeforeCompile=T=>{T.uniforms.uRouteReveal=A,T.fragmentShader=`uniform float uRouteReveal;
`+T.fragmentShader.replace("#include <clipping_planes_fragment>",`#include <clipping_planes_fragment>
if(vLineDistance>uRouteReveal) discard;`)};const M=new ht(l,u);M.computeLineDistances(),M.frustumCulled=!1,a.add(M);const J=l.attributes.instanceDistanceEnd,Ne=J.getX(J.count-1);C.push({from:r,to:o,line:M,reveal:A,length:Ne,progress:0,elapsed:0,closing:!1,start:0})}const Y=new st;Y.setFromUnitVectors(z[0],new v(0,0,1)),a.quaternion.copy(Y);let N,ne=!1,ie=!1,oe=0,Ge=0,re=1,se=1;const ae=matchMedia("(prefers-reduced-motion: reduce)"),$=new v,we=new v,le=new v,ye=(o,r,p)=>Math.max(r,Math.min(p,o));function xe(){const o=s.parentElement.getBoundingClientRect();re=o.width,se=o.height,n.setSize(o.width,o.height,!1),t.aspect=o.width/o.height,t.updateProjectionMatrix(),t.position.z=t.aspect<1?6.8:5.8,t.updateMatrixWorld(),B()}function Se(o){if(N=void 0,ne||!ie||document.hidden)return;const r=ae.matches;if(r||(N=requestAnimationFrame(Se)),!r&&o-oe<30)return;const p=Math.min(.1,Math.max(0,(o-oe)/1e3));oe=o,a.quaternion.slerp(Y,r?1:1-Math.exp(-p/.55)),k.uMarketTime.value=r?1.25:o/1e3,I.forEach((l,u)=>{if(l.weight=r?l.target:ct(l.weight,l.target,p),k.uMarketWeights.value.setComponent(u,l.weight),l.group.scale.setScalar(.4+.8*l.weight),l.label){$.copy(l.direction).applyQuaternion(a.quaternion),we.copy(t.position).addScaledVector($,-1.66).normalize();const A=$.dot(we);le.copy($).multiplyScalar(1.59).project(t);const M=ye((le.x+1)*re/2+18,8,re-l.label.offsetWidth-8),J=ye((1-le.y)*se/2-45,8,se-64);l.label.style.transform=`translate(${M}px,${J}px)`,l.label.style.opacity=l.weight*je.smoothstep(A,0,.18)}});for(let l=C.length-1;l>=0;l--){const u=C[l];u.elapsed+=p,u.progress=r?u.closing?0:1:u.closing?u.start*(1-ve(u.elapsed/.65)):ve(u.elapsed/2.6),u.reveal.value=u.progress*u.length,u.closing&&u.progress===0&&(a.remove(u.line),u.line.geometry.dispose(),u.line.material.dispose(),C.splice(l,1))}n.render(i,t),s.dataset.ready="true",s.dataset.frame=String(++Ge),s.dataset.landPoints=String(g.length),s.dataset.surface="single mapped sphere",s.dataset.beacons="3",s.dataset.routes=String(C.length),s.dataset.routeProgress=C.map(l=>l.progress.toFixed(3)).join(","),s.dataset.connection=C.filter(l=>!l.closing).map(l=>l.from+" to "+l.to).join(","),s.dataset.focusWeights=I.map(l=>l.weight.toFixed(3)).join(",")}function B(){!N&&ie&&!document.hidden&&!ne&&(N=requestAnimationFrame(Se))}const be=new ResizeObserver(xe);be.observe(s.parentElement);const Me=new IntersectionObserver(([o])=>{ie=o.isIntersecting,B()},{rootMargin:"150px"});return Me.observe(s),document.addEventListener("visibilitychange",B),ae.addEventListener("change",B),xe(),{setCity(o){H[o]&&(o!==me&&(Fe(o),me=o),I.forEach(r=>{r.target=r.name===o?1:0}),s.dataset.origin=o,Y.setFromUnitVectors(new v(...te(...H[o])).normalize(),new v(0,0,1)),B())},setTheme(o){const r=o==="dark";ge=r;for(const p of C)p.line.material.color.set(p.to==="New York"?"#d95a31":r?"#ffecd1":"#493124");_(r),E.color.set(r?"#ffddb6":"#2b231e"),b.color.set(r?"#2b231e":"#fff4df"),k.uMarketInk.value.set(r?"#ffddb6":"#61412c"),n.toneMappingExposure=r?1.35:1.05,B()},dispose(){ne=!0,cancelAnimationFrame(N),be.disconnect(),Me.disconnect(),document.removeEventListener("visibilitychange",B),ae.removeEventListener("change",B);const o=new Set;i.traverse(r=>{r.geometry?.dispose(),r.material&&o.add(r.material)}),o.forEach(r=>r.dispose()),m.dispose(),n.dispose()}}}const gt=(s,e)=>new URL(`../${s}`,e).href;function yt({city:s,theme:e}){const n=O.useRef(null),i=O.useRef(null),t=O.useRef({city:s,theme:e});return t.current={city:s,theme:e},O.useEffect(()=>{const a=new AbortController;let d;return fetch(gt("data/land.geojson",import.meta.url),{signal:a.signal}).then(c=>{if(!c.ok)throw new Error("Map data unavailable");return c.json()}).then(c=>{d=mt(n.current,c),i.current=d,d?.setCity(t.current.city),d?.setTheme(t.current.theme),d||(n.current.parentElement.dataset.fallback="true")}).catch(c=>{c.name!=="AbortError"&&(n.current.parentElement.dataset.fallback="true")}),()=>{a.abort(),d?.dispose(),i.current=null}},[]),O.useEffect(()=>{i.current?.setCity(s)},[s]),O.useEffect(()=>{i.current?.setTheme(e)},[e]),F.jsxs("div",{className:"globe-viewport",children:[F.jsx("canvas",{ref:n,role:"img","aria-label":"Three-dimensional world with real continents and market locations"}),[["London","United Kingdom"],["New York","United States"],["Tokyo","Japan"]].map(([a,d])=>F.jsxs("div",{className:"globe-city-label","data-city":a,"aria-hidden":"true",children:[F.jsx("strong",{children:a}),F.jsx("span",{children:d})]},a)),F.jsx("div",{className:"globe-fallback","aria-hidden":"true",children:"◉"})]})}export{yt as C};
