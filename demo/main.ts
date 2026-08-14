/* data-buddy demo — https://data-buddy.lucianlabs.ca
 *
 * The import below is aliased to src/lib in vite.demo.config.ts, so the page
 * exercises working-tree source rather than the published tarball.
 */

import { DataBuddy } from '@dank-inc/data-buddy'

declare const waveloop: { ready: (...tags: string[]) => Promise<unknown> }

type Take = {
  id: string | number
  name: string
  bars: number
  sealed: boolean
}

const app = document.getElementById('app') as HTMLElement

const h = (tag: string, cls?: string, text?: string) => {
  const n = document.createElement(tag)
  if (cls) n.className = cls
  if (text != null) n.textContent = text
  return n
}

const section = (title: string) => {
  const s = document.createElement('wl-section')
  s.setAttribute('title', title)
  app.append(s)
  return s
}

const SEED: Take[] = [
  { id: 'tk-001', name: 'room tone', bars: 4, sealed: true },
  { id: 'tk-002', name: 'kick loop', bars: 8, sealed: false },
  { id: 'tk-003', name: 'vox scratch', bars: 16, sealed: false },
]

let db = new DataBuddy<Take>(SEED.map((r) => ({ ...r })))

waveloop.ready().then(boot)

function boot() {
  installSection()
  storeSection()
  apiSection()
}

function installSection() {
  const s = section('install')
  const install = document.createElement('wl-install')
  install.setAttribute('pkg', '@dank-inc/data-buddy')
  const c = document.createElement('wl-code')
  c.textContent = `import { DataBuddy } from '@dank-inc/data-buddy'

type Take = { id: string | number; name: string; bars: number; sealed: boolean }

const db = new DataBuddy<Take>(seed)

db.get()                       // Take[] (a copy)
db.getOne('tk-002')            // Take | null
db.create({ name: 'new', bars: 4, sealed: false })  // Take, id generated
db.update('tk-002', { bars: 12 })                   // Take | null
db.delete('tk-003')                                 // boolean`
  s.append(install, c)
}

/* ── the live store ─────────────────────────────────────────────────────── */

function storeSection() {
  const s = section('the store')
  s.append(
    h(
      'p',
      'wl-muted',
      'Every button below calls the real library and prints what came back. The ' +
        'table is db.get() after the call. Try an id that does not exist: a miss ' +
        'is null from getOne and update, false from delete, and never a write.'
    )
  )

  const hud = document.createElement('wl-hud')
  hud.style.height = '250px'
  hud.style.overflow = 'auto'
  const tableWrap = h('div')
  tableWrap.style.position = 'absolute'
  tableWrap.style.inset = '2.4rem 0.7rem 1.8rem'
  tableWrap.style.overflow = 'auto'
  hud.append(tableWrap)
  s.append(hud)

  const log = document.createElement('wl-code')
  log.style.display = 'block'
  log.style.marginTop = '0.75rem'
  s.append(log)

  const lines: string[] = []
  const say = (call: string, result: unknown) => {
    lines.unshift(`${call}\n  → ${JSON.stringify(result)}`)
    if (lines.length > 6) lines.pop()
    log.textContent = lines.join('\n')
  }

  const paint = () => {
    const rows = db.get()
    hud.setAttribute('tl', 'DB.GET()')
    hud.setAttribute('tr', `${rows.length} RECORDS`)
    hud.setAttribute('bl', 'IN-MEMORY · NO PERSISTENCE')

    tableWrap.textContent = ''
    const table = h('table', 'wl-api')
    const thead = h('thead')
    const htr = h('tr')
    for (const c of ['id', 'name', 'bars', 'sealed']) htr.append(h('th', undefined, c))
    thead.append(htr)
    const tbody = h('tbody')
    for (const r of rows) {
      const tr = h('tr')
      tr.append(
        h('td', undefined, String(r.id)),
        h('td', undefined, r.name),
        h('td', undefined, String(r.bars)),
        h('td', undefined, r.sealed ? 'yes' : 'no')
      )
      tbody.append(tr)
    }
    table.append(thead, tbody)
    tableWrap.append(table)
  }

  /* controls */

  const targetRow = h('div', 'wl-row')
  targetRow.style.marginTop = '0.75rem'

  const idInput = document.createElement('input')
  idInput.value = 'tk-002'
  idInput.spellcheck = false
  idInput.style.padding = '0.55rem 0.75rem'
  idInput.style.minWidth = '150px'
  idInput.style.border = '1px solid var(--wl-line)'
  idInput.style.background = 'var(--wl-bg-deep)'
  idInput.style.color = 'var(--wl-text)'
  idInput.style.fontFamily = 'var(--wl-font-mono)'

  const nameInput = document.createElement('input')
  nameInput.value = 'overdub'
  nameInput.spellcheck = false
  nameInput.style.cssText = idInput.style.cssText

  const barsF = document.createElement('wl-fader')
  barsF.setAttribute('label', 'bars')
  barsF.setAttribute('min', '1')
  barsF.setAttribute('max', '32')
  barsF.setAttribute('step', '1')
  barsF.setAttribute('value', '8')
  barsF.style.minWidth = '180px'

  targetRow.append(
    Object.assign(h('span', 'wl-silk', 'id'), {}),
    idInput,
    Object.assign(h('span', 'wl-silk', 'name'), {}),
    nameInput,
    barsF
  )
  s.append(targetRow)

  const btns = h('div', 'wl-row')
  btns.style.marginTop = '0.75rem'

  const mk = (label: string, fn: () => void, ghost = false) => {
    const b = h('button', `wl-btn${ghost ? ' wl-btn--ghost' : ''}`, label)
    b.addEventListener('click', () => {
      fn()
      paint()
    })
    btns.append(b)
    return b
  }

  const bars = () => Math.round((barsF as HTMLElement & { value: number }).value)

  mk('get', () => say('db.get()', db.get()))
  mk('getOne', () => say(`db.getOne('${idInput.value}')`, db.getOne(idInput.value)))
  mk('create', () => {
    const rec = db.create({ name: nameInput.value, bars: bars(), sealed: false })
    say(`db.create({ name: '${nameInput.value}', bars: ${bars()}, sealed: false })`, rec)
  })
  mk('update', () =>
    say(`db.update('${idInput.value}', { bars: ${bars()} })`, db.update(idInput.value, { bars: bars() }))
  )
  mk('delete', () => say(`db.delete('${idInput.value}')`, db.delete(idInput.value)), true)
  mk(
    'reset',
    () => {
      db = new DataBuddy<Take>(SEED.map((r) => ({ ...r })))
      lines.length = 0
      log.textContent = ''
      say('new DataBuddy(seed)', db.get())
    },
    true
  )

  s.append(btns)
  paint()
}

function apiSection() {
  const s = section('api')
  const api = document.createElement('wl-api')
  s.append(api)
  ;(api as HTMLElement & { rows: unknown }).rows = [
    { name: 'new DataBuddy<T>', kind: 'class', signature: '(records: T[], genId?: () => T["id"]) => DataBuddy<T>', about: 'Copies the array you pass. Supply genId for stores whose id is not a string.' },
    { name: '.data', kind: 'property', signature: 'readonly T[]', about: 'The backing array. Readable, but replacing it is a type error.' },
    { name: '.get', kind: 'method', signature: '() => T[]', about: 'A copy of the records, so callers cannot mutate the store through it.' },
    { name: '.getOne', kind: 'method', signature: '(id: T["id"]) => T | null', about: 'First record with a matching id, else null.' },
    { name: '.create', kind: 'method', signature: '(body: Omit<T, "id">) => T', about: 'Appends with a generated id and returns the new record.' },
    { name: '.update', kind: 'method', signature: '(id: T["id"], body: Partial<T>) => T | null', about: 'Shallow-merges a patch, or null if no record has that id.' },
    { name: '.delete', kind: 'method', signature: '(id: T["id"]) => boolean', about: 'Removes by id. True when a record was actually removed.' },
  ]
}
