import { useEffect, useState } from 'react'
import { PerfumeCard } from './PerfumeCard'
import { perfumes } from '@/data/perfumes'
import { Perfume } from '@/types/perfume'
import { Clock } from 'lucide-react'

const STORAGE_KEY = 'recently-viewed-perfumes'
const MAX_RECENT_ITEMS = 6

export function RecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<Perfume[]>([])

  useEffect(() => {
    // Load recently viewed from localStorage
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const perfumeIds = JSON.parse(stored)
        const viewedPerfumes = perfumeIds
          .map((id: string) => perfumes.find(p => p.id === id))
          .filter(Boolean)
          .slice(0, MAX_RECENT_ITEMS)
        setRecentlyViewed(viewedPerfumes)
      } catch (error) {
        console.error('Error loading recently viewed perfumes:', error)
      }
    }
  }, [])

  // Function to add a perfume to recently viewed
  const addToRecentlyViewed = (perfume: Perfume) => {
    const stored = localStorage.getItem(STORAGE_KEY)
    let recentIds: string[] = []
    
    if (stored) {
      try {
        recentIds = JSON.parse(stored)
      } catch (error) {
        console.error('Error parsing recently viewed:', error)
      }
    }

    // Remove if already exists and add to beginning
    recentIds = recentIds.filter(id => id !== perfume.id)
    recentIds.unshift(perfume.id)
    
    // Keep only the most recent items
    recentIds = recentIds.slice(0, MAX_RECENT_ITEMS)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentIds))
    
    // Update state
    const viewedPerfumes = recentIds
      .map(id => perfumes.find(p => p.id === id))
      .filter(Boolean) as Perfume[]
    setRecentlyViewed(viewedPerfumes)
  }

  // Export function for use in other components
  ;(window as any).addToRecentlyViewed = addToRecentlyViewed

  if (recentlyViewed.length === 0) {
    return null
  }

  return (
    <section className="py-12 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold glass-text-dark">Kürzlich angesehen</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {recentlyViewed.map((perfume, index) => (
            <div 
              key={perfume.id} 
              className="opacity-0 animate-fade-in"
              style={{ 
                animationDelay: `${index * 0.1}s`, 
                animationFillMode: 'forwards' 
              }}
            >
              <PerfumeCard perfume={perfume} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Helper function to add perfume to recently viewed (can be imported in other components)
export const addPerfumeToRecentlyViewed = (perfume: Perfume) => {
  if (typeof window !== 'undefined' && (window as any).addToRecentlyViewed) {
    ;(window as any).addToRecentlyViewed(perfume)
  }
}
