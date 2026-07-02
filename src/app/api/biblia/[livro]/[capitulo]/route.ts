import { NextRequest, NextResponse } from 'next/server'
import biblia from '@/data/biblia.json'

interface BibliaEntry {
  abbrev: string
  book?: string
  name?: string
  chapters: string[][]
}

const db = biblia as BibliaEntry[]

function normalize(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function findBook(name: string): BibliaEntry | undefined {
  const normalized = normalize(name)

  return db.find(b => {
    const bookName = b.book ?? b.name ?? ''
    return normalize(bookName) === normalized
  })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { livro: string; capitulo: string } }
) {
  const livro = decodeURIComponent(params.livro)
  const capitulo = parseInt(params.capitulo, 10)

  if (!livro || isNaN(capitulo) || capitulo < 1) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  const entry = findBook(livro)

  if (!entry) {
    return NextResponse.json(
      { error: `Livro não encontrado: ${livro}` },
      { status: 404 }
    )
  }

  const chapterData = entry.chapters[capitulo - 1]

  if (!chapterData) {
    return NextResponse.json(
      { error: `Capítulo ${capitulo} não encontrado em ${livro}` },
      { status: 404 }
    )
  }

  return NextResponse.json({
    book: livro,
    chapter: capitulo,
    verses: chapterData.map((text, i) => ({
      book: livro,
      chapter: capitulo,
      verse: i + 1,
      text: text.trim(),
    })),
  })
}