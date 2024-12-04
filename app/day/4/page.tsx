import { readFile } from '@/app/util/io';
import * as _ from 'lodash';

export default async function Home() {
  const sample = await readFile(4, 'sample.txt')
  const input = await readFile(4, 'puzzle.txt')

  type Op = (x: number, y: number) => number

  const add = (x: number, y: number) => x + y
  const sub = (x: number, y: number) => x - y
  const noop = (x: number, y: number) => x - y

  interface Input {
    board: string[][]
  }

  function safeGet(board: string[][], i: number, j: number) {
    if (i >= 0 && i < board.length && j >= 0 && j < board[i].length) {
      return board[i][j]
    } else {
      return null
    }
  }

  function checkCellStartsWord(word: string, i: number, j: number, input: Input) {
    let candidates = _.times(word.length, k => [
      safeGet(input.board, i, j + k),     // Right
      safeGet(input.board, i, j - k),     // Left
      safeGet(input.board, i - k, j),     // Up
      safeGet(input.board, i + k, j),     // Down

      safeGet(input.board, i - k, j - k), // Top-Left
      safeGet(input.board, i - k, j + k), // Top-Right
      safeGet(input.board, i + k, j - k), // Bottom-Left
      safeGet(input.board, i + k, j + k), // Bottom-Right
    ])


    let matches = _
      .zip(...candidates)
      .map(c => c.join(""))
      .filter(s => s === word)

    return matches.length
  }

  function checkCellCentersX(i: number, j: number, input: Input) {
    let leftArm = [
      safeGet(input.board, i - 1, j - 1),
      safeGet(input.board, i, j),
      safeGet(input.board, i + 1, j + 1),
    ]

    let rightArm = [
      safeGet(input.board, i + 1, j - 1),
      safeGet(input.board, i, j),
      safeGet(input.board, i - 1, j + 1),
    ]

    leftArm.sort()
    rightArm.sort()

    return (
      safeGet(input.board, i, j) === "A" &&
      leftArm.join("") === "AMS" &&
      rightArm.join("") === "AMS"
    )
  }


  function parseInput(input: string): Input {
    return { board: input.split("\n").map(s => s.split("")) }
  }

  function solvePart1(input: Input) {
    let matches = 0

    for (let i = 0; i < input.board.length; i++) {
      for (let j = 0; j < input.board[i].length; j++) {
        matches += checkCellStartsWord("XMAS", i, j, input)
      }
    }

    return matches
  }

  function solvePart2(input: Input) {
    let matches = 0

    for (let i = 0; i < input.board.length; i++) {
      for (let j = 0; j < input.board[i].length; j++) {
        if (checkCellCentersX(i, j, input)) {
          matches++
        }
      }
    }

    return matches
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