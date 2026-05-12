import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

// Disable static generation
export const dynamic = 'force-dynamic'
import { 
  Upload, 
  Phone, 
  Mail, 
  Building, 
  Plus, 
  Trash2,
  Check,
  X
} from "lucide-react"

const mockSettings = {
  businessName: "Acme Financial Services",
  supportEmail: "support@acme.com",
  logoUrl: "https://via.placeholder.com/150x50/3B82F6/FFFFFF?text=Acme",
  phoneNumbers: [
    { id: "1", number: "+1 (555) 123-4567", status: "active", verified: true },
    { id: "2", number: "+1 (555) 234-5678", status: "pending", verified: false },
  ]
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your business settings and preferences.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input 
                  id="business-name" 
                  defaultValue={mockSettings.businessName}
                  placeholder="Enter your business name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input 
                  id="support-email" 
                  type="email"
                  defaultValue={mockSettings.supportEmail}
                  placeholder="Enter your support email"
                />
              </div>

              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-32 h-16 border rounded flex items-center justify-center bg-gray-50">
                    <img 
                      src={mockSettings.logoUrl} 
                      alt="Business Logo" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </Button>
                </div>
              </div>

              <Button className="w-full">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phone Numbers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {mockSettings.phoneNumbers.map((phone) => (
                  <div key={phone.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{phone.number}</p>
                        <div className="flex items-center space-x-2">
                          <Badge className={
                            phone.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }>
                            {phone.status}
                          </Badge>
                          {phone.verified ? (
                            <div className="flex items-center text-green-600">
                              <Check className="h-3 w-3 mr-1" />
                              <span className="text-xs">Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-yellow-600">
                              <X className="h-3 w-3 mr-1" />
                              <span className="text-xs">Not Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Phone Number
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>AI Voice Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voice-type">Voice Type</Label>
                <select 
                  id="voice-type"
                  className="w-full p-2 border rounded-md"
                  defaultValue="professional"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="energetic">Energetic</option>
                  <option value="calm">Calm</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="speaking-rate">Speaking Rate</Label>
                <select 
                  id="speaking-rate"
                  className="w-full p-2 border rounded-md"
                  defaultValue="normal"
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select 
                  id="language"
                  className="w-full p-2 border rounded-md"
                  defaultValue="en-US"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-US">Spanish (US)</option>
                  <option value="fr-FR">French</option>
                </select>
              </div>

              <Button className="w-full">
                Update Voice Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your calls
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Get SMS alerts for important events
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Reports</p>
                    <p className="text-sm text-muted-foreground">
                      Receive daily performance summaries
                    </p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Analytics</p>
                    <p className="text-sm text-muted-foreground">
                      Get weekly performance reports
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
              </div>

              <Button className="w-full">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input 
                  id="webhook-url" 
                  placeholder="https://your-domain.com/webhook"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input 
                  id="api-key" 
                  placeholder="sk_live_..."
                  type="password"
                  defaultValue="sk_live_1234567890abcdef"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Connected Services</Label>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">CRM</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Email</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">SMS</span>
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">Not Connected</Badge>
                </div>
              </div>
            </div>

            <Button className="w-full">
              Save API Configuration
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
