import { readFile } from '@/app/util/io';
import * as _ from 'lodash';

interface Position {
  x: number
  y: number
}

interface Input {
  garden: string[][]
}

interface Region {
  name: string
  area: number
  perimeter: number
  corners: number
  cells: Set<string>
}

interface Position {
  x: number
  y: number
}

export default async function Home() {
  const sample1 = await readFile(12, 'sample-1.txt')
  const sample2 = await readFile(12, 'sample-2.txt')
  const sample3 = await readFile(12, 'sample-3.txt')
  const input = await readFile(12, 'puzzle.txt')

  function parseInput(input: string): Input {
    return { garden: input.split("\n").map(row => row.split("")) }
  }

  function isValidPosition({ x, y }: Position, input: Input) {
    return x >= 0 && y >= 0 && x < input.garden.length && y < input.garden[x].length
  }

  function neighbors({ x, y }: Position, input: Input) {
    let candidates = [
      { x: x - 1, y },
      { x, y: y + 1 },
      { x: x + 1, y },
      { x, y: y - 1 },
    ]

    return candidates.filter(c => isValidPosition(c, input))
  }

  function allNeighbors({ x, y }: Position, input: Input) {
    let candidates = [
      { x: x - 1, y },
      { x, y: y + 1 },
      { x: x + 1, y },
      { x, y: y - 1 },
    ]

    return candidates
  }

  function findRegion(at: Position, regions: Region[]) {
    return regions.find(r => r.cells.has(`${at.x},${at.y}`))
  }

  function calcCellsForRegion(at: Position, input: Input, result: Set<string>) {
    if (result.size === 0) {
      result.add(`${at.x},${at.y}`)
    }

    neighbors(at, input)
      .filter(n => input.garden[n.x][n.y] === input.garden[at.x][at.y])
      .filter(n => !result.has(`${n.x},${n.y}`))
      .forEach(n => {
        result.add(`${n.x},${n.y}`)
        calcCellsForRegion(n, input, result)
      })
  }

  function hasBorderWith(at: Position, neighbor: Position, input: Input) {
    if (!isValidPosition(neighbor, input)) {
      return true
    }

    if (input.garden[at.x][at.y] !== input.garden[neighbor.x][neighbor.y]) {
      return true
    }

    return false
  }

  function corners(at: Position, input: Input) {
    let result = 0
    let adj = allNeighbors(at, input)

    // Top and right
    if (hasBorderWith(at, adj[0], input) && hasBorderWith(at, adj[1], input)) {
      result++
    }

    // Right and bottom
    if (hasBorderWith(at, adj[1], input) && hasBorderWith(at, adj[2], input)) {
      result++
    }

    // Bottom and left
    if (hasBorderWith(at, adj[2], input) && hasBorderWith(at, adj[3], input)) {
      result++
    }

    // Left and top
    if (hasBorderWith(at, adj[3], input) && hasBorderWith(at, adj[0], input)) {
      result++
    }


    // Diagonals / concave corners
    if (!hasBorderWith(at, adj[0], input) &&
      !hasBorderWith(at, adj[1], input) &&
      isValidPosition({ x: at.x - 1, y: at.y + 1 }, input) &&
      input.garden[at.x][at.y] !== input.garden[at.x - 1][at.y + 1]) {
      result++
    }

    if (!hasBorderWith(at, adj[1], input) &&
      !hasBorderWith(at, adj[2], input) &&
      isValidPosition({ x: at.x + 1, y: at.y + 1 }, input) &&
      input.garden[at.x][at.y] !== input.garden[at.x + 1][at.y + 1]) {
      result++
    }

    if (!hasBorderWith(at, adj[2], input) &&
      !hasBorderWith(at, adj[3], input) &&
      isValidPosition({ x: at.x + 1, y: at.y - 1 }, input) &&
      input.garden[at.x][at.y] !== input.garden[at.x + 1][at.y - 1]) {
      result++
    }

    if (!hasBorderWith(at, adj[3], input) &&
      !hasBorderWith(at, adj[0], input) &&
      isValidPosition({ x: at.x - 1, y: at.y - 1 }, input) &&
      input.garden[at.x][at.y] !== input.garden[at.x - 1][at.y - 1]) {
      result++
    }

    return result
  }

  // How many of this cell's neighbors are unlike it?
  function partialPerimeter(at: Position, input: Input) {
    let scores: number[] = allNeighbors(at, input).map(n => hasBorderWith(at, n, input) ? 1 : 0)
    return scores.reduce((sum, n) => sum + n, 0)
  }

  function buildRegions(input: Input) {
    let regions: Region[] = []

    for (let i = 0; i < input.garden.length; i++) {
      for (let j = 0; j < input.garden[i].length; j++) {

        let region = findRegion({ x: i, y: j }, regions)

        if (!region) {
          regions = [
            {
              name: input.garden[i][j],
              cells: new Set<string>(),
              area: 0,
              perimeter: 0,
              corners: 0
            },
            ...regions
          ]

          region = regions[0]
        }

        region.area++
        region.corners += corners({ x: i, y: j }, input)
        region.perimeter += partialPerimeter({ x: i, y: j }, input)


        calcCellsForRegion({ x: i, y: j }, input, region.cells)
      }
    }

    return regions
  }

  function solvePart1(input: Input) {
    let regions = buildRegions(input)
    return regions.reduce((sum, r) => sum + (r.area * r.perimeter), 0)
  }

  function solvePart2(input: Input) {
    let regions = buildRegions(input)
    return regions.reduce((sum, r) => sum + (r.area * r.corners), 0)
  }

  return (
    <ul>
      <h1>Part 1</h1>
      <li>
        Sample 1: {solvePart1(parseInput(sample1))}
      </li>
      <li>
        Sample 2: {solvePart1(parseInput(sample2))}
      </li>
      <li>
        Sample 3: {solvePart1(parseInput(sample3))}
      </li>
      <li>
        Puzzle: {solvePart1(parseInput(input))}
      </li>
      <h1>Part 2</h1>
      <li>
        Sample 1: {solvePart2(parseInput(sample1))}
      </li>
      <li>
        Sample 2: {solvePart2(parseInput(sample2))}
      </li>
      <li>
        Sample 3: {solvePart2(parseInput(sample3))}
      </li>
      <li>
        Puzzle: {solvePart2(parseInput(input))}
      </li>
    </ul>
  )
}