import { readFile } from '@/app/util/io';
import { Combination, combination } from 'js-combinatorics';
import * as _ from 'lodash';

type Pair = [Position, Position]

interface Position {
  x: number
  y: number
}

interface Input {
  map: (string | null)[][]
  lookup: { [key: string]: Position[] }
}

export default async function Home() {
  const sample = await readFile(8, 'sample.txt')
  const input = await readFile(8, 'puzzle.txt')

  function pairs<T>(coll: Array<T>, n: number) {
    let c = new Combination(coll, 2)
    return [...c]
  }

  function isValidPosition(p: Position, input: Input): boolean {
    return (p.x >= 0 && p.y >= 0 && p.x < input.map.length && p.y < input.map[0].length)
  }

  function resonantAntinodesForPositionPair(p: Pair, input: Input): Position[] {
    let antinodes = []
    let current = p

    // Left
    while (true) {
      let [l, _] = antinodesForPositionPair(current)

      if (!isValidPosition(l, input)) {
        break
      }

      antinodes.push(l)
      current = [l, current[0]]
    }

    current = p

    while (true) {
      let [_, r] = antinodesForPositionPair(current)

      if (!isValidPosition(r, input)) {
        break
      }

      antinodes.push(r)
      current = [current[1], r]
    }

    return antinodes
  }

  function antinodesForPositionPair(p: Pair): Pair {
    let xDiff = Math.abs(p[0].x - p[1].x)
    let yDiff = Math.abs(p[0].y - p[1].y)

    return [
      {
        x: p[0].x > p[1].x ? p[0].x + xDiff : p[0].x - xDiff,
        y: p[0].y > p[1].y ? p[0].y + yDiff : p[0].y - yDiff,
      },
      {
        x: p[1].x > p[0].x ? p[1].x + xDiff : p[1].x - xDiff,
        y: p[1].y > p[0].y ? p[1].y + yDiff : p[1].y - yDiff,
      },
    ]
  }

  function parseInput(input: string): Input {
    let rows = input.split("\n")

    let result = {
      map: _.times(rows.length, i => _.times(rows[i].length, j => null as (string | null))),
      lookup: {} as { [key: string]: Position[] }
    }

    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < rows[i].length; j++) {
        let cell = rows[i][j]

        if (cell === '.') {
          continue
        }

        result.map[i][j] = rows[i][j]
        result.lookup[cell] ||= []
        result.lookup[cell].push({ x: i, y: j })
      }
    }

    return result
  }

  function solvePart1(input: Input) {
    let antinodes = _
      .values(input.lookup)
      .flatMap(v => pairs(v, 2).flatMap(([l, r]) => antinodesForPositionPair([l, r])))
      .filter(p => isValidPosition(p, input))

    return _.uniqBy(antinodes, a => `${a.x},${a.y}`).length
  }

  function solvePart2(input: Input) {
    let antinodes = _
      .values(input.lookup)
      .flatMap(v => pairs(v, 2).flatMap(([l, r]) => resonantAntinodesForPositionPair([l, r], input)))
      .filter(p => isValidPosition(p, input))


    // All antennas are antinodes
    let antennas = _.flatten(_.values(input.lookup))

    return _.uniqBy([...antinodes, ...antennas], a => `${a.x},${a.y}`).length
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