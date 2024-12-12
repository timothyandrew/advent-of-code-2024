import { readFile } from '@/app/util/io';
import * as _ from 'lodash';

interface Position {
  x: number
  y: number
}

interface Input {
  stones: { [key: number]: number }
}


export default async function Home() {
  const sample = await readFile(11, 'sample.txt')
  const input = await readFile(11, 'puzzle.txt')

  function parseInput(input: string): Input {
    let stones = input.split(" ").map(n => parseInt(n))
    return { stones: _.countBy(stones, s => s) }
  }

  function setFreqValue(n: number, input: Input, to: (prev: number) => number) {
    input.stones[n] ||= 0
    input.stones[n] = to(input.stones[n])

    if ((input.stones[n]) === 0) {
      delete input.stones[n]
    }

  }

  function tick(input: Input): Input {
    let keys = _.keys(input.stones)
    let values = keys.map(k => input.stones[parseInt(k)])

    for (let i = 0; i < keys.length; i++) {
      let k = parseInt(keys[i])
      let v = values[i]

      if (v === 0) {
        continue
      }

      if (k === 0) {
        setFreqValue(1, input, n => n + v)
        setFreqValue(0, input, n => n - v)
        continue
      }

      let length = `${k}`.length

      if (length % 2 === 0) {
        setFreqValue(parseInt(`${k}`.slice(0, length / 2)), input, n => n + v)
        setFreqValue(parseInt(`${k}`.slice(length / 2)), input, n => n + v)
        setFreqValue(k, input, n => n - v)
        continue
      }

      setFreqValue(k * 2024, input, n => n + v)
      setFreqValue(k, input, n => n - v)

    }

    return input
  }

  function solve(input: Input, times: number) {
    let evolved = _.times(times, n => n).reduce((memo, n) => {
      return tick(memo)
    }, input)

    return _.reduce(evolved.stones, (sum, v) => sum + v, 0)
  }

  return (
    <ul>
      <h1>Part 1</h1>
      <li>
        Sample: {solve(parseInput(sample), 25)}
      </li>
      <li>
        Puzzle: {solve(parseInput(input), 25)}
      </li>
      <h1>Part 2</h1>
      <li>
        Sample: {solve(parseInput(sample), 75)}
      </li>
      <li>
        Puzzle: {solve(parseInput(input), 75)}
      </li>
    </ul>
  )
}