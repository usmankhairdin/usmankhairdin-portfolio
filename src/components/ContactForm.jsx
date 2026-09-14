import { useState } from 'react'

const ENDPOINT = 'https://formsubmit.co/ajax/usman.khairdin@gmail.com'

export default function ContactForm({ compact = false, source = 'Portfolio website' }) {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    if (status === 'sending') return

    const form = event.currentTarget
    const data = new FormData(form)
    data.append('_subject', `New portfolio enquiry — ${data.get('name') || 'Website visitor'}`)
    data.append('_template', 'table')
    data.append('_captcha', 'false')
    data.append('source', source)

    setStatus('sending')
    setMessage('')

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok || payload.success === false) throw new Error(payload.message || 'Unable to send')

      form.reset()
      setStatus('sent')
      setMessage('Thanks — your brief has been sent. I’ll reply by email.')
    } catch (error) {
      setStatus('error')
      setMessage('The form could not send right now. Please email usman.khairdin@gmail.com directly.')
    }
  }

  return <form
    className={compact ? 'contact-room-form' : 'contact-form'}
    action="https://formsubmit.co/usman.khairdin@gmail.com"
    method="POST"
    onSubmit={submit}
  >
    <input type="text" name="_honey" tabIndex="-1" autoComplete="off" className="form-honey" aria-hidden="true" />

    <label><span>Name</span><input name="name" type="text" required placeholder="Your name" autoComplete="name" /></label>
    <label><span>{compact ? 'Email' : 'Work email'}</span><input name="email" type="email" required placeholder="you@company.com" autoComplete="email" /></label>
    <label><span>Agency / company</span><input name="company" type="text" placeholder="Company or project" autoComplete="organization" /></label>

    {!compact && <>
      <label><span>What needs support</span>
        <select name="support" defaultValue="">
          <option value="" disabled>Select a service</option>
          <option>Website / landing page design</option>
          <option>SaaS / dashboard UI</option>
          <option>Website redesign</option>
          <option>Frontend development</option>
          <option>Design to React / Tailwind</option>
          <option>White-label agency support</option>
          <option>Other</option>
        </select>
      </label>
      <label><span>Approx. scope / brief link</span><input name="scope" type="text" placeholder="Pages, screens or a brief URL" /></label>
      <label><span>Preferred delivery window</span><input name="delivery_window" type="text" placeholder="e.g. 2 weeks / this month" /></label>
    </>}

    <label className={compact ? 'contact-room-form__message' : 'contact-form__message'}>
      <span>{compact ? 'Brief' : 'Project brief'}</span>
      <textarea name="message" required rows={compact ? 3 : 6} placeholder="What are you looking to design or build?" />
    </label>

    <button type="submit" disabled={status === 'sending'}>
      {status === 'sending' ? 'Sending…' : compact ? 'Send the brief' : 'Send project brief'} <b aria-hidden="true">↗</b>
    </button>

    {message && <p className={`form-status form-status--${status}`} role="status">{message}</p>}
  </form>
}
