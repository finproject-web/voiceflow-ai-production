'use client'

import { useEffect, useState } from 'react'

interface Lead {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })

  useEffect(() => {
    const savedLeads = localStorage.getItem('nexentra-leads')

    if (savedLeads) {
      setLeads(JSON.parse(savedLeads))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      'nexentra-leads',
      JSON.stringify(leads)
    )
  }, [leads])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const addLead = () => {
    if (!form.firstName.trim()) {
      alert('First name is required')
      return
    }

    if (!form.lastName.trim()) {
      alert('Last name is required')
      return
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(form.email)) {
      alert('Enter a valid email address')
      return
    }

    const cleanedPhone = form.phone.replace(/\D/g, '')

    if (cleanedPhone.length !== 10) {
      alert('Phone number must be exactly 10 digits')
      return
    }

    if (!form.address.trim()) {
      alert('Address is required')
      return
    }

    if (!form.city.trim()) {
      alert('City is required')
      return
    }

    if (!form.state.trim()) {
      alert('State is required')
      return
    }

    const zipRegex = /^[0-9]{4,10}$/

    if (!zipRegex.test(form.zip)) {
      alert('Enter a valid ZIP code')
      return
    }

    const newLead: Lead = {
      id: Date.now(),
      ...form,
      phone: cleanedPhone,
    }

    setLeads([newLead, ...leads])

    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
    })

    alert('Lead added successfully')
  }

  const handleCSVUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file')
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      const text = event.target?.result as string

      if (!text) return

      const rows = text.split('\\n').slice(1)

      const importedLeads: Lead[] = rows
        .map((row, index) => {
          const columns = row.split(',')

          if (columns.length < 8) return null

          return {
            id: Date.now() + index,
            firstName: columns[0]?.trim() || '',
            lastName: columns[1]?.trim() || '',
            email: columns[2]?.trim() || '',
            phone: columns[3]?.trim() || '',
            address: columns[4]?.trim() || '',
            city: columns[5]?.trim() || '',
            state: columns[6]?.trim() || '',
            zip: columns[7]?.trim() || '',
          }
        })
        .filter(Boolean) as Lead[]

      setLeads([...importedLeads, ...leads])

      alert(
        `${importedLeads.length} leads imported successfully`
      )
    }

    reader.readAsText(file)
  }

  return (
    <div className="p-6 text-white min-h-screen bg-black">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Leads Management
        </h1>

        <p className="text-zinc-400 mt-2">
          Add leads manually or upload CSV files.
        </p>
      </div>

      {/* Manual Lead Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6">
          Add New Lead
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3"
          />

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => {
              const numbersOnly =
                e.target.value.replace(/\\D/g, '')

              if (numbersOnly.length <= 10) {
                setForm({
                  ...form,
                  phone: numbersOnly,
                })
              }
            }}
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3"
          />

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3"
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3"
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3"
          />

          <input
            type="text"
            name="zip"
            placeholder="ZIP Code"
            value={form.zip}
            onChange={(e) => {
              const numbersOnly =
                e.target.value.replace(/\\D/g, '')

              setForm({
                ...form,
                zip: numbersOnly,
              })
            }}
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3"
          />
        </div>

        <button
          onClick={addLead}
          className="mt-6 bg-white text-black px-6 py-3 rounded-lg font-semibold"
        >
          Add Lead
        </button>
      </div>

      {/* CSV Upload */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Upload CSV File
        </h2>

        <p className="text-zinc-400 mb-4">
          CSV format:
          firstName,lastName,email,phone,address,city,state,zip
        </p>

        <input
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          className="block w-full text-sm text-zinc-400"
        />
      </div>

      {/* Leads Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-zinc-800">
            <tr>
              <th className="text-left p-4">First Name</th>
              <th className="text-left p-4">Last Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Phone</th>
              <th className="text-left p-4">City</th>
              <th className="text-left p-4">State</th>
            </tr>
          </thead>

          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-zinc-400"
                >
                  No leads added yet.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-zinc-800"
                >
                  <td className="p-4">
                    {lead.firstName}
                  </td>

                  <td className="p-4">
                    {lead.lastName}
                  </td>

                  <td className="p-4">
                    {lead.email}
                  </td>

                  <td className="p-4">
                    {lead.phone}
                  </td>

                  <td className="p-4">
                    {lead.city}
                  </td>

                  <td className="p-4">
                    {lead.state}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}