import { useState, useEffect } from 'react'
import { X, Filter } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function FilterModal({ isOpen, onClose, children }: Props) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen && !isAnimating) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        onTransitionEnd={() => {
          if (!isOpen) setIsAnimating(false)
        }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 pointer-events-none">
        <div
          className={`bg-dark-card border border-gray-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto pointer-events-auto transition-all duration-300 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          {/* Header */}
          <div className="sticky top-0 bg-dark-card border-b border-gray-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">Filtros Avançados</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {children}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-dark-card border-t border-gray-700 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="btn bg-dark-hover hover:bg-gray-700"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

