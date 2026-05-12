import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Disable static generation
export const dynamic = 'force-dynamic'
import { 
  Check, 
  X, 
  CreditCard, 
  Zap, 
  Building, 
  Crown,
  ArrowRight
} from "lucide-react"

const currentPlan = {
  name: "Pro",
  status: "active",
  amount: 299,
  currentPeriodStart: "2024-01-01",
  currentPeriodEnd: "2024-02-01",
  features: [
    "5,000 minutes per month",
    "Unlimited leads",
    "Basic analytics",
    "Email support",
    "API access"
  ]
}

const plans = [
  {
    name: "Starter",
    price: 99,
    description: "Perfect for small businesses getting started",
    features: [
      "1,000 minutes per month",
      "Up to 500 leads",
      "Basic analytics",
      "Email support"
    ],
    notIncluded: [
      "API access",
      "Advanced analytics",
      "Priority support"
    ],
    popular: false
  },
  {
    name: "Pro",
    price: 299,
    description: "Ideal for growing businesses",
    features: [
      "5,000 minutes per month",
      "Unlimited leads",
      "Advanced analytics",
      "Email support",
      "API access"
    ],
    notIncluded: [
      "Priority support",
      "Custom integrations"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: 899,
    description: "For large-scale operations",
    features: [
      "Unlimited minutes",
      "Unlimited leads",
      "Advanced analytics",
      "Priority support",
      "API access",
      "Custom integrations",
      "Dedicated account manager"
    ],
    notIncluded: [],
    popular: false
  }
]

export default function BillingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Current Plan
                <Badge className="bg-green-100 text-green-800">
                  {currentPlan.status.charAt(0).toUpperCase() + currentPlan.status.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                  <p className="text-muted-foreground">${currentPlan.amount}/month</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Next billing date</p>
                  <p className="font-medium">{currentPlan.currentPeriodEnd}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Features</h4>
                <ul className="space-y-1">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Update Payment
                </Button>
                <Button variant="outline" className="flex-1">
                  Cancel Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Minutes Used</span>
                    <span>3,247 / 5,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Leads Created</span>
                    <span>1,847 / Unlimited</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>API Calls</span>
                    <span>8,234 / 10,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Days remaining in billing cycle</span>
                  <span className="font-medium">16 days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan, index) => (
                <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                      {plan.name === 'Starter' && <Zap className="h-8 w-8 text-blue-500" />}
                      {plan.name === 'Pro' && <Crown className="h-8 w-8 text-purple-500" />}
                      {plan.name === 'Enterprise' && <Building className="h-8 w-8 text-green-500" />}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">${plan.price}</div>
                    <p className="text-muted-foreground">per month</p>
                    <p className="text-sm">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                      {plan.notIncluded.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                          <X className="mr-2 h-4 w-4 text-gray-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''} ${
                        currentPlan.name === plan.name ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={currentPlan.name === plan.name}
                    >
                      {currentPlan.name === plan.name ? 'Current Plan' : (
                        <>
                          {plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
