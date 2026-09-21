function FloatingTag({className='',children}){
  return <span className={`route-blueprint__tag ${className}`}>{children}</span>
}

function Grid({x=42,y=44,width=650,height=338,step=44,axis='both'}){
  const vertical=[]
  const horizontal=[]
  if(axis!=='horizontal') for(let px=x;px<=x+width;px+=step) vertical.push(<path key={`v${px}`} d={`M${px} ${y} V${y+height}`}/>)
  if(axis!=='vertical') for(let py=y;py<=y+height;py+=step) horizontal.push(<path key={`h${py}`} d={`M${x} ${py} H${x+width}`}/>)
  return <g className="route-blueprint__grid">{vertical}{horizontal}</g>
}

function FlowRunner({path,dur='7s',begin='-2s',r=6,className=''}){
  return <circle className={`route-blueprint__runner ${className}`} r={r}>
    <animateMotion path={path} dur={dur} begin={begin} repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines=".45 0 .55 1"/>
  </circle>
}

function SectionRunner({path,dur='9s',begin='-3s'}){
  return <circle className="rsa-runner" r="5">
    <animateMotion path={path} dur={dur} begin={begin} repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines=".45 0 .55 1"/>
  </circle>
}

/* SERVICES — a component workbench: tokens and components resolve into code and a responsive preview. */
export function ServicesHeroBlueprint(){
  const flow='M208 320 C300 358 428 354 612 300'
  return <div className="route-blueprint route-blueprint--services" aria-hidden="true">
    <svg viewBox="0 0 760 430" role="presentation" focusable="false">
      <Grid x={54} y={58} width={620} height={300} step={46} axis="vertical"/>
      <g className="rb-services-workbench">
        <rect className="rb-surface" x="84" y="80" width="492" height="270" rx="22"/>
        <path className="rb-line" d="M84 120H576"/>
        <circle className="rb-dot" cx="108" cy="100" r="5"/><circle className="rb-dot" cx="125" cy="100" r="5"/><circle className="rb-dot" cx="142" cy="100" r="5"/>
        <rect className="rb-panel" x="106" y="145" width="116" height="176" rx="13"/>
        <path className="rb-ink rb-ink--thin" d="M128 170h62M128 194h46M128 218h58M128 272h54"/>
        <rect className="rb-accent-soft" x="128" y="238" width="70" height="14" rx="7"/>
        <g className="rb-service-cards">
          <g style={{'--rb-delay':'-.8s'}}><rect className="rb-card" x="246" y="146" width="130" height="70" rx="13"/><circle className="rb-accent" cx="268" cy="168" r="6"/><path className="rb-ink rb-ink--thin" d="M286 165h66M264 191h88"/></g>
          <g style={{'--rb-delay':'-2.1s'}}><rect className="rb-card" x="394" y="146" width="154" height="70" rx="13"/><rect className="rb-accent-soft" x="414" y="164" width="42" height="12" rx="6"/><path className="rb-ink rb-ink--thin" d="M414 191h108"/></g>
          <g style={{'--rb-delay':'-3.5s'}}><rect className="rb-card" x="246" y="236" width="302" height="84" rx="13"/><path className="rb-code" d="m268 271 13-11m-13 11 13 11m28-22 13 11-13 11M294 286l8-31"/><path className="rb-ink rb-ink--thin" d="M344 258h170M344 277h132M344 296h151"/></g>
        </g>
      </g>
      <g className="route-blueprint__device rb-services-device">
        <rect className="rb-surface" x="566" y="198" width="104" height="166" rx="22"/>
        <rect className="rb-accent-soft" x="580" y="224" width="76" height="52" rx="11"/>
        <path className="rb-ink rb-ink--thin" d="M580 297h60M580 315h72M580 333h48"/>
      </g>
      <path className="route-blueprint__flow" d={flow}/>
      <circle className="route-blueprint__flow-end" cx="208" cy="320" r="5"/><circle className="route-blueprint__flow-end route-blueprint__flow-end--open" cx="612" cy="300" r="6"/>
      <FlowRunner path={flow} dur="8.2s" begin="-5.1s"/>
    </svg>
    <FloatingTag className="route-blueprint__tag--a">PRODUCT UI</FloatingTag>
    <FloatingTag className="route-blueprint__tag--b">COMPONENTS</FloatingTag>
    <FloatingTag className="route-blueprint__tag--c">RESPONSIVE</FloatingTag>
  </div>
}

/* AGENCIES — a true delivery pipeline: agency brief → protected production lane → client-ready handoff. */
export function AgenciesHeroBlueprint(){
  const flow='M226 182 C270 182 274 206 304 206 C380 206 432 206 494 206 C526 206 532 222 560 222'
  return <div className="route-blueprint route-blueprint--agencies" aria-hidden="true">
    <svg viewBox="0 0 760 430" role="presentation" focusable="false">
      <Grid x={60} y={72} width={626} height={260} step={52} axis="horizontal"/>
      <g className="rb-agency-input">
        <rect className="rb-surface" x="72" y="132" width="154" height="102" rx="18"/>
        <rect className="rb-accent-soft" x="92" y="153" width="48" height="11" rx="5.5"/>
        <path className="rb-ink rb-ink--thin" d="M92 181h112M92 201h82M92 219h98"/>
      </g>
      <g className="rb-agency-production">
        <rect className="rb-surface" x="304" y="76" width="190" height="258" rx="22"/>
        <path className="rb-line" d="M304 118h190"/>
        <circle className="rb-dot" cx="326" cy="98" r="5"/><circle className="rb-dot" cx="343" cy="98" r="5"/>
        <rect className="rb-card" x="330" y="144" width="138" height="58" rx="12"/>
        <rect className="rb-card" x="330" y="218" width="138" height="82" rx="12"/>
        <path className="rb-ink rb-ink--thin" d="M348 163h92M348 181h68M348 239h94M348 259h104M348 279h66"/>
        <path className="rb-code" d="M448 244h9v9M457 244l-13 13"/>
      </g>
      <g className="rb-agency-output">
        <rect className="rb-surface" x="560" y="144" width="132" height="156" rx="19"/>
        <rect className="rb-accent-soft" x="578" y="164" width="96" height="50" rx="10"/>
        <path className="rb-ink rb-ink--thin" d="M578 235h82M578 253h96M578 271h62"/>
      </g>
      <path className="route-blueprint__flow route-blueprint__flow--agency" d={flow}/>
      <FlowRunner path={flow} dur="9s" begin="-3.8s" r={6}/>
      <g className="rb-agency-shield"><path d="M399 346 426 355v20c0 19-13 31-27 39-14-8-27-20-27-39v-20l27-9Z"/><path d="m387 376 9 8 16-19"/></g>
      <path className="rb-agency-boundary-line" d="M272 66v300M526 66v300"/>
    </svg>
    <FloatingTag className="route-blueprint__tag--a">AGENCY BRIEF</FloatingTag>
    <FloatingTag className="route-blueprint__tag--b">PRODUCTION LANE</FloatingTag>
    <FloatingTag className="route-blueprint__tag--c">CLIENT READY</FloatingTag>
  </div>
}

/* CONTACT — an intake form becomes a routed brief, a review checkpoint and a clear start state. */
export function ContactHeroBlueprint(){
  const flow='M454 206 C510 206 504 132 568 132 C625 132 620 270 688 270'
  return <div className="route-blueprint route-blueprint--contact" aria-hidden="true">
    <svg viewBox="0 0 760 430" role="presentation" focusable="false">
      <Grid x={78} y={56} width={590} height={300} step={50} axis="vertical"/>
      <g className="rb-contact-form">
        <rect className="rb-surface rb-contact-shell" x="90" y="68" width="364" height="294" rx="24"/>
        <path className="rb-line" d="M90 112h364"/>
        <rect className="rb-accent-soft" x="120" y="140" width="128" height="18" rx="9"/>
        <rect className="rb-card rb-contact-field rb-contact-field--primary" x="120" y="179" width="304" height="48" rx="11"/>
        <rect className="rb-card rb-contact-field rb-contact-field--secondary" x="120" y="244" width="304" height="70" rx="11"/>
        <rect className="rb-accent" x="120" y="330" width="94" height="16" rx="8"/>
        <path className="rb-ink rb-ink--thin" d="M140 199h144M140 267h222M140 286h174"/>
      </g>
      <g className="rb-contact-route">
        <path className="route-blueprint__flow" d={flow}/>
        <g className="rb-contact-node" style={{'--rb-delay':'-1s'}}><circle className="rb-surface" cx="535" cy="164" r="27"/><circle className="rb-accent" cx="535" cy="164" r="7"/><path className="rb-route-tick" d="M535 126v-15"/></g>
        <g className="rb-contact-node" style={{'--rb-delay':'-3s'}}><circle className="rb-surface" cx="630" cy="211" r="27"/><path className="rb-check" d="m618 211 8 8 17-19"/><path className="rb-route-tick" d="M668 211h16"/></g>
        <circle className="route-blueprint__flow-end route-blueprint__flow-end--open" cx="688" cy="270" r="7"/>
        <FlowRunner path={flow} dur="8.6s" begin="-6s" r={6}/>
      </g>
      <g className="rb-contact-message"><path className="rb-surface" d="M506 304h112a15 15 0 0 1 15 15v40a15 15 0 0 1-15 15h-64l-22 18 4-18h-30a15 15 0 0 1-15-15v-40a15 15 0 0 1 15-15Z"/><path className="rb-ink rb-ink--thin" d="M516 329h86M516 348h62"/></g>
    </svg>
    <FloatingTag className="route-blueprint__tag--a">BRIEF</FloatingTag>
    <FloatingTag className="route-blueprint__tag--b">REVIEW</FloatingTag>
    <FloatingTag className="route-blueprint__tag--c">START</FloatingTag>
  </div>
}

/* WORK — a captured real interface inside scan/crop marks, with proof/verification rather than a generic build canvas. */
export function WorkHeroBlueprint(){
  const flow='M132 366 C254 398 424 396 620 332'
  return <div className="route-blueprint route-blueprint--work" aria-hidden="true">
    <svg viewBox="0 0 760 430" role="presentation" focusable="false">
      <Grid x={66} y={62} width={620} height={292} step={48} axis="both"/>
      <g className="rb-work-stack rb-work-stack--back"><rect className="rb-surface" x="192" y="76" width="394" height="232" rx="19"/></g>
      <g className="rb-work-stack rb-work-stack--front">
        <rect className="rb-surface" x="104" y="112" width="438" height="250" rx="21"/>
        <path className="rb-line" d="M104 150h438"/>
        <circle className="rb-dot" cx="128" cy="131" r="5"/><circle className="rb-dot" cx="145" cy="131" r="5"/><circle className="rb-dot" cx="162" cy="131" r="5"/>
        <rect className="rb-work-hero" x="132" y="176" width="246" height="108" rx="13"/>
        <path className="rb-work-chart" d="M154 253 190 220l32 18 48-46 38 26 44-25"/>
        <circle className="rb-accent" cx="352" cy="193" r="6"/>
        <rect className="rb-accent-soft" x="397" y="176" width="116" height="108" rx="13"/>
        <path className="rb-ink rb-ink--thin" d="M417 204h72M417 225h54M417 246h78"/>
        <rect className="rb-card" x="132" y="302" width="116" height="36" rx="9"/><rect className="rb-card" x="260" y="302" width="116" height="36" rx="9"/><rect className="rb-card" x="388" y="302" width="125" height="36" rx="9"/>
      </g>
      <g className="rb-work-proof">
        <path d="M575 104h58v58M633 266v58h-58M560 324h-58v-58M502 162v-58h58"/>
        <circle className="rb-surface" cx="568" cy="214" r="34"/><path className="rb-check" d="m552 214 10 10 23-27"/>
        <circle className="rb-proof-pulse" cx="568" cy="214" r="49"/>
      </g>
      <path className="route-blueprint__flow" d={flow}/>
      <FlowRunner path={flow} dur="10s" begin="-7.2s" r={6}/>
    </svg>
    <FloatingTag className="route-blueprint__tag--a">REAL CAPTURE</FloatingTag>
    <FloatingTag className="route-blueprint__tag--b">CONTEXT</FloatingTag>
    <FloatingTag className="route-blueprint__tag--c">EVIDENCE</FloatingTag>
  </div>
}

export function RouteSectionGraphic({variant}){
  if(variant==='services-grid'){
    const path='M36 226 C124 177 224 244 360 156'
    return <div className="route-section-art route-section-art--services-grid" aria-hidden="true"><svg viewBox="0 0 420 280"><g className="rsa-grid">{[0,1,2].flatMap(r=>[0,1,2].map(c=><rect key={`${r}-${c}`} x={58+c*82} y={44+r*64} width="58" height="42" rx="9" style={{'--rsa-delay':`${-(r*3+c)*.6}s`}}/>))}</g><path className="rsa-path" d={path}/><SectionRunner path={path} dur="10s" begin="-6s"/><path className="rsa-bracket" d="M46 32h-18v48M374 248h18v-48"/></svg></div>
  }
  if(variant==='delivery'){
    const path='M60 158 C142 88 208 228 296 158 C350 116 378 134 408 158'
    return <div className="route-section-art route-section-art--delivery" aria-hidden="true"><svg viewBox="0 0 460 300"><path className="rsa-rail" d="M52 158 H408"/>{[78,170,262,354].map((x,i)=><g key={x} className="rsa-node" style={{'--rsa-delay':`${-i*1.2}s`}}><circle cx={x} cy="158" r="18"/><circle cx={x} cy="158" r="5"/><path d={`M${x} 122v-18M${x} 194v18`}/></g>)}<path className="rsa-path" d={path}/><SectionRunner path={path} dur="11s" begin="-5s"/></svg></div>
  }
  if(variant==='stack') return <div className="route-section-art route-section-art--stack" aria-hidden="true"><svg viewBox="0 0 420 300"><path className="rsa-bracket" d="M65 66H38v168h27M354 66h28v168h-28"/>{[['UI',100,98],['FE',184,142],['AI',268,186]].map(([t,x,y],i)=><g key={t} className="rsa-chip" style={{'--rsa-delay':`${-i*1.4}s`}}><rect x={x} y={y} width="72" height="42" rx="12"/><text x={x+36} y={y+26}>{t}</text></g>)}<path className="rsa-stack-link" d="M172 119 184 154M256 163l12 35"/></svg></div>
  if(variant==='agency-model'){
    const path='M162 105 C198 105 192 146 220 154 C250 162 248 195 278 195'
    return <div className="route-section-art route-section-art--agency-model" aria-hidden="true"><svg viewBox="0 0 440 300"><rect className="rsa-panel" x="50" y="70" width="112" height="70" rx="13"/><rect className="rsa-panel" x="278" y="160" width="112" height="70" rx="13"/><rect className="rsa-panel rsa-panel--accent" x="164" y="112" width="112" height="86" rx="15"/><path className="rsa-path" d={path}/><SectionRunner path={path} dur="9.5s" begin="-4s"/></svg></div>
  }
  if(variant==='agency-process') return <div className="route-section-art route-section-art--agency-process" aria-hidden="true"><svg viewBox="0 0 440 300"><path className="rsa-rail" d="M84 74V230"/>{[82,132,182,232].map((y,i)=><g key={y} className="rsa-node" style={{'--rsa-delay':`${-i}s`}}><circle cx="84" cy={y} r="13"/><circle cx="84" cy={y} r="4"/><path d={`M112 ${y}h${86+i*24}`}/></g>)}<path className="rsa-process-brace" d="M238 84h74v138h-74"/></svg></div>
  if(variant==='agency-fit') return <div className="route-section-art route-section-art--agency-fit" aria-hidden="true"><svg viewBox="0 0 420 280"><g className="rsa-grid">{[0,1].flatMap(r=>[0,1].map(c=><rect key={`${r}-${c}`} x={76+c*132} y={60+r*96} width="108" height="70" rx="15" style={{'--rsa-delay':`${-(r*2+c)*1.1}s`}}/>))}</g><path className="rsa-bracket" d="M54 42h-22v48M366 238h22v-48"/><path className="rsa-fit-check" d="m303 210 13 13 28-34"/></svg></div>
  if(variant==='contact'){
    const path='M92 246 C162 202 252 282 360 206'
    return <div className="route-section-art route-section-art--contact" aria-hidden="true"><svg viewBox="0 0 440 300"><rect className="rsa-panel" x="86" y="66" width="236" height="158" rx="20"/><path className="rsa-ink" d="M112 104h118M112 136h184M112 168h142"/><path className="rsa-path" d={path}/><SectionRunner path={path} dur="10.5s" begin="-6.5s"/><circle className="rsa-node-dot" cx="360" cy="206" r="7"/></svg></div>
  }
  if(variant==='work-evidence') return <div className="route-section-art route-section-art--work-evidence" aria-hidden="true"><svg viewBox="0 0 440 300"><path className="rsa-bracket" d="M88 72V46h54M352 228v26h-54"/><rect className="rsa-panel" x="126" y="84" width="206" height="132" rx="18"/><path className="rsa-ink" d="M150 116h88M150 142h154M150 166h132"/><circle className="rsa-node-dot" cx="302" cy="190" r="8"/><circle className="rsa-scan" cx="302" cy="190" r="26"/></svg></div>
  return null
}
