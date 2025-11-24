import React from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-[#0a0b0f] text-gray-300">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        
        <div className="space-y-6 leading-relaxed">
          <p>Last updated: May 24, 2025</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Spark website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p>
              Spark provides an AI-powered design tool that allows users to generate user interface designs and code snippets ("Services"). The generated content is based on user prompts and inputs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
            <p>
              To access certain features of the Service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Intellectual Property</h2>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Your Content:</strong> You retain ownership of any intellectual property rights that you hold in the content you upload or generate using our Services. By using the Services, you grant Spark a worldwide, non-exclusive license to use, store, and copy your content solely for the purpose of providing and improving the Service.
              </li>
              <li>
                <strong>Our Content:</strong> The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Spark and its licensors.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Prohibited Uses</h2>
            <p>
              You agree not to use the Service:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>In any way that violates any applicable national or international law or regulation.</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
              <li>To impersonate or attempt to impersonate Spark, a Spark employee, another user, or any other person or entity.</li>
              <li>To generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, libelous, or invasive of another's privacy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
            <p>
              In no event shall Spark, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Changes</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at contact@spark.com.
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}

