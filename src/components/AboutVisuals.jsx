export function AboutHeroBlueprint(){
  return <div className="about-hero-blueprint" aria-hidden="true">
    <div className="about-hero-blueprint__label about-hero-blueprint__label--wire">WIREFRAME</div>
    <div className="about-hero-blueprint__label about-hero-blueprint__label--system">SYSTEM</div>
    <div className="about-hero-blueprint__label about-hero-blueprint__label--responsive">RESPONSIVE</div>
    <svg viewBox="0 0 760 500" role="presentation" focusable="false">
      <defs>
        <linearGradient id="aboutBlueprintAccent" x1="0" x2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity=".22"/>
          <stop offset=".48" stopColor="currentColor" stopOpacity=".92"/>
          <stop offset="1" stopColor="currentColor" stopOpacity=".28"/>
        </linearGradient>
      </defs>

      <g className="about-blueprint__grid">
        {Array.from({length:9},(_,i)=><path key={`v-${i}`} d={`M${92+i*72} 54V438`}/>)}
        {Array.from({length:6},(_,i)=><path key={`h-${i}`} d={`M68 ${82+i*64}H704`}/>)}
      </g>

      <g className="about-blueprint__browser">
        <rect x="112" y="76" width="500" height="316" rx="18" className="about-blueprint__surface"/>
        <path d="M112 118H612" className="about-blueprint__line"/>
        <circle cx="137" cy="98" r="5"/><circle cx="155" cy="98" r="5"/><circle cx="173" cy="98" r="5"/>
        <rect x="214" y="91" width="202" height="14" rx="7" className="about-blueprint__url"/>

        <path d="M202 118V392" className="about-blueprint__line"/>
        <rect x="132" y="145" width="49" height="9" rx="4.5" className="about-blueprint__ink about-blueprint__ink--strong"/>
        <rect x="132" y="172" width="38" height="6" rx="3" className="about-blueprint__ink"/>
        <rect x="132" y="193" width="45" height="6" rx="3" className="about-blueprint__ink"/>
        <rect x="132" y="214" width="32" height="6" rx="3" className="about-blueprint__ink"/>
        <rect x="132" y="255" width="42" height="6" rx="3" className="about-blueprint__ink"/>
        <rect x="132" y="276" width="36" height="6" rx="3" className="about-blueprint__ink"/>
        <rect x="132" y="340" width="48" height="25" rx="8" className="about-blueprint__accent-soft"/>

        <g className="about-blueprint__hero-block">
          <rect x="232" y="142" width="122" height="10" rx="5" className="about-blueprint__ink about-blueprint__ink--strong"/>
          <rect x="232" y="168" width="244" height="15" rx="7.5" className="about-blueprint__ink about-blueprint__ink--headline"/>
          <rect x="232" y="193" width="196" height="15" rx="7.5" className="about-blueprint__ink about-blueprint__ink--headline"/>
          <rect x="232" y="226" width="214" height="6" rx="3" className="about-blueprint__ink"/>
          <rect x="232" y="242" width="167" height="6" rx="3" className="about-blueprint__ink"/>
          <rect x="232" y="264" width="86" height="27" rx="13.5" className="about-blueprint__accent"/>
          <rect x="492" y="146" width="88" height="114" rx="14" className="about-blueprint__media"/>
          <path d="m507 236 22-26 17 16 20-28" className="about-blueprint__media-line"/>
          <circle cx="553" cy="174" r="9" className="about-blueprint__media-node"/>
        </g>

        <g className="about-blueprint__cards">
          {[232,348,464].map((x,index)=><g key={x} style={{'--bp-delay':`${.35+index*.12}s`}}>
            <rect x={x} y="316" width="98" height="52" rx="11" className="about-blueprint__card"/>
            <rect x={x+13} y="329" width="18" height="18" rx="5" className="about-blueprint__accent-soft"/>
            <rect x={x+41} y="330" width="42" height="6" rx="3" className="about-blueprint__ink about-blueprint__ink--strong"/>
            <rect x={x+41} y="344" width="31" height="5" rx="2.5" className="about-blueprint__ink"/>
          </g>)}
        </g>
      </g>

      <g className="about-blueprint__selection">
        <rect x="222" y="132" width="370" height="169" rx="10"/>
        {[[222,132],[592,132],[222,301],[592,301]].map(([cx,cy])=><rect key={`${cx}-${cy}`} x={cx-4} y={cy-4} width="8" height="8" rx="1"/>)}
      </g>

      <g className="about-blueprint__mobile">
        <rect x="548" y="205" width="118" height="212" rx="20" className="about-blueprint__surface"/>
        <rect x="584" y="218" width="47" height="5" rx="2.5" className="about-blueprint__ink"/>
        <rect x="564" y="244" width="86" height="52" rx="11" className="about-blueprint__media"/>
        <rect x="564" y="312" width="65" height="7" rx="3.5" className="about-blueprint__ink about-blueprint__ink--strong"/>
        <rect x="564" y="329" width="78" height="5" rx="2.5" className="about-blueprint__ink"/>
        <rect x="564" y="342" width="62" height="5" rx="2.5" className="about-blueprint__ink"/>
        <rect x="564" y="367" width="86" height="27" rx="9" className="about-blueprint__accent-soft"/>
      </g>

      <path className="about-blueprint__flow" d="M214 420 C300 458 410 452 492 416 C540 395 567 381 603 370"/>
      <circle className="about-blueprint__flow-dot" cx="214" cy="420" r="5"/>
      <circle className="about-blueprint__flow-dot about-blueprint__flow-dot--end" cx="603" cy="370" r="4"/>
      <g className="about-blueprint__flow-runner">
        <circle className="about-blueprint__flow-runner-dot" r="6"/>
        <animateMotion
          dur="8.4s"
          repeatCount="indefinite"
          path="M214 420 C300 458 410 452 492 416 C540 395 567 381 603 370"
          keyPoints="0;1;0"
          keyTimes="0;0.5;1"
          calcMode="spline"
          keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
        />
      </g>
    </svg>
  </div>
}

export function AboutSectionGraphic({variant}){
  if(variant==='process') return <div className="about-section-graphic about-section-graphic--process" aria-hidden="true">
    <svg viewBox="0 0 460 360" role="presentation" focusable="false">
      <g className="asg-frame">
        <rect x="72" y="60" width="304" height="222" rx="18"/>
        <path d="M72 103H376"/>
        <circle cx="96" cy="82" r="5"/><circle cx="113" cy="82" r="5"/><circle cx="130" cy="82" r="5"/>
        <rect x="98" y="134" width="86" height="12" rx="6"/>
        <rect x="98" y="164" width="202" height="8" rx="4"/>
        <rect x="98" y="184" width="164" height="8" rx="4"/>
        <rect x="98" y="222" width="74" height="31" rx="15" className="asg-accent"/>
        <rect x="284" y="128" width="66" height="122" rx="12"/>
      </g>
      <path className="asg-path" d="M48 301 C129 268 197 318 274 283 C340 254 365 188 420 171"/>
    </svg>
  </div>

  if(variant==='experience') return <div className="about-section-graphic about-section-graphic--experience" aria-hidden="true">
    <svg viewBox="0 0 500 360" role="presentation" focusable="false">
      <path className="asg-rail" d="M112 58V302"/>
      {[88,180,272].map((y,index)=><g key={y} className="asg-timeline-node" style={{'--asg-delay':`${index*.35}s`}}>
        <circle cx="112" cy={y} r="9"/>
        <path d={`M132 ${y}H196`}/>
        <rect x="196" y={y-30} width="230" height="60" rx="15"/>
        <rect x="218" y={y-10} width="96" height="7" rx="3.5"/>
        <rect x="218" y={y+6} width="144" height="5" rx="2.5"/>
      </g>)}
    </svg>
  </div>

  return <div className="about-section-graphic about-section-graphic--tools" aria-hidden="true">
    <svg viewBox="0 0 520 360" role="presentation" focusable="false">
      <g className="asg-tool-grid">
        {[0,1,2].map(row=>[0,1,2,3].map(col=><rect key={`${row}-${col}`} x={84+col*78} y={78+row*76} width="54" height="54" rx="14" style={{'--asg-delay':`${(row*4+col)*.08}s`}}/>))}
      </g>
      <path className="asg-bracket" d="M54 58H30V302H54 M396 58H420V302H396"/>
      <path className="asg-path" d="M111 318 C188 279 266 337 352 291 C390 271 414 239 450 224"/>
    </svg>
  </div>
}
