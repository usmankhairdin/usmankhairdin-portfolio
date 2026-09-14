import { Link, NavLink } from 'react-router-dom'
import { useJourney } from '../experience/JourneyContext.jsx'

const immersiveItems=[
  {label:'Work',door:'work',to:'/work/'},
  {label:'Services',door:'services',to:'/services/'},
  {label:'For agencies',door:'agencies',to:'/for-agencies/'},
  {label:'About',door:'about',to:'/about/'}
]

export default function Header({ immersive=false }) {
  const journey=useJourney()
  const trigger=(e,door)=>{
    if(!immersive||!journey) return
    e.preventDefault()
    journey.requestDoor(door)
  }
  return <header className={`topbar ${immersive ? 'topbar--immersive' : ''}`}>
    <Link to="/" className="brand"><span className="brand-dot">U</span><span>Usman Khair Din</span></Link>
    <nav className="nav">
      {immersive ? immersiveItems.map(item=><a key={item.door} href={item.to} onClick={e=>trigger(e,item.door)} className={journey?.activeDoor===item.door?'active':''}>{item.label}</a>) : <>
        <NavLink to="/work/">Work</NavLink>
        <NavLink to="/services/">Services</NavLink>
        <NavLink to="/for-agencies/">For agencies</NavLink>
        <NavLink to="/about/">About</NavLink>
      </>}
    </nav>
    {immersive ? <a href="/contact/" onClick={e=>trigger(e,'contact')} className={`pill pill--primary ${journey?.activeDoor==='contact'?'active':''}`}>Start a project <span>↗</span></a> : <Link to="/contact/" className="pill pill--primary">Start a project <span>↗</span></Link>}
  </header>
}
