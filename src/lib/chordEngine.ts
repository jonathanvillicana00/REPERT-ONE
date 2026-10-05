// Lista cromática de notas en sostenidos y bemoles
const CHROMATIC_SCALE_SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const CHROMATIC_SCALE_FLATS  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// Grados del Sistema Nashville (Números Romanos y Arábigos)
const NASHVILLE_ROMAN = ["I", "bII", "II", "bIII", "III", "IV", "bV", "V", "bVI", "VI", "bVII", "VII"];
const NASHVILLE_NUMBERS = ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"];

export type NotationType = 'chords' | 'roman' | 'numbers';

/**
 * Normaliza una nota para encontrar su índice cromático (0 a 11)
 */
function getNoteIndex(note: string): number {
  const normalized = note.trim();
  let index = CHROMATIC_SCALE_SHARPS.indexOf(normalized);
  if (index === -1) {
    index = CHROMATIC_SCALE_FLATS.indexOf(normalized);
  }
  return index;
}

/**
 * Transpone una nota individual N semitonos
 */
export function transposeNote(note: string, semitones: number, useFlats = false): string {
  const index = getNoteIndex(note);
  if (index === -1) return note; // Retorna la nota intacta si no la reconoce

  let newIndex = (index + semitones) % 12;
  if (newIndex < 0) newIndex += 12;

  const scale = useFlats ? CHROMATIC_SCALE_FLATS : CHROMATIC_SCALE_SHARPS;
  return scale[newIndex];
}

/**
 * Convierte una nota/acorde a formato Nashville (Grados/Números) relativo al tono de la canción
 */
export function convertToNashville(
  chordRoot: string,
  key: string,
  format: 'roman' | 'numbers' = 'roman'
): string {
  const keyIndex = getNoteIndex(key);
  const chordIndex = getNoteIndex(chordRoot);

  if (keyIndex === -1 || chordIndex === -1) return chordRoot;

  let interval = (chordIndex - keyIndex) % 12;
  if (interval < 0) interval += 12;

  const map = format === 'roman' ? NASHVILLE_ROMAN : NASHVILLE_NUMBERS;
  return map[interval];
}

/**
 * Procesa un acorde completo (ej. "G/B", "Cmaj7", "F#m7") soportando bajos slash,
 * transposición y notación Nashville.
 */
export function processChord(
  fullChord: string,
  semitones: number,
  targetNotation: NotationType,
  currentKey: string
): string {
  // Manejo de acordes compuestos con bajo (ej. C/E, G/B)
  if (fullChord.includes('/')) {
    const [mainChord, bassNote] = fullChord.split('/');
    const processedMain = processChord(mainChord, semitones, targetNotation, currentKey);
    const processedBass = processChord(bassNote, semitones, targetNotation, currentKey);
    return `${processedMain}/${processedBass}`;
  }

  // Expresión regular para separar la nota raíz del sufijo (m, maj7, sus4, 7, etc.)
  const match = fullChord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return fullChord;

  const [, root, suffix] = match;

  if (targetNotation === 'chords') {
    const transposedRoot = transposeNote(root, semitones);
    return `${transposedRoot}${suffix}`;
  } else {
    // Para Nashville, primero transponemos la nota raíz si hay cambio de tono
    const transposedRoot = transposeNote(root, semitones);
    const nashvilleRoot = convertToNashville(
      transposedRoot,
      transposeNote(currentKey, semitones),
      targetNotation === 'roman' ? 'roman' : 'numbers'
    );

    // Ajustar mayúsculas/minúsculas para acordes menores en notación romana (ej. "vi" o "ii")
    if (targetNotation === 'roman' && suffix.startsWith('m') && !suffix.startsWith('maj')) {
      return `${nashvilleRoot.toLowerCase()}${suffix.slice(1)}`;
    }

    return `${nashvilleRoot}${suffix}`;
  }
}

export interface LyricLine {
  items: Array<{
    chord?: string;
    text: string;
  }>;
}

/**
 * Parsea contenido en formato ChordPro [Acorde]Letra y lo transforma en objetos estructurados
 */
export function parseChordPro(
  content: string,
  semitones: number = 0,
  targetNotation: NotationType = 'chords',
  currentKey: string = 'C'
): LyricLine[] {
  const lines = content.split('\n');

  return lines.map(line => {
    const items: Array<{ chord?: string; text: string }> = [];
    const regex = /\[(.*?)\]|([^\[]+)/g;
    let match;
    let currentChord = '';

    while ((match = regex.exec(line)) !== null) {
      if (match[1] !== undefined) {
        // Es un acorde dentro de corchetes [G]
        currentChord = processChord(match[1], semitones, targetNotation, currentKey);
      } else if (match[2] !== undefined) {
        // Es texto/letra
        items.push({
          chord: currentChord || undefined,
          text: match[2]
        });
        currentChord = '';
      }
    }

    // Si la línea terminó en un acorde sin texto posterior
    if (currentChord) {
      items.push({ chord: currentChord, text: '' });
    }

    return { items };
  });
}