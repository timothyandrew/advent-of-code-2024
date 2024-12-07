import { readFile } from '@/app/util/io';
import * as _ from 'lodash';

enum Operator {
  Add,
  Mul,
  Concat
}

interface Equation {
  total: number
  components: number[]

  runningTotal: number
  operators: Operator[]
}

type Input = Equation[]

export default async function Home() {
  const sample = await readFile(7, 'sample.txt')
  const input = await readFile(7, 'puzzle.txt')

  function parseInput(input: string): Input {
    let rows = input.split("\n")

    let result = rows.map(row => {
      let [total, coll] = row.split(":")
      let components = coll.trim().split(" ").map(n => parseInt(n))
      return { total: parseInt(total), components, operators: [], runningTotal: 0 }
    })

    return result
  }

  function applyOperator(x: number, y: number, op: Operator) {
    switch (op) {
      case Operator.Add:
        return x + y
      case Operator.Mul:
        return x * y
      case Operator.Concat:
        return parseInt(`${x}${y}`)
    }
  }

  function solveEquation(e: Equation, validOperators: Operator[]): Operator[] {
    if (e.runningTotal === e.total) {
      return e.operators
    }
    if (e.runningTotal > e.total || e.components.length === 0) {
      return []
    }

    let candidates = validOperators.map(op => {
      if (e.runningTotal === 0) {
        return solveEquation({
          ...e,
          runningTotal: e.components[0],
          components: e.components.slice(1),
        }, validOperators)
      }

      return solveEquation({
        ...e,
        runningTotal: applyOperator(e.runningTotal, e.components[0], op),
        components: e.components.slice(1),
        operators: [...(e.operators), op]
      }, validOperators)
    })

    return candidates.filter(ops => ops.length > 0)[0] || []
  }

  function solvePart1(input: Input) {
    let operators = [Operator.Add, Operator.Mul]
    let matching = input.filter(i => solveEquation(i, operators).length > 0)
    return matching.reduce((memo, eq) => memo + eq.total, 0)
  }

  function solvePart2(input: Input) {
    let operators = [Operator.Add, Operator.Mul, Operator.Concat]
    let matching = input.filter(i => solveEquation(i, operators).length > 0)
    return matching.reduce((memo, eq) => memo + eq.total, 0)
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