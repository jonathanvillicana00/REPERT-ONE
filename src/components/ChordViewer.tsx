'use client';

import React, { useState } from 'react';
import { parseChordPro, NotationType, transposeNote } from '../lib/chordEngine';
import { Music, ArrowUp, ArrowDown } from 'lucide-react';

interface ChordViewerProps {
  initialContent: string;
  originalKey: string;
}

export const ChordViewer: React.FC<ChordViewerProps> = ({
  initialContent,
  originalKey,
}) => {
  const [semitones, setSemitones] = useState<number>(0);
  const [notation, setNotation] = useState<NotationType>('chords');
  const [content, setContent] = useState<string>(initialContent);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const currentKey = transposeNote(originalKey, semitones);
  const parsedLines = parseChordPro(content, semitones, notation, originalKey);

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-2xl p-6">
      {/* Barra de Herramientas Superior */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/20 text-indigo-400 p-2.5 rounded-lg border border-indigo-500/30">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Tono Actual</span>
            <div className="text-2xl font-bold text-indigo-400">{currentKey}</div>
          </div>
        </div>

        {/* Controles de Transposición */}
        <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setSemitones(prev => prev - 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md hover:bg-slate-700 transition"
          >
            <ArrowDown className="w-3.5 h-3.5" /> -1 Semitono
          </button>

          <span className="px-3 text-xs font-bold text-slate-400 border-x border-slate-700">
            {semitones > 0 ? `+${semitones}` : semitones}
          </span>

          <button
            onClick={() => setSemitones(prev => prev + 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md hover:bg-slate-700 transition"
          >
            <ArrowUp className="w-3.5 h-3.5" /> +1 Semitono
          </button>
        </div>

        {/* Controles de Notación */}
        <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setNotation('chords')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              notation === 'chords' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Acordes
          </button>
          <button
            onClick={() => setNotation('roman')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              notation === 'roman' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Grados (I, IV, V)
          </button>
          <button
            onClick={() => setNotation('numbers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              notation === 'numbers' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Números (1, 4, 5)
          </button>
        </div>

        {/* Modo Edición */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
        >
          {isEditing ? 'Vista Previa' : 'Editar ChordPro'}
        </button>
      </div>

      {/* Cuerpo Principal */}
      <div className="mt-6 font-mono">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full bg-slate-950 text-emerald-400 p-4 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono text-sm leading-relaxed"
            placeholder="Escribe la letra con acordes entre corchetes [G]Luz del [C]mundo..."
          />
        ) : (
          <div className="space-y-4 py-2">
            {parsedLines.map((line, lineIndex) => (
              <div key={lineIndex} className="flex flex-wrap items-end min-h-[2.5rem]">
                {line.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="inline-flex flex-col mr-1">
                    {item.chord && (
                      <span className="text-sm font-bold text-amber-400 tracking-wider">
                        {item.chord}
                      </span>
                    )}
                    <span className="text-base text-slate-200">
                      {item.text || '\u00A0'}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};