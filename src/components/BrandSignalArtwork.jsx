const routeLabels = {
  practice: ['BRIEF', 'SYSTEM', 'SURFACE'],
  work: ['EVIDENCE', 'DETAIL', 'DELIVERY'],
  about: ['THINK', 'DESIGN', 'IMPLEMENT'],
  services: ['BRIEF', 'SYSTEM', 'PRODUCTION'],
  agencies: ['AGENCY', 'PRODUCTION LAYER', 'CLIENT READY'],
  contact: ['BRIEF', 'REVIEW', 'START'],
}

function Field() {
  return <g className="brand-signal-art__field">
    {Array.from({ length: 9 }, (_, index) => <path key={`v${index}`} d={`M${86 + index * 72} 70 V354`} />)}
    {Array.from({ length: 5 }, (_, index) => <path key={`h${index}`} d={`M72 ${102 + index * 58} H704`} />)}
  </g>
}

function Measure({ labels }) {
  return <g className="brand-signal-art__measure">
    <path d="M88 365 H690 M88 359 V371 M292 359 V371 M496 359 V371 M690 359 V371" />
    <text x="88" y="394">{labels[0]}</text>
    <text x="302" y="394">{labels[1]}</text>
    <text x="510" y="394">{labels[2]}</text>
  </g>
}

function AboutComposition() {
  return <>
    <g className="brand-signal-art__about-sketch">
      <path d="M112 278 C153 214 172 148 238 159 C292 168 282 266 348 252" />
      <path d="M118 298 C167 277 210 294 246 269 C278 247 303 207 348 214" />
      <path d="M134 160 L183 118 M150 183 L205 134 M170 204 L218 164" />
      <circle cx="224" cy="179" r="13" />
    </g>
    <g className="brand-signal-art__about-joint">
      <path d="M354 222 H430 L452 199 H556 L580 223 H652" />
      <path d="M354 251 H422 L448 276 H562 L584 251 H652" />
      <path d="M430 222 V251 M556 199 V276" />
      <path className="brand-signal-art__about-rail" d="M338 237 H672" />
      <rect x="463" y="211" width="78" height="51" rx="2" />
      <path d="M477 225 H527 M477 239 H516 M477 253 H533" />
    </g>
    <path className="brand-signal-art__about-thread" d="M114 300 C240 337 307 269 369 237 C451 194 534 290 657 222" />
  </>
}

function ServicesComposition() {
  const panels = [
    { x: 122, y: 245, w: 118, h: 74 },
    { x: 282, y: 192, w: 126, h: 112 },
    { x: 454, y: 132, w: 132, h: 154 },
  ]
  return <>
    <path className="brand-signal-art__services-rail" d="M98 320 H674" />
    <g className="brand-signal-art__services-panels">
      {panels.map((panel, index) => <g key={panel.x} style={{ '--panel-delay': `${index * .13}s` }}>
        <path d={`M${panel.x} ${panel.y + panel.h} V${panel.y} H${panel.x + panel.w} V${panel.y + panel.h} Z`} />
        <path d={`M${panel.x + 16} ${panel.y + 22} H${panel.x + panel.w - 16} M${panel.x + 16} ${panel.y + 40} H${panel.x + panel.w - 37} M${panel.x + 16} ${panel.y + 58} H${panel.x + panel.w - 26}`} />
        <circle cx={panel.x + panel.w - 20} cy={panel.y + 20} r="4" />
      </g>)}
    </g>
    <g className="brand-signal-art__services-registration">
      <path d="M108 320 l9 -9 M108 320 l9 9 M250 320 l9 -9 M250 320 l9 9 M418 320 l9 -9 M418 320 l9 9 M598 320 l9 -9 M598 320 l9 9" />
      <path d="M194 245 V320 M345 192 V320 M520 132 V320" />
    </g>
  </>
}

function AgenciesComposition() {
  return <>
    <g className="brand-signal-art__agencies-lanes">
      <path d="M102 147 H274 C333 147 350 202 417 202 H645" />
      <path d="M102 305 H274 C333 305 350 250 417 250 H645" />
      <path d="M102 173 H252 C306 173 338 222 417 222 H645" />
      <path d="M102 279 H252 C306 279 338 230 417 230 H645" />
    </g>
    <g className="brand-signal-art__agencies-plates">
      <path d="M122 122 H255 V194 H122 Z M122 258 H255 V330 H122 Z" />
      <path d="M465 174 H635 V278 H465 Z" />
      <path d="M142 146 H230 M142 170 H207 M485 201 H612 M485 225 H596 M485 249 H620" />
    </g>
    <path className="brand-signal-art__agencies-merge" d="M270 147 C348 147 350 222 436 222 H654" />
    <circle className="brand-signal-art__agencies-pin" cx="436" cy="222" r="10" />
  </>
}

function ContactComposition() {
  return <>
    <path className="brand-signal-art__contact-line" d="M112 220 H658" />
    <g className="brand-signal-art__contact-nodes">
      {[142, 382, 622].map((x, index) => <g key={x} style={{ '--node-delay': `${index * .18}s` }}>
        <circle cx={x} cy="220" r="20" />
        <circle cx={x} cy="220" r="6" />
        <path d={`M${x - 36} 263 H${x + 36} M${x} 247 V279`} />
      </g>)}
    </g>
    <path className="brand-signal-art__contact-pulse" d="M112 220 C214 220 258 154 382 220 C490 278 548 220 658 220" />
  </>
}

function DefaultComposition() {
  return <>
    <path className="brand-signal-art__default-ribbon" d="M92 284 C156 234 201 135 277 173 C346 208 365 309 445 275 C520 242 564 137 674 179" />
    <g className="brand-signal-art__default-surfaces">
      <path d="M184 133 L314 121 L288 236 L203 248 Z" />
      <path d="M358 188 L498 205 L470 312 L378 294 Z" />
      <path d="M532 115 L646 130 L625 226 L545 212 Z" />
    </g>
  </>
}

export default function BrandSignalArtwork({ variant = 'practice' }) {
  const labels = routeLabels[variant] || routeLabels.practice
  const composition = variant === 'about'
    ? <AboutComposition />
    : variant === 'services'
      ? <ServicesComposition />
      : variant === 'agencies'
        ? <AgenciesComposition />
        : variant === 'contact'
          ? <ContactComposition />
          : <DefaultComposition />

  return <div className={`brand-signal-art brand-signal-art--${variant}`} aria-hidden="true">
    <svg viewBox="0 0 760 440" role="presentation" focusable="false">
      <Field />
      <g className="brand-signal-art__composition">{composition}</g>
      <Measure labels={labels} />
    </svg>
  </div>
}
