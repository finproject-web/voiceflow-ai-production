import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | VoiceFlow AI',
  description: 'Terms of service for VoiceFlow AI platform',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Terms of Service
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Acceptance of Terms
                </h2>
                <p className="text-gray-600 mb-4">
                  By accessing and using VoiceFlow AI, you accept and agree to be bound by the terms 
                  and provision of this agreement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Use License
                </h2>
                <p className="text-gray-600 mb-4">
                  Permission is granted to temporarily download one copy of the materials on VoiceFlow AI 
                  for personal, non-commercial transitory viewing only.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Disclaimer
                </h2>
                <p className="text-gray-600 mb-4">
                  The materials on VoiceFlow AI are provided on an 'as is' basis. VoiceFlow AI makes no 
                  warranties, expressed or implied, and hereby disclaims and negates all other warranties.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Limitations
                </h2>
                <p className="text-gray-600 mb-4">
                  In no event shall VoiceFlow AI or its suppliers be liable for any damages (including, 
                  without limitation, damages for loss of data or profit, or due to business interruption) 
                  arising out of the use or inability to use the materials on VoiceFlow AI.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Privacy Policy
                </h2>
                <p className="text-gray-600 mb-4">
                  Your Privacy Policy will also govern your use of VoiceFlow AI and you can review our 
                  current Privacy Policy at <Link href="/privacy" className="text-blue-600 hover:text-blue-800">/privacy</Link>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Contact Information
                </h2>
                <p className="text-gray-600">
                  Questions about the Terms of Service should be sent to us at 
                  legal@voiceflow-ai.com
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
