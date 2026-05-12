"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  X, 
  Download,
  Calendar,
  DollarSign
} from "lucide-react"

interface SearchFiltersProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: any) => void
  onExport: () => void
  totalCount: number
  filteredCount: number
}

export function SearchFilters({ 
  onSearch, 
  onFilterChange, 
  onExport, 
  totalCount, 
  filteredCount 
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    loanAmountMin: '',
    loanAmountMax: '',
    assignedAgent: ''
  })

  const leadStatuses = [
    { value: 'new_lead', label: 'New Lead', color: 'bg-blue-100 text-blue-800' },
    { value: 'called', label: 'Called', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'interested', label: 'Interested', color: 'bg-purple-100 text-purple-800' },
    { value: 'application_sent', label: 'Application Sent', color: 'bg-orange-100 text-orange-800' },
    { value: 'application_completed', label: 'Application Completed', color: 'bg-green-100 text-green-800' },
    { value: 'transferred', label: 'Transferred', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'approved', label: 'Approved', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' }
  ]

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      status: '',
      dateFrom: '',
      dateTo: '',
      loanAmountMin: '',
      loanAmountMax: '',
      assignedAgent: ''
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <Card>
      <CardContent className="p-6">
        {/* Search Bar */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or notes..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? 'border-blue-500 text-blue-600' : ''}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-2 bg-blue-500 text-white">Active</Badge>
            )}
          </Button>

          <Button onClick={onExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filter Summary */}
        {filteredCount !== totalCount && (
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredCount} of {totalCount} leads
          </div>
        )}

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Advanced Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  {leadStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date Range
                </label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    placeholder="From"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder="To"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>
              </div>

              {/* Loan Amount Range */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Loan Amount Range
                </label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Min Amount"
                    value={filters.loanAmountMin}
                    onChange={(e) => handleFilterChange('loanAmountMin', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max Amount"
                    value={filters.loanAmountMax}
                    onChange={(e) => handleFilterChange('loanAmountMax', e.target.value)}
                  />
                </div>
              </div>

              {/* Assigned Agent */}
              <div>
                <label className="block text-sm font-medium mb-2">Assigned Agent</label>
                <Input
                  placeholder="Agent name..."
                  value={filters.assignedAgent}
                  onChange={(e) => handleFilterChange('assignedAgent', e.target.value)}
                />
              </div>
            </div>

            {/* Active Filter Tags */}
            {hasActiveFilters && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Active Filters:</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.status && (
                    <Badge variant="secondary" className="flex items-center">
                      Status: {leadStatuses.find(s => s.value === filters.status)?.label}
                      <button
                        onClick={() => handleFilterChange('status', '')}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.dateFrom && (
                    <Badge variant="secondary" className="flex items-center">
                      From: {new Date(filters.dateFrom).toLocaleDateString()}
                      <button
                        onClick={() => handleFilterChange('dateFrom', '')}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.dateTo && (
                    <Badge variant="secondary" className="flex items-center">
                      To: {new Date(filters.dateTo).toLocaleDateString()}
                      <button
                        onClick={() => handleFilterChange('dateTo', '')}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.loanAmountMin && (
                    <Badge variant="secondary" className="flex items-center">
                      Min: ${filters.loanAmountMin}
                      <button
                        onClick={() => handleFilterChange('loanAmountMin', '')}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.loanAmountMax && (
                    <Badge variant="secondary" className="flex items-center">
                      Max: ${filters.loanAmountMax}
                      <button
                        onClick={() => handleFilterChange('loanAmountMax', '')}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.assignedAgent && (
                    <Badge variant="secondary" className="flex items-center">
                      Agent: {filters.assignedAgent}
                      <button
                        onClick={() => handleFilterChange('assignedAgent', '')}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
