import { readFile } from '@/app/util/io';
import * as _ from 'lodash';

interface Block {
  id: (number | null)
}

interface Input {
  blocks: Block[]
  maxID: number
}


export default async function Home() {
  const sample = await readFile(9, 'sample.txt')
  const input = await readFile(9, 'puzzle.txt')

  function parseInput(input: string): Input {
    let result = { blocks: [] as Block[], maxID: -1 }
    let cells = input.split("").map(n => parseInt(n))

    for (let i = 0; i < cells.length; i += 2) {
      // File blocks
      for (let j = 0; j < cells[i]; j++) {
        let id = Math.floor(i / 2)
        if (id > result.maxID) {
          result.maxID = id
        }
        result.blocks.push({ id })
      }

      if (i === cells.length - 1) {
        break
      }

      // Empty blocks
      for (let j = 0; j < cells[i + 1]; j++) {
        result.blocks.push({ id: null })
      }
    }

    return result
  }

  function isDefragmented(disk: Block[]): boolean {
    let firstEmpty = _.findIndex(disk, b => b.id === null)
    return disk.slice(firstEmpty).every(b => b.id === null)
  }

  function finalFileBlockIndex(disk: Block[]): number {
    return _.findLastIndex(disk, b => b.id !== null)
  }

  function blockIndexesForID(id: number, disk: Block[]): number[] {
    return disk.reduce((indexes, block, i) => {
      if (block.id === id) {
        return [...indexes, i]
      }

      return indexes
    }, [] as number[])
  }

  function emptySpaceOfSize(target: number, disk: Block[]): number[] {
    for (let i = 0; i < disk.length; i++) {
      if (disk[i].id === null) {
        let size = 1
        let indexes = [i]

        for (let j = i + 1; j < disk.length; j++) {
          if (disk[j].id === null) {
            size++
            indexes = [...indexes, j]
          } else {
            break
          }
        }

        if (size >= target) {
          return indexes
        }
      }
    }

    return []
  }

  function defragmentOneBlock(disk: Block[]) {
    for (let i = 0; i < disk.length; i++) {
      if (disk[i].id === null) {
        let lastIndex = finalFileBlockIndex(disk)
        disk[i].id = disk[lastIndex].id
        disk[lastIndex].id = null
        return
      }
    }
  }

  function checksum(input: Input) {
    return input.blocks.reduce((sum, b, i) => {
      if (b.id === null) {
        return sum
      } else {
        return sum + (b.id * i)
      }
    }, 0)
  }

  function solvePart1(input: Input) {
    while (!isDefragmented(input.blocks)) {
      defragmentOneBlock(input.blocks)
    }

    return checksum(input)
  }

  function solvePart2(input: Input) {
    for (let i = input.maxID; i >= 0; i--) {
      let file = blockIndexesForID(i, input.blocks)
      let target = emptySpaceOfSize(file.length, input.blocks)

      if (target.length === 0 || target[0] >= file[0]) {
        continue
      }

      for (let j = 0; j < file.length; j++) {
        let sourceIndex = file[j]
        let targetIndex = target[j]

        input.blocks[targetIndex].id = input.blocks[sourceIndex].id
        input.blocks[sourceIndex].id = null
      }

    }

    return checksum(input)
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