import { readFile } from '@/app/util/io';

export default async function Home() {
  const sample = await readFile(2, 'sample.txt')
  const input = await readFile(2, 'puzzle.txt')

  interface Report {
    levels: number[]
  }

  interface Input {
    reports: Report[]
  }

  function isReportSafe(report: Report) {
    const diffs = report.levels.slice(1).map((level, i) => level - report.levels[i])

    return (
      diffs.every(n => n > 0) ||
      diffs.every(n => n < 0)
    ) &&
      (
        diffs.every(n => Math.abs(n) >= 1 && Math.abs(n) <= 3)
      )
  }

  function isReportSafeWithRemoval(report: Report) {
    let possibles: Report[] = report.levels.map((level, i) => {
      const levels = [...(report.levels)]
      levels.splice(i, 1)
      return { levels }
    })

    possibles = [...possibles, report]
    return possibles.some(report => isReportSafe(report))
  }

  function parseInput(input: string): Input {
    const rows = input.split("\n")

    const reports: Report[] = rows.map(row => {
      return {
        levels: row.split(/\s+/).map(n => parseInt(n))
      }
    })

    return { reports }
  }

  function solvePart1(input: Input) {
    return input.reports.filter(isReportSafe).length
  }

  function solvePart2(input: Input) {
    return input.reports.filter(isReportSafeWithRemoval).length
  }


  return (
    <ul>
      <li>
        Sample: {solvePart1(parseInput(sample))}
      </li>
      <li>
        Part 1: {solvePart1(parseInput(input))}
      </li>
      <li>
        Part 2: {solvePart2(parseInput(input))}
      </li>
    </ul>
  )
}