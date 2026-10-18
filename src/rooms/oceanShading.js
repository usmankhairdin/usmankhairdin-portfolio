import { MOON_DIRECTION } from '../experience/nightSkyUniforms.js'
import { CITY_Y } from './cityPlan.js'

// Shared by the underlying ocean and the folded breaker surface, including at
// their flat joins. The teal body uses depth absorption and forward scattering;
// whitewater has a rough diffuse response rather than a bright painted stripe.
export const OCEAN_SHADING_GLSL=`
  vec3 oceanShade(vec3 p,vec3 n,vec3 eye,float d,float depth,float foam,float froth,float aeration,float raised,float footprint){
    vec3 v=normalize(eye-p),moon=normalize(vec3(${MOON_DIRECTION.map(v=>v.toFixed(6)).join(',')}));
    float ndv=max(dot(n,v),.001),ndl=max(dot(n,moon),0.);
    float fresnel=.0204+.9796*pow(1.-ndv,5.);
    vec3 reflection=reflect(-v,n);
    vec3 sky=mix(vec3(.007,.023,.042),vec3(.0015,.006,.018),smoothstep(-.05,.65,reflection.y));
    float shallow=1.-smoothstep(0.,15.,depth);
    vec3 body=mix(vec3(.0015,.009,.024),vec3(.002,.027,.045),shallow);
    body*=.34+1.7*ndl;
    float backlight=pow(max(dot(-v,moon),0.),3.5)*pow(1.-max(dot(n,moon),0.),2.);
    body+=vec3(.003,.033,.046)*backlight*clamp(raised*.22,0.,1.);
    body+=vec3(.001,.014,.026)*clamp(raised*.16,0.,1.)*(.25+.75*ndl);
    body+=vec3(.001,.008,.012)*aeration;
    vec3 color=mix(body,sky,fresnel);
    vec3 halfVector=normalize(v+moon);
    float ndh=max(dot(n,halfVector),0.),vdh=max(dot(v,halfVector),0.);
    float variance=dot(dFdx(n),dFdx(n))+dot(dFdy(n),dFdy(n));
    float roughness=clamp(.19+.15*smoothstep(.8,12.,footprint)+.1*smoothstep(12.,70.,footprint)+sqrt(variance)*.45,.19,.52);
    float alpha=roughness*roughness,denominator=ndh*ndh*(alpha*alpha-1.)+1.;
    float distribution=alpha*alpha/(3.14159265*denominator*denominator),masking=(roughness+1.)*(roughness+1.)/8.;
    float visibility=ndv/(ndv*(1.-masking)+masking)*max(ndl,.001)/(max(ndl,.001)*(1.-masking)+masking);
    float specular=distribution*visibility*(.02+.98*pow(1.-vdh,5.))/max(4.*ndv*max(ndl,.001),.001);
    color+=vec3(.65,.83,1.)*(.16*(1.-exp(-specular*.16)))*ndl;
    float foamCoverage=clamp(foam*(.5+.72*froth),0.,.98);
    vec3 whitewater=mix(vec3(.019,.074,.135),vec3(.10,.25,.36),clamp(.24+ndl*.9+aeration*.3,0.,1.));
    whitewater*=.82+.3*froth;
    return mix(color,whitewater,foamCoverage);
  }
  vec3 oceanHaze(vec3 color,vec3 p,vec3 eye,float marine){
    float low=exp(-max(p.y-(${CITY_Y.toFixed(2)}),0.)/160.);
    float extinction=mix(.00095,.00028,marine);
    float haze=(1.-exp(-length(p-eye)*extinction))*(.62+.38*low);
    return mix(color,mix(vec3(.007,.011,.017),vec3(.004,.009,.018),marine),clamp(haze,0.,mix(.9,.7,marine)));
  }
`
