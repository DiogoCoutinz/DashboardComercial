type Props = {
  value: number
  max: number
  label: string
  color: string
  size?: number
}

export default function CircularProgress({ value, max, label, color, size = 120 }: Props) {
  const percentage = max > 0 ? (value / max) * 100 : 0
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2a2a2a"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      {/* Label and values */}
      <div className="mt-3 text-center">
        <div className="text-sm text-gray-400 mb-1">{label}</div>
        <div className="text-xl font-bold">
          {value} <span className="text-gray-500 text-sm">/ {max}</span>
        </div>
      </div>
    </div>
  )
}

