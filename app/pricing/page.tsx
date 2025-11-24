import Navigation from '@/components/Navigation'
import PricingSection from '@/components/PricingSection'
import Footer from '@/components/Footer'
import Image from 'next/image'

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-nuvix-dark relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/Abstract Background 2.png" 
          alt="Abstract Background" 
          fill
          className="object-cover opacity-40 mix-blend-soft-light"
          priority
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Navigation />
        <PricingSection />
        <Footer />
      </div>
    </main>
  )
}

