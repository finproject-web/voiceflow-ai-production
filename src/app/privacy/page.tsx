import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | VoiceFlow AI',
  description: 'Privacy policy for VoiceFlow AI platform',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Privacy Policy
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Information We Collect
                </h2>
                <p className="text-gray-600 mb-4">
                  VoiceFlow AI collects information you provide directly to us, such as when you create an account, 
                  use our services, or contact us for support.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  How We Use Your Information
                </h2>
                <p className="text-gray-600 mb-4">
                  We use the information we collect to provide, maintain, and improve our services, 
                  process transactions, and communicate with you.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Data Security
                </h2>
                <p className="text-gray-600 mb-4">
                  We implement appropriate technical and organizational measures to protect your data 
                  against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Contact Us
                </h2>
                <p className="text-gray-600">
                  If you have any questions about this Privacy Policy, please contact us at 
                  privacy@voiceflow-ai.com
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
