import { AlertCircle } from 'lucide-react'

type Props = {
  title?: string
  description?: string
  message?: string
}

export default function EmptyState({ title, description, message = 'Sem dados disponíveis' }: Props) {
  return (
    <div className="card flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="w-12 h-12 text-gray-600 mb-3" />
      {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
      {description && <p className="text-gray-400 mb-1">{description}</p>}
      {!title && !description && <p className="text-gray-400">{message}</p>}
    </div>
  )
}

