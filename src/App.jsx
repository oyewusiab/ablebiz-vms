import { useMemo, useState } from 'react'
import './App.css'

const bossName = 'Mr. Adeyemi'

const buildNotificationMessage = (visitor) => {
  const identity = visitor.staff ? 'staff member' : 'visitor'
  const company = visitor.company ? ` from ${visitor.company}` : ''
  const purpose = visitor.purpose ? ` to ${visitor.purpose}` : ''
  return `Sir, ${visitor.fullName}, a ${identity}${company}, wishes${purpose}.`
}

const formatDateTime = (value) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

const initialVisitors = () => {
  const now = new Date()
  return [
    {
      id: 'VMS-1001',
      fullName: 'John Doe',
      staff: false,
      company: 'XYZ Ltd',
      phone: '555-0182',
      timeIn: now.toISOString(),
      purpose: 'discuss project timeline',
      status: 'Pending',
      notified: true,
      timeApproved: null,
      approvedBy: '',
    },
    {
      id: 'VMS-1002',
      fullName: 'Mary Johnson',
      staff: true,
      company: 'Able Health Clinic',
      phone: '555-0144',
      timeIn: new Date(now.getTime() - 1000 * 60 * 24).toISOString(),
      purpose: 'meet HR about onboarding',
      status: 'Approved',
      notified: true,
      timeApproved: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
      approvedBy: bossName,
    },
  ]
}

function App() {
  const [visitors, setVisitors] = useState(initialVisitors)
  const [notification, setNotification] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    staff: 'No',
    company: '',
    phone: '',
    purpose: '',
  })
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    date: '',
  })

  const stats = useMemo(() => {
    const pending = visitors.filter((visitor) => visitor.status === 'Pending').length
    const approved = visitors.filter((visitor) => visitor.status === 'Approved').length
    const rejected = visitors.filter((visitor) => visitor.status === 'Rejected').length
    return { pending, approved, rejected }
  }, [visitors])

  const pendingVisitors = useMemo(
    () => visitors.filter((visitor) => visitor.status === 'Pending'),
    [visitors]
  )

  const filteredVisitors = useMemo(() => {
    return visitors.filter((visitor) => {
      const matchesSearch =
        visitor.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
        visitor.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        visitor.phone.toLowerCase().includes(filters.search.toLowerCase())

      const matchesStatus = filters.status === 'All' || visitor.status === filters.status

      const matchesDate =
        !filters.date ||
        new Date(visitor.timeIn).toISOString().slice(0, 10) === filters.date

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [visitors, filters])

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = (event) => {
    event.preventDefault()
    const timeIn = new Date().toISOString()
    const newVisitor = {
      id: `VMS-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: formData.fullName.trim(),
      staff: formData.staff === 'Yes',
      company: formData.company.trim(),
      phone: formData.phone.trim(),
      timeIn,
      purpose: formData.purpose.trim(),
      status: 'Pending',
      notified: true,
      timeApproved: null,
      approvedBy: '',
    }

    setVisitors((prev) => [newVisitor, ...prev])
    setNotification({
      message: buildNotificationMessage(newVisitor),
      time: timeIn,
    })
    setFormData({
      fullName: '',
      staff: 'No',
      company: '',
      phone: '',
      purpose: '',
    })
  }

  const handleDecision = (visitorId, status) => {
    setVisitors((prev) =>
      prev.map((visitor) => {
        if (visitor.id !== visitorId) {
          return visitor
        }
        return {
          ...visitor,
          status,
          timeApproved: new Date().toISOString(),
          approvedBy: bossName,
        }
      })
    )
  }

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">ABLE-VMS</p>
          <h1>Visitor Management System</h1>
          <p className="subtitle">
            Reception-driven registration, real-time approvals, and compliance-ready
            logs.
          </p>
        </div>
        <div className="user-pill">
          <span>Receptionist View</span>
          <span className="user-pill__meta">Logged in</span>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <p>Pending approvals</p>
          <h3>{stats.pending}</h3>
        </div>
        <div className="stat-card approved">
          <p>Approved today</p>
          <h3>{stats.approved}</h3>
        </div>
        <div className="stat-card rejected">
          <p>Rejected visits</p>
          <h3>{stats.rejected}</h3>
        </div>
        <div className="stat-card">
          <p>Decision maker</p>
          <h3>{bossName}</h3>
        </div>
      </section>

      <main className="content-grid">
        <section className="card">
          <div className="card__header">
            <h2>Visitor registration</h2>
            <p>Capture visitor details and trigger notifications instantly.</p>
          </div>
          <form className="form-grid" onSubmit={handleFormSubmit}>
            <label>
              Full name
              <input
                type="text"
                name="fullName"
                placeholder="Enter visitor name"
                value={formData.fullName}
                onChange={handleFormChange}
                required
              />
            </label>
            <label>
              Staff?
              <select name="staff" value={formData.staff} onChange={handleFormChange}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </label>
            <label>
              Company / Organization
              <input
                type="text"
                name="company"
                placeholder="Company name"
                value={formData.company}
                onChange={handleFormChange}
              />
            </label>
            <label>
              Phone number
              <input
                type="tel"
                name="phone"
                placeholder="e.g. 0800 123 456"
                value={formData.phone}
                onChange={handleFormChange}
              />
            </label>
            <label className="span-2">
              Purpose of visit
              <input
                type="text"
                name="purpose"
                placeholder="What do they want to do?"
                value={formData.purpose}
                onChange={handleFormChange}
              />
            </label>
            <div className="form-actions span-2">
              <button type="submit">Submit visitor</button>
              <div className="form-meta">
                <p>Time in is captured automatically.</p>
                <p className="muted">Notifications: email + browser popup.</p>
              </div>
            </div>
          </form>
        </section>

        <section className="card">
          <div className="card__header">
            <h2>Latest notification</h2>
            <p>Preview the message sent to the decision maker.</p>
          </div>
          <div className="notification">
            <p className="notification__title">Outgoing alert</p>
            <p className="notification__message">
              {notification?.message ||
                'No new visitor requests yet. Notifications will appear here.'}
            </p>
            {notification?.time && (
              <p className="notification__time">
                Sent at {formatDateTime(notification.time)}
              </p>
            )}
            <div className="notification__meta">
              <span>Channel: EmailJS + Browser</span>
              <span>Status: Delivered</span>
              <span>Next: WhatsApp/SMS integration</span>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card__header">
            <h2>Receptionist dashboard</h2>
            <p>Track approval status in real-time (polls every 10 seconds).</p>
          </div>
          <div className="list">
            {visitors.map((visitor) => (
              <div key={visitor.id} className="list-item">
                <div>
                  <h3>{visitor.fullName}</h3>
                  <p className="muted">
                    {visitor.staff ? 'Staff' : 'Visitor'} · {visitor.company || 'N/A'} ·{' '}
                    {visitor.phone || 'N/A'}
                  </p>
                  <p className="muted">Time in: {formatDateTime(visitor.timeIn)}</p>
                </div>
                <div className={`status status--${visitor.status.toLowerCase()}`}>
                  {visitor.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card__header">
            <h2>Boss approval console</h2>
            <p>Decision makers can approve or reject with one click.</p>
          </div>
          {pendingVisitors.length === 0 ? (
            <p className="empty-state">No pending visitor requests.</p>
          ) : (
            <div className="list">
              {pendingVisitors.map((visitor) => (
                <div key={visitor.id} className="list-item list-item--stack">
                  <div>
                    <h3>{visitor.fullName}</h3>
                    <p className="muted">
                      {visitor.company || 'N/A'} · {visitor.phone || 'N/A'}
                    </p>
                    <p className="muted">Purpose: {visitor.purpose || 'Not provided'}</p>
                  </div>
                  <div className="actions">
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => handleDecision(visitor.id, 'Rejected')}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="primary"
                      onClick={() => handleDecision(visitor.id, 'Approved')}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card span-2">
          <div className="card__header">
            <h2>Visitor logs</h2>
            <p>Search and filter by date, status, or visitor details.</p>
          </div>
          <div className="filters">
            <input
              type="text"
              name="search"
              placeholder="Search name, company, phone"
              value={filters.search}
              onChange={handleFilterChange}
            />
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option>All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
            />
          </div>
          <div className="table">
            <div className="table__head">
              <span>Visitor</span>
              <span>Company</span>
              <span>Status</span>
              <span>Time in</span>
              <span>Decision</span>
            </div>
            {filteredVisitors.map((visitor) => (
              <div key={visitor.id} className="table__row">
                <span>
                  {visitor.fullName}
                  <span className="muted block">{visitor.staff ? 'Staff' : 'Visitor'}</span>
                </span>
                <span>{visitor.company || 'N/A'}</span>
                <span className={`status status--${visitor.status.toLowerCase()}`}>
                  {visitor.status}
                </span>
                <span>{formatDateTime(visitor.timeIn)}</span>
                <span className="muted">
                  {visitor.timeApproved
                    ? `${visitor.approvedBy} · ${formatDateTime(visitor.timeApproved)}`
                    : 'Awaiting decision'}
                </span>
              </div>
            ))}
            {filteredVisitors.length === 0 && (
              <p className="empty-state">No visitors match these filters.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
