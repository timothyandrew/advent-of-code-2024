import { readFile } from '@/app/util/io';

export default async function Home() {
  const sample = await readFile(3, 'sample.txt')
  const sample2 = await readFile(3, 'sample2.txt')
  const input = await readFile(3, 'puzzle.txt')

  interface Instruction {
    op: "mul" | "do" | "don't"
    args: number[]
  }

  interface Input {
    lines: string[]
  }

  class VM {
    enabled = true
    sum = 0
    enabledInstructions = ["do", "don't", "mul"]

    public constructor(enabledInstructions?: string[]) {
      if (enabledInstructions) {
        this.enabledInstructions = enabledInstructions
      }
    }

    public applyInstruction(instruction: Instruction) {
      if (!this.enabledInstructions.includes(instruction.op)) {
        return
      }

      if (instruction.op === "do") {
        this.enabled = true
      }

      if (instruction.op === "don't") {
        this.enabled = false
      }

      if (!this.enabled) {
        return
      }


      if (instruction.op === "mul") {
        this.sum += instruction.args.reduce((coll, n) => n * coll)
      }
    }

    public fetchResult() {
      return this.sum
    }

  }


  function parseInput(input: string): Input {
    const lines = input.split("\n").map(s => s.trim())
    return { lines }
  }

  function extractInstructions(line: string) {
    const matches = line.match(/(mul\(\d{1,3},\d{1,3}\)|do\(\)|don't\(\))/g)

    if (!matches) {
      throw `No matches`
    }

    return matches?.map(m => {
      const terms = m.match(/(\S+)\((\d{1,3})?,?(\d{1,3})?\)/)

      if (!terms) {
        throw `Invalid instruction ${m}`
      }

      return {
        op: terms[1],
        args: terms.slice(2).map(n => parseInt(n))
      } as Instruction
    })
  }

  function solvePart1(input: Input) {
    const vm = new VM(["mul"])
    input.lines.flatMap(extractInstructions).forEach((instruction) => vm.applyInstruction(instruction))
    return vm.fetchResult()
  }

  function solvePart2(input: Input) {
    const vm = new VM()
    input.lines.flatMap(extractInstructions).forEach((instruction) => vm.applyInstruction(instruction))
    return vm.fetchResult()
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
        Sample: {solvePart2(parseInput(sample2))}
      </li>
      <li>
        Part 2: {solvePart2(parseInput(input))}
      </li>
    </ul>
  )
}