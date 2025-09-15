'use client'

export function TopCards() {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-transparent to-deep-black/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-neon-pink to-electric-blue bg-clip-text text-transparent">
            Top Trading Cards
          </h2>
          <p className="text-gray-400 text-lg">
            Most valuable cards in the marketplace
          </p>
        </div>

        <div className="text-center py-12">
          <p className="text-gray-500">
            Top cards will be displayed here once the marketplace is active
          </p>
        </div>
      </div>
    </section>
  )
}