import { readFile } from '@/app/util/io';
import * as _ from 'lodash';

export default async function Home() {
  const sample = await readFile(5, 'sample.txt')
  const input = await readFile(5, 'puzzle.txt')

  type Dependencies = { [target: number]: number[] }

  interface Input {
    dependencies: Dependencies
    updates: number[][]
  }

  function getFirstInvalidIndex(update: number[], dependencies: Dependencies) {
    let disallowed = new Set()

    for (let i = 0; i < update.length; i++) {
      let item = update[i]

      if (disallowed.has(item)) {
        return i
      }

      (dependencies[item] || []).forEach(n => disallowed.add(n))
    }

    return null
  }

  function validateUpdate(update: number[], dependencies: Dependencies) {
    return getFirstInvalidIndex(update, dependencies) === null ? true : false
  }

  function attemptFixInvalidUpdate(update: number[], dependencies: Dependencies) {
    let invalidIndex = getFirstInvalidIndex(update, dependencies)

    if (invalidIndex === null) {
      throw "Trying to fix valid update"
    }

    // Swap invalid entry with the entry behind it
    let swapped = [...update]
    let invalidItem = swapped[invalidIndex]
    swapped[invalidIndex] = swapped[invalidIndex - 1]
    swapped[invalidIndex - 1] = invalidItem

    return swapped
  }

  function getMiddlePage(update: number[]) {
    let index = Math.floor(update.length / 2)
    return update[index]
  }


  function parseInput(input: string): Input {
    let result = {
      dependencies: {} as Dependencies,
      updates: [] as number[][]
    }

    return input.split("\n").reduce((memo, line) => {
      if (line === "") {
        return memo
      }

      const m = line.match(/^(\d+)\|(\d+)$/)

      if (m) {
        let deps = { ...(memo.dependencies) }
        let target = parseInt(m[2])
        let precededBy = parseInt(m[1])

        deps[target] ||= []
        deps[target] = [...(deps[target]), precededBy]

        return {
          ...memo,
          dependencies: deps
        }
      }

      return {
        ...memo,
        updates: [
          ...(memo.updates),
          line.split(",").map(n => parseInt(n))
        ]
      }

    }, result)
  }

  function solvePart1(input: Input) {
    let validUpdates = input.updates.filter(u => validateUpdate(u, input.dependencies))
    let result = validUpdates.reduce((m, u) => m + getMiddlePage(u), 0)
    return result
  }

  function solvePart2(input: Input) {
    let invalidUpdates = input.updates.filter(u => !validateUpdate(u, input.dependencies))

    // Swap the first invalid entry with the entry behind it, and 
    // repeat until the pages become valid.
    let fixedUpdates = invalidUpdates.map(update => {
      let fixed = update

      while (!validateUpdate(fixed, input.dependencies)) {
        fixed = attemptFixInvalidUpdate(fixed, input.dependencies)
      }

      return fixed
    })

    let result = fixedUpdates.reduce((m, u) => m + getMiddlePage(u), 0)
    return result
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
        Part 2: {solvePart2(parseInput(input))}
      </li>
    </ul>
  )
}