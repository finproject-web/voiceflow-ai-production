"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, Plus, AlertCircle, CheckCircle, Loader } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface Lead {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  status: string
  organization_id: string
  created_at: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [userOrgId, setUserOrgId] = useState<string | null>(null)

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
  })

  const supabase = createClient()

  // Fetch user organization and leads
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          setMessage({ type: "error", text: "Please log in to view leads" })
          return
        }

        // Get user's organization
        const { data: userData } = await supabase
          .from("users")
          .select("organization_id")
          .eq("id", user.id)
          .single()

        if (!userData?.organization_id) {
          setMessage({ type: "error", text: "Organization not found" })
          return
        }

        setUserOrgId(userData.organization_id)

        // Fetch leads for this organization
        const { data: leadsData, error: leadsError } = await supabase
          .from("leads")
          .select("*")
          .eq("organization_id", userData.organization_id)
          .order("created_at", { ascending: false })

        if (leadsError) throw leadsError

        setLeads(leadsData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setMessage({ type: "error", text: "Failed to load leads" })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const addLead = async () => {
    if (!form.first_name.trim()) {
      alert('First name is required')
      return
    }

    if (!form.last_name.trim()) {
      alert('Last name is required')
      return
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(form.email)) {
      alert('Enter a valid email address')
      return
    }

    const cleanedPhone = form.phone_number.replace(/\D/g, '')

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

    if (!zipRegex.test(form.zip_code)) {
      alert('Enter a valid ZIP code')
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Inserting lead with data:", {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: cleanedPhone,
        address: form.address,
        city: form.city,
        state: form.state,
        zip_code: form.zip_code,
        status: 'new',
        organization_id: userOrgId,
      })

      const { error } = await supabase.from("leads").insert({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: cleanedPhone,
        address: form.address,
        city: form.city,
        state: form.state,
        zip_code: form.zip_code,
        status: 'new',
        organization_id: userOrgId,
      })

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      // Refresh leads
      const { data: leadsData } = await supabase
        .from("leads")
        .select("*")
        .eq("organization_id", userOrgId)
        .order("created_at", { ascending: false })

      setLeads(leadsData || [])

      setForm({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
      })

      setMessage({ type: "success", text: "Lead added successfully" })
    } catch (error) {
      console.error("Error adding lead:", error)
      setMessage({ type: "error", text: "Failed to add lead" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle CSV/Excel upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    const fileName = file.name.toLowerCase()
    const isCSV = fileName.endsWith(".csv")
    const isXLSX = fileName.endsWith(".xlsx") || fileName.endsWith(".xls")

    if (!isCSV && !isXLSX) {
      setMessage({ type: "error", text: "Please upload a CSV or Excel file" })
      return
    }

    if (!userOrgId) {
      setMessage({ type: "error", text: "Organization not found" })
      return
    }

    try {
      setIsUploading(true)
      let rows: string[] = []

      if (isCSV) {
        // Handle CSV
        const text = await file.text()
        rows = text
          .split(/\r?\n/)
          .filter((row) => row.trim() !== "")
          .map((row) => row.trim())
      } else if (isXLSX) {
        // Handle Excel - basic parsing
        // Note: For production, consider using a library like 'xlsx'
        setMessage({ type: "error", text: "Excel support coming soon. Please use CSV format." })
        return
      }

      if (rows.length <= 1) {
        setMessage({ type: "error", text: "No data found in file. Make sure you have headers and data rows." })
        return
      }

      const headers = rows[0]
        .split(",")
        .map((h) => h.trim().toLowerCase())

      // Find column indices
      const firstNameIdx = headers.findIndex((h) => h === "first_name" || h === "firstname" || h === "first name")
      const lastNameIdx = headers.findIndex((h) => h === "last_name" || h === "lastname" || h === "last name")
      const emailIdx = headers.findIndex((h) => h === "email")
      const phoneIdx = headers.findIndex((h) => h === "phone" || h === "phone_number" || h === "phone number")
      const addressIdx = headers.findIndex((h) => h === "address")
      const cityIdx = headers.findIndex((h) => h === "city")
      const stateIdx = headers.findIndex((h) => h === "state")
      const zipIdx = headers.findIndex((h) => h === "zip" || h === "zip_code" || h === "zip code")

      if (firstNameIdx === -1 || lastNameIdx === -1 || emailIdx === -1 || phoneIdx === -1) {
        setMessage({
          type: "error",
          text: "CSV must have columns: first_name, last_name, email, phone_number",
        })
        return
      }

      const importedLeads: any[] = []

      for (let i = 1; i < rows.length; i++) {
        const columns = rows[i]
          .split(",")
          .map((col) => col.trim())

        if (columns.length < 4) continue

        const firstName = columns[firstNameIdx]?.trim()
        const lastName = columns[lastNameIdx]?.trim()
        const email = columns[emailIdx]?.trim()
        const phone = columns[phoneIdx]?.trim()

        if (!firstName || !lastName || !email || !phone) continue

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) continue

        // Validate phone
        const cleanedPhone = phone.replace(/\D/g, "")
        if (cleanedPhone.length < 10) continue

        importedLeads.push({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: cleanedPhone,
          address: addressIdx !== -1 ? columns[addressIdx]?.trim() || null : null,
          city: cityIdx !== -1 ? columns[cityIdx]?.trim() || null : null,
          state: stateIdx !== -1 ? columns[stateIdx]?.trim() || null : null,
          zip_code: zipIdx !== -1 ? columns[zipIdx]?.trim() || null : null,
          status: "new",
          organization_id: userOrgId,
        })
      }

      if (importedLeads.length === 0) {
        setMessage({ type: "error", text: "No valid leads found in file" })
        return
      }

      // Insert all leads
      const { error } = await supabase.from("leads").insert(importedLeads)

      if (error) throw error

      // Refresh leads
      const { data: leadsData } = await supabase
        .from("leads")
        .select("*")
        .eq("organization_id", userOrgId)
        .order("created_at", { ascending: false })

      setLeads(leadsData || [])
      setMessage({ type: "success", text: `${importedLeads.length} leads imported successfully` })

      // Reset file input
      e.target.value = ""
    } catch (error) {
      console.error("Error uploading file:", error)
      setMessage({ type: "error", text: "Failed to import leads" })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Leads</h1>
            <p className="text-gray-600">Manage your leads and import new ones</p>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isUploading}
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Import CSV'}
            </Button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Add New Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  placeholder="1234567890"
                />
              </div>
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="New York"
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="NY"
                />
              </div>
              <div>
                <Label htmlFor="zip_code">ZIP Code *</Label>
                <Input
                  id="zip_code"
                  name="zip_code"
                  value={form.zip_code}
                  onChange={handleChange}
                  placeholder="10001"
                />
              </div>
            </div>
            <Button 
              onClick={addLead} 
              disabled={isSubmitting}
              className="mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lead
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-8 w-8 animate-spin" />
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No leads found. Add your first lead above.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        {lead.first_name} {lead.last_name}
                      </TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone_number || lead.phone}</TableCell>
                      <TableCell>{lead.city || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}