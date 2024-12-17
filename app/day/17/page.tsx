import { readFile } from '@/app/util/io';
import * as _ from 'lodash';

interface Computer {
  A: bigint
  B: bigint
  C: bigint
  program: number[]
  ip: number
  output: number[]
}

enum Operand {
  Literal,
  Combo
}


export default async function Home() {
  const sample = {
    A: 729n,
    B: 0n,
    C: 0n,
    program: [0, 1, 5, 4, 3, 0],
    ip: 0,
    output: []
  }

  const puzzle = {
    A: 30886132n,
    B: 0n,
    C: 0n,
    program: [2, 4, 1, 1, 7, 5, 0, 3, 1, 4, 4, 4, 5, 5, 3, 0],
    ip: 0,
    output: []
  }

  function readAddress(address: number, opType: Operand, c: Computer): bigint {
    if (address >= c.program.length) {
      throw "INVALID ADDRESS"
    }

    if (opType === Operand.Literal) {
      return BigInt(c.program[address])
    }

    switch (c.program[address]) {
      case 0:
      case 1:
      case 2:
      case 3:
        return BigInt(c.program[address])
      case 4:
        return c.A
      case 5:
        return c.B
      case 6:
        return c.C
      default:
        throw "INVALID COMBO OPERAND"
    }
  }

  function opAdv(c: Computer) {
    c.A = (c.A / 2n ** readAddress(c.ip + 1, Operand.Combo, c))
    c.ip += 2
    return c
  }

  function opBxl(c: Computer) {
    c.B = c.B ^ readAddress(c.ip + 1, Operand.Literal, c)
    c.ip += 2
    return c
  }

  function opBst(c: Computer) {
    c.B = readAddress(c.ip + 1, Operand.Combo, c) % 8n
    c.ip += 2
    return c
  }

  function opJnz(c: Computer) {
    if (c.A === 0n) {
      c.ip += 2
      return c
    }

    c.ip = Number(readAddress(c.ip + 1, Operand.Literal, c))
    return c
  }

  function opBxc(c: Computer) {
    c.B = c.B ^ c.C
    c.ip += 2
    return c
  }

  function opOut(c: Computer) {
    c.output.push(Number(readAddress(c.ip + 1, Operand.Combo, c) % 8n))
    c.ip += 2
    return c
  }

  function opBdv(c: Computer) {
    c.B = (c.A / 2n ** readAddress(c.ip + 1, Operand.Combo, c))
    c.ip += 2
    return c
  }

  function opCdv(c: Computer) {
    c.C = (c.A / 2n ** readAddress(c.ip + 1, Operand.Combo, c))
    c.ip += 2
    return c
  }


  function tick(c: Computer): Computer {
    // console.log(inspectInstruction(c.ip, c))

    let result = c

    switch (readAddress(c.ip, Operand.Literal, c)) {
      case 0n:
        result = opAdv(c)
        break
      case 1n:
        result = opBxl(c)
        break
      case 2n:
        result = opBst(c)
        break
      case 3n:
        result = opJnz(c)
        break
      case 4n:
        result = opBxc(c)
        break
      case 5n:
        result = opOut(c)
        break
      case 6n:
        result = opBdv(c)
        break
      case 7n:
        result = opCdv(c)
        break
      default:
        throw "INVALID OPCODE"
    }


    return result
  }

  function executeProgram(seed: number, input: Computer) {
    let c = input
    c.A = BigInt(seed)
    c.B = 0n
    c.C = 0n
    c.ip = 0
    c.output = []

    while (c.ip < c.program.length) {
      c = tick(c)
    }

    return c.output
  }

  function solvePart2(c: Computer) {
    let exp = c.program.length - 1
    let current = exp
    let deltas = _.times(exp + 1, () => 0)

    while (current >= 0 && current <= exp) {
      // We're on a bad path, backtrack
      if (deltas[current] > 7) {
        deltas[current] = 0
        current++
        deltas[current]++
        continue
      }

      let seed = deltas.reduce((n, delta, i) => n + ((8 ** i) * delta), 0)
      let output = executeProgram(seed, c)

      if (output[current] === c.program[current]) {
        current--
      } else {
        deltas[current]++
      }
    }

    return deltas.reduce((n, delta, i) => n + ((8 ** i) * delta), 0)
  }

  function solvePart1(input: Computer) {
    let output = executeProgram(Number(input.A), input)
    return output.join(",")
  }

  let part2RegisterA = solvePart2({ ...puzzle })

  return (
    <ul>
      <h1>Part 1</h1>
      <li>
        Sample: {solvePart1(sample)}
      </li>
      <li>
        Puzzle: {solvePart1(puzzle)}
      </li>
      <h1>Part 2</h1>
      <li>
        Output: {solvePart1({ ...puzzle, A: BigInt(part2RegisterA) })}
      </li>
      <li>
        Register A: {part2RegisterA}
      </li>
    </ul>
  )
}