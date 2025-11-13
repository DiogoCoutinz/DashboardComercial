// Data processing utilities

export function aggregateByPeriod(data: any[], _period: 'day' | 'week' | 'month') {
  // Future: Add period aggregation logic
  return data
}

export function calculateMovingAverage(data: number[], window: number) {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1)
    const subset = data.slice(start, i + 1)
    const average = subset.reduce((sum, val) => sum + val, 0) / subset.length
    result.push(average)
  }
  return result
}

export function calculateGrowthRate(current: number, previous: number): number | null {
  if (previous === 0 || isNaN(previous) || isNaN(current)) return null
  return ((current - previous) / previous) * 100
}
