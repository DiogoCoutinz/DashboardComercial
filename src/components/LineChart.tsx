import { LineChart as RechartsLC, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type DataKey = {
  key: string
  label: string
  color: string
  yAxisId?: string
}

type Props = {
  data: any[]
  title: string
  dataKeys: DataKey[]
  xAxisKey?: string
  dualAxis?: boolean
}

export default function LineChart({ data, title, dataKeys, xAxisKey = 'name', dualAxis = false }: Props) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLC data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis 
            dataKey={xAxisKey} 
            stroke="#666"
            style={{ fontSize: '12px' }}
          />
          {dualAxis ? (
            <>
              <YAxis 
                yAxisId="left"
                stroke="#666"
                style={{ fontSize: '12px' }}
                label={{ value: 'Receita (€)', angle: -90, position: 'insideLeft', style: { fill: '#666', fontSize: '12px' } }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#666"
                style={{ fontSize: '12px' }}
                label={{ value: 'Projetos', angle: 90, position: 'insideRight', style: { fill: '#666', fontSize: '12px' } }}
              />
            </>
          ) : (
            <YAxis 
              stroke="#666"
              style={{ fontSize: '12px' }}
            />
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
          />
          {dataKeys.map((dk) => (
            <Line
              key={dk.key}
              type="monotone"
              dataKey={dk.key}
              name={dk.label}
              stroke={dk.color}
              strokeWidth={2}
              dot={{ fill: dk.color, r: 4 }}
              activeDot={{ r: 6 }}
              yAxisId={dualAxis ? (dk.yAxisId || 'left') : undefined}
            />
          ))}
        </RechartsLC>
      </ResponsiveContainer>
    </div>
  )
}

