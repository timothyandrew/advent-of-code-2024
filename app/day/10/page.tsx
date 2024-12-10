import { readFile } from '@/app/util/io';
import * as _ from 'lodash';

interface Position {
  x: number
  y: number
}

interface Input {
  map: number[][]
  trailheads: Position[]
}


export default async function Home() {
  const sample = await readFile(10, 'sample.txt')
  const input = await readFile(10, 'puzzle.txt')

  function parseInput(input: string): Input {
    let result = { map: [] as number[][], trailheads: [] as Position[] }
    let rows = input.split("\n")

    for (let i = 0; i < rows.length; i++) {
      result.map[i] = []

      for (let j = 0; j < rows.length; j++) {
        let n = parseInt(rows[i][j])
        result.map[i][j] = n

        if (n === 0) {
          result.trailheads.push({ x: i, y: j })
        }
      }
    }

    return result
  }

  function isValidPosition({ x, y }: Position, input: Input) {
    return x >= 0 && y >= 0 && x < input.map.length && y < input.map[x].length
  }

  function neighbors({ x, y }: Position, input: Input) {
    let candidates = [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
    ]

    return candidates.filter(c => isValidPosition(c, input))
  }

  function traverse(head: Position, input: Input, path: Position[]): Position[] {
    let current = input.map[head.x][head.y]

    if (current === 9) {
      return [head]
    }

    let candidates = neighbors(head, input).filter(p => input.map[p.x][p.y] === current + 1)

    return candidates.flatMap(c => traverse(c, input, [...path, head]))
  }

  function solvePart1(input: Input) {
    return input.trailheads.reduce((sum, head) => {
      let finals = traverse(head, input, [])
      return sum + _.uniqBy(finals, p => `${p.x},${p.y}`).length
    }, 0)
  }

  function solvePart2(input: Input) {
    return input.trailheads.reduce((sum, head) => {
      let finals = traverse(head, input, [])
      return sum + finals.length
    }, 0)
  }

  return (
    <ul>
      <h1>Part 1</h1>
      <li>
        Sample: {solvePart1(parseInput(sample))}
      </li>
      <li>
        Puzzle: {solvePart1(parseInput(input))}
      </li>
      <h1>Part 2</h1>
      <li>
        Sample: {solvePart2(parseInput(sample))}
      </li>
      <li>
        Puzzle: {solvePart2(parseInput(input))}
      </li>
    </ul>
  )
}