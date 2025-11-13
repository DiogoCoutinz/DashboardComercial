import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatNumber } from '@/lib/format'
import { COLORS } from '@/lib/constants'

type DataPoint = {
  name: string
  [key: string]: string | number
}

type Props = {
  data: DataPoint[]
  title?: string
  dataKeys: { key: string; label: string; color?: string }[]
}

export default function SimpleBarChart({ data, title, dataKeys }: Props) {
  if (data.length === 0) {
    return (
      <div className="card">
        {title && <h3 className="text-base font-semibold mb-4">{title}</h3>}
        <div className="h-[350px] flex items-center justify-center text-gray-400 text-sm">
          Sem dados disponíveis
        </div>
      </div>
    )
  }

  const chartData = data.map(d => {
    const fullName = String(d.name)
    return {
      ...d,
      shortName: fullName.length > 15 ? fullName.substring(0, 13) + '...' : fullName,
    }
  })

  return (
    <div className="card">
      {title && <h3 className="text-base font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="shortName"
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            stroke="#2a2a2a"
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            stroke="#2a2a2a"
            tickFormatter={(value) => formatNumber(value)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #3a3a3a',
              borderRadius: '8px',
              color: '#e5e5e5',
            }}
            formatter={(value: number) => formatNumber(value)}
            labelFormatter={(label) => {
              const item = chartData.find(d => d.shortName === label)
              return item?.name || label
            }}
            labelStyle={{ color: '#e5e5e5', fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Legend wrapperStyle={{ color: '#e5e5e5', fontSize: '13px' }} />
          {dataKeys.map((dk) => (
            <Bar 
              key={dk.key}
              dataKey={dk.key} 
              name={dk.label}
              fill={dk.color || COLORS.primary} 
              radius={[4, 4, 0, 0]} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

