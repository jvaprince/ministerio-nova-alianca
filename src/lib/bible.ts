// Bible books data
export const OLD_TESTAMENT = [
  'Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio',
  'Josué', 'Juízes', 'Rute', '1 Samuel', '2 Samuel',
  '1 Reis', '2 Reis', '1 Crônicas', '2 Crônicas', 'Esdras',
  'Neemias', 'Ester', 'Jó', 'Salmos', 'Provérbios',
  'Eclesiastes', 'Cânticos', 'Isaías', 'Jeremias', 'Lamentações',
  'Ezequiel', 'Daniel', 'Oséias', 'Joel', 'Amós',
  'Obadias', 'Jonas', 'Miquéias', 'Naum', 'Habacuque',
  'Sofonias', 'Ageu', 'Zacarias', 'Malaquias'
]

export const NEW_TESTAMENT = [
  'Mateus', 'Marcos', 'Lucas', 'João', 'Atos',
  'Romanos', '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios',
  'Filipenses', 'Colossenses', '1 Tessalonicenses', '2 Tessalonicenses',
  '1 Timóteo', '2 Timóteo', 'Tito', 'Filemom', 'Hebreus',
  'Tiago', '1 Pedro', '2 Pedro', '1 João', '2 João', '3 João',
  'Judas', 'Apocalipse'
]

export const ALL_BOOKS = [...OLD_TESTAMENT, ...NEW_TESTAMENT]

export const BOOK_CHAPTERS: Record<string, number> = {
  'Gênesis': 50, 'Êxodo': 40, 'Levítico': 27, 'Números': 36, 'Deuteronômio': 34,
  'Josué': 24, 'Juízes': 21, 'Rute': 4, '1 Samuel': 31, '2 Samuel': 24,
  '1 Reis': 22, '2 Reis': 25, '1 Crônicas': 29, '2 Crônicas': 36, 'Esdras': 10,
  'Neemias': 13, 'Ester': 10, 'Jó': 42, 'Salmos': 150, 'Provérbios': 31,
  'Eclesiastes': 12, 'Cânticos': 8, 'Isaías': 66, 'Jeremias': 52, 'Lamentações': 5,
  'Ezequiel': 48, 'Daniel': 12, 'Oséias': 14, 'Joel': 3, 'Amós': 9,
  'Obadias': 1, 'Jonas': 4, 'Miquéias': 7, 'Naum': 3, 'Habacuque': 3,
  'Sofonias': 3, 'Ageu': 2, 'Zacarias': 14, 'Malaquias': 4,
  'Mateus': 28, 'Marcos': 16, 'Lucas': 24, 'João': 21, 'Atos': 28,
  'Romanos': 16, '1 Coríntios': 16, '2 Coríntios': 13, 'Gálatas': 6, 'Efésios': 6,
  'Filipenses': 4, 'Colossenses': 4, '1 Tessalonicenses': 5, '2 Tessalonicenses': 3,
  '1 Timóteo': 6, '2 Timóteo': 4, 'Tito': 3, 'Filemom': 1, 'Hebreus': 13,
  'Tiago': 5, '1 Pedro': 5, '2 Pedro': 3, '1 João': 5, '2 João': 1, '3 João': 1,
  'Judas': 1, 'Apocalipse': 22
}

// Book abbreviations for Bible API
const BOOK_ABBR: Record<string, string> = {
  'Gênesis': 'gn', 'Êxodo': 'ex', 'Levítico': 'lv', 'Números': 'nm', 'Deuteronômio': 'dt',
  'Josué': 'js', 'Juízes': 'jz', 'Rute': 'rt', '1 Samuel': '1sm', '2 Samuel': '2sm',
  '1 Reis': '1rs', '2 Reis': '2rs', '1 Crônicas': '1cr', '2 Crônicas': '2cr', 'Esdras': 'ed',
  'Neemias': 'ne', 'Ester': 'et', 'Jó': 'jó', 'Salmos': 'sl', 'Provérbios': 'pv',
  'Eclesiastes': 'ec', 'Cânticos': 'ct', 'Isaías': 'is', 'Jeremias': 'jr', 'Lamentações': 'lm',
  'Ezequiel': 'ez', 'Daniel': 'dn', 'Oséias': 'os', 'Joel': 'jl', 'Amós': 'am',
  'Obadias': 'ob', 'Jonas': 'jn', 'Miquéias': 'mq', 'Naum': 'na', 'Habacuque': 'hc',
  'Sofonias': 'sf', 'Ageu': 'ag', 'Zacarias': 'zc', 'Malaquias': 'ml',
  'Mateus': 'mt', 'Marcos': 'mc', 'Lucas': 'lc', 'João': 'jo', 'Atos': 'at',
  'Romanos': 'rm', '1 Coríntios': '1co', '2 Coríntios': '2co', 'Gálatas': 'gl', 'Efésios': 'ef',
  'Filipenses': 'fp', 'Colossenses': 'cl', '1 Tessalonicenses': '1ts', '2 Tessalonicenses': '2ts',
  '1 Timóteo': '1tm', '2 Timóteo': '2tm', 'Tito': 'tt', 'Filemom': 'fm', 'Hebreus': 'hb',
  'Tiago': 'tg', '1 Pedro': '1pe', '2 Pedro': '2pe', '1 João': '1jo', '2 João': '2jo', '3 João': '3jo',
  'Judas': 'jd', 'Apocalipse': 'ap'
}

export interface BibleVerse {
  book: string
  chapter: number
  verse: number
  text: string
}

export interface BibleChapter {
  book: string
  chapter: number
  verses: BibleVerse[]
}

export async function fetchBibleChapter(book: string, chapter: number): Promise<BibleChapter> {
  const response = await fetch(
    `/api/biblia/${encodeURIComponent(book)}/${chapter}`
  )

  const data = await response.json()

  if (!response.ok || data.error) {
    // Lança para o catch do VersiculoSelector — que limpa a lista
    throw new Error(data.error ?? `Erro ao buscar ${book} ${chapter}`)
  }

  return data as BibleChapter
}

export async function fetchBibleVerse(book: string, chapter: number, verse: number): Promise<BibleVerse> {
  const abbr = BOOK_ABBR[book]
  if (!abbr) throw new Error(`Livro não encontrado: ${book}`)

  const response = await fetch(
    `https://bible-api.com/${encodeURIComponent(abbr)}+${chapter}:${verse}?translation=almeida`
  )

  if (!response.ok) {
    return {
      book,
      chapter,
      verse,
      text: 'Versículo não encontrado. Verifique sua conexão com a internet.'
    }
  }

  const data = await response.json()
  return {
    book,
    chapter,
    verse,
    text: data.text || ''
  }
}

function generateFallbackChapter(book: string, chapter: number): BibleChapter {
  return {
    book,
    chapter,
    verses: [
      { book, chapter, verse: 1, text: 'Conecte-se à internet para carregar os versículos.' }
    ]
  }
}

// Inspirational verses for the daily word
export const INSPIRATIONAL_VERSES = [
  { ref: 'João 15:5', text: 'Eu sou a videira; vós sois os ramos. Aquele que permanece em mim, e eu nele, esse dá muito fruto; porque sem mim nada podeis fazer.' },
  { ref: 'Salmos 23:1', text: 'O Senhor é o meu pastor; nada me faltará.' },
  { ref: 'Filipenses 4:13', text: 'Posso tudo naquele que me fortalece.' },
  { ref: 'Jeremias 29:11', text: 'Porque sou eu que sei os planos que tenho para você, diz o Senhor, planos de fazê-lo prosperar e não de causar dano, planos de dar a você esperança e um futuro.' },
  { ref: 'Romanos 8:28', text: 'Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.' },
  { ref: 'Isaías 40:31', text: 'Mas aqueles que esperam no Senhor renovarão as suas forças. Voarão alto como águias; correrão e não ficarão exaustos, andarão e não se cansarão.' },
  { ref: 'Mateus 6:33', text: 'Mas buscai primeiro o seu reino e a sua justiça, e todas estas coisas vos serão acrescentadas.' },
]
