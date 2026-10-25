#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoots = ['src', 'public'].map((directory) => path.join(appRoot, directory))

const fakePhoneNumbers = [
  '9876543210',
  '8765432109',
  '7654321098',
  '6543210987',
  '5432109876',
  '4321098765',
  '3210987654',
  '2109876543',
  '5555555555',
  '1234567890',
  '0000000000',
]
const fakePhonePattern = new RegExp(
  `(?:${fakePhoneNumbers.map((number) => number.split('').join('[\\s().-]*')).join('|')})`,
  'i',
)

// Keep these checks specific to known placeholder content. In particular, do not
// match identifiers such as Testimonials, ordinary City labels, or .test() calls.
const checks = [
  ['Lorem filler', /\blorem(?:\s+ipsum)?\b/i],
  ['Sample filler', /\bsample\b/i],
  ['Standalone test/demo/dummy wording', /(?<![\w.])(?:test|demo|dummy)\b/i],
  ['example.com address', /\bexample\.com\b/i],
  ['Priya Sharma sample identity', /\bpriya\s+sharma\b/i],
  ['White dress filler', /\bwhite\s+dress\b/i],
  ['Customer-name filler', /\bcustomer\s+name\b/i],
  ['City-name filler', /\b(?:your\s+city|city\s+name)\b/i],
  ['Known fake phone number', fakePhonePattern],
  [
    'Known fake email address',
    /\b(?:priya\.s|ananya\.r|meera\.p|sneha\.g|divya\.i|kavya\.n|riya\.k|tara\.s)@gmail\.com\b/i,
  ],
  [
    'Known fake street address',
    /\b(?:42\s+Fashion\s+Street,?\s+Lajpat\s+Nagar|15\s+Linking\s+Road,?\s+Bandra\s+West|123\s+Main\s+St(?:reet)?)\b/i,
  ],
  [
    'Placeholder image URL',
    /https?:\/\/[^\s"'`<>)]*(?:unsplash\.com|picsum\.photos|placehold(?:er)?\.(?:co|it|com)|placehold\.)[^\s"'`<>)]*/i,
  ],
  ['Hardcoded 25+ statistic', /\b25\s*\+/],
  ['Hardcoded 150+ statistic', /\b150\s*\+/],
  ['Stale Bridal Couture 2024 text', /\bbridal\s+couture\s+2024\b/i],
]

const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.html', '.svg'])
const files = []

async function collect(directory) {
  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return
    throw error
  }

  entries.sort((a, b) => a.name.localeCompare(b.name))
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      await collect(absolutePath)
    } else if (entry.isFile() && sourceExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolutePath)
    }
  }
}

for (const sourceRoot of sourceRoots) await collect(sourceRoot)

const findings = []
for (const file of files) {
  const text = await readFile(file, 'utf8')
  const relativePath = path.relative(appRoot, file).split(path.sep).join('/')
  const lines = text.split(/\r?\n/)

  lines.forEach((line, index) => {
    for (const [label, pattern] of checks) {
      pattern.lastIndex = 0
      if (pattern.test(line)) {
        findings.push(`${relativePath}:${index + 1} [${label}] ${line.trim()}`)
      }
    }
  })
}

if (findings.length > 0) {
  console.error(`Mock-content check failed: found ${findings.length} possible placeholder(s) in application source.\n`)
  for (const finding of findings) console.error(`  ${finding}`)
  console.error('\nReplace these with approved production content, or remove the obsolete copy, before building.')
  process.exitCode = 1
} else {
  console.log(`Mock-content check passed (${files.length} application source files scanned).`)
}
