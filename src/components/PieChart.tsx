import { PieChart as RechartsPC, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

type Props = {
  data: Array<{ name: string; value: number; color: string }>
  title: string
  innerRadius?: number
}

export default function PieChart({ data, title, innerRadius = 60 }: Props) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPC>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine={{ stroke: '#666', strokeWidth: 1 }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              color: '#ffffff',
            }}
            itemStyle={{
              color: '#ffffff',
            }}
            labelStyle={{
              color: '#ffffff',
            }}
            formatter={(value: number) => [
              `${value} (${((value / total) * 100).toFixed(1)}%)`,
              '',
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </RechartsPC>
      </ResponsiveContainer>
      <div className="text-center mt-2 text-sm text-gray-400">
        Total: <span className="font-bold text-white">{total}</span> agendamentos
      </div>
    </div>
  )
}

