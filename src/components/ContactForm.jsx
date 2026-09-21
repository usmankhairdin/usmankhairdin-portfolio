import { useEffect, useRef, useState } from 'react'

const CONTACT_EMAIL = 'brief@usmankhairdin.com'
const ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`
const SUPPORT_OPTIONS = [
  'Website / landing page design',
  'SaaS / dashboard UI',
  'Website redesign',
  'Frontend development',
  'Design to React / Tailwind',
  'White-label agency support',
  'Other',
]

function SupportDropdown({ value, onChange }) {
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!open) return undefined
    const currentIndex = Math.max(0, SUPPORT_OPTIONS.indexOf(value))
    setActiveIndex(currentIndex)
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, value])

  const choose = (option) => {
    onChange(option)
    setOpen(false)
  }

  const handleTriggerKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      const delta = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((index) => (index + delta + SUPPORT_OPTIONS.length) % SUPPORT_OPTIONS.length)
    }
    if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault()
      choose(SUPPORT_OPTIONS[activeIndex])
    }
  }

  return <div className={`custom-select${open ? ' is-open' : ''}`} ref={rootRef}>
    <button
      type="button"
      className="custom-select__trigger"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls="support-options"
      onClick={() => setOpen((state) => !state)}
      onKeyDown={handleTriggerKeyDown}
    >
      <span className={value ? '' : 'is-placeholder'}>{value || 'Select a service'}</span>
      <svg className="custom-select__chevron" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m4 6 4 4 4-4" /></svg>
    </button>
    {open && <div className="custom-select__menu" id="support-options" role="listbox" aria-label="What needs support">
      {SUPPORT_OPTIONS.map((option, index) => <button
        type="button"
        role="option"
        aria-selected={value === option}
        className={`custom-select__option${index === activeIndex ? ' is-active' : ''}${value === option ? ' is-selected' : ''}`}
        key={option}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => choose(option)}
      >
        <span>{option}</span>
        {value === option && <b aria-hidden="true">✓</b>}
      </button>)}
    </div>}
  </div>
}

export default function ContactForm({ immersive = false, source = 'Portfolio website' }) {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [support, setSupport] = useState('')
  const requestRef = useRef(null)
  useEffect(() => () => {
    const request=requestRef.current
    requestRef.current=null
    request?.abort()
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    if (status === 'sending') return

    const form = event.currentTarget
    const data = new FormData(form)
    data.set('_subject', `New portfolio enquiry — ${data.get('name') || 'Website visitor'}`)
    data.set('_template', 'table')
    data.set('_captcha', 'false')
    data.set('source', source)
    data.set('_url', window.location.href)
    const submissionPayload = Object.fromEntries(data.entries())

    setStatus('sending')
    setMessage('')

    const controller = new AbortController()
    requestRef.current?.abort()
    requestRef.current = controller
    const timeout = window.setTimeout(() => controller.abort(), 12000)
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(submissionPayload),
        signal: controller.signal,
      })

      const responsePayload = await response.json().catch(() => ({}))
      const success = response.ok && (responsePayload.success === true || responsePayload.success === 'true')
      const serviceMessage = String(responsePayload.message || '')
      const activationPending = /activat|confirm/i.test(serviceMessage)

      if (success) {
        form.reset()
        setSupport('')
        setStatus('sent')
        setMessage('Thanks — your brief has been sent. I’ll reply by email.')
      } else if (response.ok || activationPending) {
        setStatus('setup')
        setMessage(`One-time setup: FormSubmit has sent an activation email to ${CONTACT_EMAIL}. Open that email, click Activate, then submit the form once more.`)
      } else {
        throw new Error(serviceMessage || 'Unable to send')
      }
    } catch (error) {
      if (controller.signal.aborted && requestRef.current !== controller) return
      setStatus('error')
      setMessage(`The form could not send right now. If this is the first test, check ${CONTACT_EMAIL} for the FormSubmit activation email; otherwise email that address directly.`)
    } finally {
      window.clearTimeout(timeout)
      if(requestRef.current===controller) requestRef.current=null
    }
  }

  return <form
    className={immersive ? 'contact-room-form' : 'contact-form'}
    action={`https://formsubmit.co/${CONTACT_EMAIL}`}
    method="POST"
    onSubmit={submit}
    aria-busy={status === 'sending'}
  >
    <input type="hidden" name="_subject" value="New portfolio enquiry — UsmanKhairDin.com" />
    <input type="hidden" name="_template" value="table" />
    <input type="hidden" name="_captcha" value="false" />
    <input type="hidden" name="source" value={source} />
    <input type="hidden" name="_url" value="" readOnly />
    <input type="text" name="_honey" tabIndex="-1" autoComplete="off" className="form-honey" aria-hidden="true" />

    <fieldset disabled={status === 'sending'} className="form-fields">
    <label><span>Full name</span><input name="name" type="text" required placeholder="Your name" autoComplete="name" /></label>
    <label><span>Work email</span><input name="email" type="email" required placeholder="you@company.com" autoComplete="email" /></label>
    <label><span>Agency / company</span><input name="company" type="text" placeholder="Company or project" autoComplete="organization" /></label>

    {immersive
      ? <label><span>What needs support</span>
          <select name="support" defaultValue="">
            <option value="" disabled>Select a service</option>
            {SUPPORT_OPTIONS.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
      : <div className="contact-form-field"><span>What needs support</span><input type="hidden" name="support" value={support} readOnly /><SupportDropdown value={support} onChange={setSupport} /></div>}

    <label><span>Approx. scope / brief link</span><input name="scope" type="text" placeholder={immersive ? 'Scope, screens or URL' : 'Pages, screens or a brief URL'} /></label>
    <label><span>Preferred delivery window</span><input name="delivery_window" type="text" placeholder="e.g. 2 weeks / this month" /></label>

    <label className={immersive ? 'contact-room-form__message' : 'contact-form__message'}>
      <span>Project brief</span>
      <textarea name="message" required rows={immersive ? 4 : 6} placeholder="What are you looking to design or build?" />
    </label>
    </fieldset>

    <button className="contact-submit" type="submit" disabled={status === 'sending'} aria-disabled={status === 'sending'}>
      {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Brief sent' : 'Send a brief'} <b aria-hidden="true">{status === 'sent' ? '✓' : '↗'}</b>
    </button>

    {message && <p className={`form-status form-status--${status}`} role="status" aria-live="polite">{message}</p>}
  </form>
}
