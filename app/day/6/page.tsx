import { readFile } from '@/app/util/io';
import * as _ from 'lodash';

interface Position {
  x: number
  y: number
}

enum Direction {
  Up,
  Down,
  Left,
  Right,
}

interface Input {
  obstacles: boolean[][]
  guard: [Position, Direction]

  height: number
  width: number
}

export default async function Home() {
  const sample = await readFile(6, 'sample.txt')
  const input = await readFile(6, 'puzzle.txt')

  function parseInput(input: string): Input {
    let rows = input.split("\n")

    let result: Input = {
      obstacles: _.times(rows.length, i => {
        return _.times(rows[i].length, j => false)
      }),
      guard: [{ x: 0, y: 0 }, Direction.Up],
      height: rows.length,
      width: rows[0].length
    }

    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < rows[i].length; j++) {
        if (rows[i][j] === "#") {
          result.obstacles[i][j] = true
        }

        if (rows[i][j] === "^") {
          result.guard = [{ x: i, y: j }, Direction.Up]
        }
      }
    }

    return result
  }

  let isPositionInvalid = (input: Input) => {
    let p = input.guard[0]
    return (p.x < 0 || p.y < 0 || p.x >= input.height || p.y >= input.width)
  }

  let lookupPosition = (grid: boolean[][], position: Position) => {
    let row = grid[position.x]

    if (!row) {
      return false
    }

    return row[position.y]
  }

  let writePosition = (grid: boolean[][], position: Position, value: boolean) => {
    let row = grid[position.x]

    if (!row) {
      return
    }

    row[position.y] = value
  }

  let tick = (input: Input): Input => {

    let direction = input.guard[1]
    let position = nextCellInDirection(input.guard[0], input.guard[1])

    if (lookupPosition(input.obstacles, position)) {
      // Reset position and change direction instead
      position = input.guard[0]

      switch (input.guard[1]) {
        case Direction.Up:
          direction = Direction.Right
          break
        case Direction.Down:
          direction = Direction.Left
          break
        case Direction.Left:
          direction = Direction.Up
          break
        case Direction.Right:
          direction = Direction.Down
          break
      }
    }

    return {
      ...input,
      guard: [position, direction]
    }
  }

  function nextCellInDirection(p: Position, d: Direction): Position {
    switch (d) {
      case Direction.Up:
        return { x: p.x - 1, y: p.y }
      case Direction.Down:
        return { x: p.x + 1, y: p.y }
      case Direction.Left:
        return { x: p.x, y: p.y - 1 }
      case Direction.Right:
        return { x: p.x, y: p.y + 1 }
    }
  }

  function run(input: Input) {
    let state = input;
    let loop = false
    let visited = _.times(input.height, () => _.times(input.width, () => new Set<Direction>()))
    visited[input.guard[0].x][input.guard[0].y].add(Direction.Up)

    while (true) {
      state = tick(state)

      if (isPositionInvalid(state)) {
        break
      }

      let visits = visited[state.guard[0].x][state.guard[0].y]

      if (visits.has(state.guard[1])) {
        loop = true
        break
      }

      visits.add(state.guard[1])
    }

    return { visited, loop }
  }

  function solvePart1(input: Input) {
    let { visited } = run(input)
    return _.flatten(visited).filter(s => s.size > 0).length
  }

  function solvePart2(input: Input) {
    let { visited } = run(input)
    let candidates: Position[] = []

    for (let i = 0; i < visited.length; i++) {
      for (let j = 0; j < visited[i].length; j++) {
        visited[i][j].forEach(d => {
          candidates.push(nextCellInDirection({ x: i, y: j }, d))
        })
      }
    }

    candidates = _.uniqWith(candidates, _.isEqual)

    let filtered = candidates.filter(c => {
      let prev = lookupPosition(input.obstacles, c)
      writePosition(input.obstacles, c, true)
      let { loop } = run(input)
      writePosition(input.obstacles, c, prev)

      return loop
    })

    return filtered.length
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