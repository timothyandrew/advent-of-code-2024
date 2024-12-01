import { readFile } from '@/app/util/io';

export default async function Home() {
  const sample = await readFile(1, 'sample.txt')
  const input = await readFile(1, 'part1.txt')

  interface Input {
    left: number[]
    right: number[]
  }

  function parseInput(input: string): Input {
    const rows = input.split("\n")

    return rows.reduce(({ left, right }, row) => {
      const ids = row.split('   ').map(s => s.trim())

      return {
        left: [...left, parseInt(ids[0])],
        right: [...right, parseInt(ids[1])],
      }
    }, { left: [], right: [] } as Input)
  }

  function solvePart1(input: Input) {
    input.left.sort()
    input.right.sort()

    let sum = 0

    for (let i = 0; i < input.left.length; i++) {
      const diff = Math.abs(input.left[i] - input.right[i])
      sum += diff
    }

    return sum
  }

  function solvePart2(input: Input) {
    const rightFreq = input.right.reduce((memo, item) => {
      memo[item] ||= 0
      memo[item]++
      return memo
    }, {} as { [key: number]: number })

    let result = 0

    for (const left of input.left) {
      const rightCount = rightFreq[left] || 0
      result += (left * rightCount)
    }

    return result
  }


  return (
    <ul>
      <li>
        Sample: {solvePart1(parseInput(sample))}
      </li>
      <li>
        Part 1: {solvePart1(parseInput(input))}
      </li>
      <li>
        Part 2: {solvePart2(parseInput(input))}
      </li>
    </ul>
  )
}