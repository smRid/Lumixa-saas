import { PricingTable } from "@clerk/clerk-react"

const Plan = () => {
  return (
    <div className='py-24 bg-[#0D0B1E]'>
      <div className='max-w-4xl mx-auto px-4 sm:px-8'>
        {/* Section Header */}
        <div className='text-center mb-12'>
          <span className='inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium mb-4'>
            Pricing
          </span>
          <h2 className='text-4xl md:text-5xl font-bold text-white mb-4'>
            Choose Your Plan
          </h2>
          <p className='text-gray-400 max-w-lg mx-auto text-lg'>
            Start for free and scale up as you grow. Find the perfect plan for your photo workflow.
          </p>
        </div>

        {/* Pricing Table */}
        <div className="mt-8">
          <PricingTable />
        </div>
      </div>
    </div>
  )
}

export default Plan
