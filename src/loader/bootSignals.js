import {TRACES,TRACE_DUTY} from '../components/heroSignalTraces.js'

const layer=document.querySelector('#boot .hero-signal-background__traces')
if(layer && document.documentElement.dataset.boot==='on'){
  const traces=document.createDocumentFragment()
  for(const [col,len,travel,delay,flags] of TRACES){
    const trace=document.createElement('i')
    trace.className=`sb-trace${flags.includes('m')?' sb-trace--m':''}${flags.includes('w')?' sb-trace--w':''}`
    for(const [key,value] of Object.entries({col,len:`${len}px`,cycle:`${(travel/TRACE_DUTY).toFixed(2)}s`,delay:`${delay}s`}))trace.style.setProperty(`--${key}`,value)
    traces.append(trace)
  }
  layer.append(traces)
}
