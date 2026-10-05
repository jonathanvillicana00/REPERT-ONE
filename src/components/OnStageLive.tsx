'use client';

import React, { useState, useEffect, useRef } from 'react';
import { parseChordPro, NotationType, transposeNote } from '@/lib/chordEngine';
import { Play, Pause, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ArrowUp, ArrowDown, Music } from 'lucide-react';

interface SongItem {
  id: string;
  title: string;
  key: string;
  content: string;
}

interface OnStageLiveProps {
  songs: SongItem[];
}

export const OnStageLive: React.FC<OnStageLiveProps> = ({ songs }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [semitones, setSemitones] = useState(0);
  const [notation, setNotation] = useState<NotationType>('chords');
  const [fontSize, setFontSize] = useState<number>(18); // px
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(3); // 1 a 10

  const currentSong = songs[currentIndex] || songs[0];
  const containerRef = useRef<HTMLDivElement>(null);

  // Reiniciar estado de transposición al cambiar de canción
  useEffect(() => {
    setSemitones(0);
  }, [currentIndex]);

  // Manejo de Auto-Scroll
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScrolling) {
      interval = setInterval(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop += scrollSpeed * 0.5;
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isScrolling, scrollSpeed]);

  const currentKey = transposeNote(currentSong.key, semitones);
  const parsedLines = parseChordPro(currentSong.content, semitones, notation, currentSong.key);

  return (
    <div className="fixed inset-0 bg-black text-slate-100 flex flex-col z-50 overflow-hidden select-none">
      
      {/* Control Bar Superior (Optimizado para escenario) */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        
        {/* Selector de Canción del Setlist */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="p-2 bg-slate-800 disabled:opacity-30 hover:bg-slate-700 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div>
            <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
              {currentIndex + 1} de {songs.length} • Canción
            </div>
            <h2 className="text-lg font-black text-white">{currentSong.title}</h2>
          </div>

          <button
            onClick={() => setCurrentIndex(prev => Math.min(songs.length - 1, prev + 1))}
            disabled={currentIndex === songs.length - 1}
            className="p-2 bg-slate-800 disabled:opacity-30 hover:bg-slate-700 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Tono y Notación */}
        <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5">
            <Music className="w-4 h-4 text-indigo-400" />
            <span className="text-xl font-bold text-amber-400">{currentKey}</span>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
            <button
              onClick={() => setSemitones(prev => prev - 1)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSemitones(prev => prev + 1)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setNotation(prev => prev === 'chords' ? 'roman' : prev === 'roman' ? 'numbers' : 'chords')}
            className="text-xs font-bold bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-indigo-300 ml-2"
          >
            {notation === 'chords' ? 'Acordes' : notation === 'roman' ? 'Grados' : 'Números'}
          </button>
        </div>

        {/* Auto-Scroll & Tamaño de Fuente */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setIsScrolling(!isScrolling)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition ${
                isScrolling ? 'bg-amber-500 text-black' : 'bg-slate-800 text-white'
              }`}
            >
              {isScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isScrolling ? 'Pausar' : 'Auto-Scroll'}
            </button>
            
            <input
              type="range"
              min="1"
              max="10"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-16 accent-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
              className="p-1 hover:bg-slate-800 rounded text-slate-400"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold px-1 text-slate-300">{fontSize}px</span>
            <button
              onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
              className="p-1 hover:bg-slate-800 rounded text-slate-400"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Visor Prompter de Letra y Acordes */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-6 scroll-smooth bg-slate-950"
      >
        {parsedLines.map((line, lineIndex) => (
          <div key={lineIndex} className="flex flex-wrap items-end min-h-[3rem]">
            {line.items.map((item, itemIndex) => (
              <div key={itemIndex} className="inline-flex flex-col mr-2">
                {item.chord && (
                  <span
                    style={{ fontSize: `${fontSize * 0.95}px` }}
                    className="font-bold text-amber-400 font-mono tracking-wide"
                  >
                    {item.chord}
                  </span>
                )}
                <span
                  style={{ fontSize: `${fontSize}px` }}
                  className="font-medium text-slate-100 font-mono"
                >
                  {item.text || '\u00A0'}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};