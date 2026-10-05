'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, UserPlus, Music, CheckCircle2, CalendarPlus } from 'lucide-react';

interface SongOption {
  id: string;
  title: string;
  artist: string;
  defaultKey: string;
}

interface Volunteer {
  id: string;
  name: string;
  role: string;
  status: 'confirmed' | 'pending';
}

interface SetlistItem {
  id: string;
  songId: string;
  title: string;
  key: string;
  notes: string;
}

const AVAILABLE_SONGS: SongOption[] = [
  { id: '1', title: 'Luz del Mundo', artist: 'Tim Hughes', defaultKey: 'C' },
  { id: '2', title: 'Cuerdas de Amor', artist: 'Julio Melgar', defaultKey: 'G' },
  { id: '3', title: 'Way Maker (Abridor de Caminos)', artist: 'Sinach', defaultKey: 'A' },
  { id: '4', title: 'La Bondad de Dios', artist: 'Bethel Music', defaultKey: 'A' },
];

const ROLES = ['Líder de Alabanza', 'Voz de Apoyo', 'Teclado', 'Guitarra Acústica', 'Guitarra Eléctrica', 'Bajo', 'Batería'];

export const ServicePlanner: React.FC = () => {
  const [serviceTitle, setServiceTitle] = useState('Servicio Dominical');
  const [serviceDate, setServiceDate] = useState('2026-10-11');
  const [serviceTime, setServiceTime] = useState('10:00');
  
  const [setlist, setSetlist] = useState<SetlistItem[]>([
    { id: 's1', songId: '1', title: 'Luz del Mundo', key: 'C', notes: 'Entrar con pad suave' },
  ]);

  const [volunteers, setVolunteers] = useState<Volunteer[]>([
    { id: 'v1', name: 'Mateo González', role: 'Líder de Alabanza', status: 'confirmed' },
    { id: 'v2', name: 'Sofía Martínez', role: 'Teclado', status: 'pending' },
  ]);

  const [selectedSongId, setSelectedSongId] = useState('');
  const [newVolName, setNewVolName] = useState('');
  const [newVolRole, setNewVolRole] = useState(ROLES[0]);

  // Agregar canción al Setlist
  const handleAddSong = () => {
    const song = AVAILABLE_SONGS.find(s => s.id === selectedSongId);
    if (!song) return;

    const newItem: SetlistItem = {
      id: Date.now().toString(),
      songId: song.id,
      title: song.title,
      key: song.defaultKey,
      notes: ''
    };

    setSetlist([...setlist, newItem]);
    setSelectedSongId('');
  };

  // Eliminar canción del Setlist
  const handleRemoveSong = (id: string) => {
    setSetlist(setlist.filter(item => item.id !== id));
  };

  // Cambiar tono de canción en el Setlist
  const handleKeyChange = (id: string, newKey: string) => {
    setSetlist(setlist.map(item => item.id === id ? { ...item, key: newKey } : item));
  };

  // Agregar Voluntario
  const handleAddVolunteer = () => {
    if (!newVolName.trim()) return;
    const newVol: Volunteer = {
      id: Date.now().toString(),
      name: newVolName,
      role: newVolRole,
      status: 'pending'
    };
    setVolunteers([...volunteers, newVol]);
    setNewVolName('');
  };

  // Generar enlace directo a Google Calendar
  const handleGoogleCalendarSync = () => {
    const startIso = `${serviceDate.replace(/-/g, '')}T${serviceTime.replace(':', '')}00Z`;
    const details = encodeURIComponent(
      `Reunión de Alabanza.\n\nSetlist:\n${setlist.map((s, i) => `${i + 1}. ${s.title} (${s.key})`).join('\n')}`
    );
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(serviceTitle)}&dates=${startIso}/${startIso}&details=${details}`;
    window.open(googleUrl, '_blank');
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-2xl p-6 space-y-8">
      
      {/* Encabezado del Servicio */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-2">
          <input
            type="text"
            value={serviceTitle}
            onChange={(e) => setServiceTitle(e.target.value)}
            className="text-2xl font-bold bg-transparent border-b border-slate-700 focus:border-indigo-500 focus:outline-none text-white w-full sm:w-auto"
          />
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <input
                type="time"
                value={serviceTime}
                onChange={(e) => setServiceTime(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleGoogleCalendarSync}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition shadow-lg shadow-indigo-600/20"
        >
          <CalendarPlus className="w-4 h-4" /> Sync a Google Calendar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda & Centro: Armador de Setlist (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
              <Music className="w-5 h-5" /> Orden de Canciones (Setlist)
            </h2>
            <span className="text-xs text-slate-400">{setlist.length} Canciones</span>
          </div>

          {/* Selector para agregar canción */}
          <div className="flex gap-2">
            <select
              value={selectedSongId}
              onChange={(e) => setSelectedSongId(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Seleccionar canción del repertorio --</option>
              {AVAILABLE_SONGS.map((song) => (
                <option key={song.id} value={song.id}>
                  {song.title} ({song.artist})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddSong}
              disabled={!selectedSongId}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </div>

          {/* Lista de canciones del setlist */}
          <div className="space-y-3 pt-2">
            {setlist.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-slate-800/60 border border-slate-700/80 rounded-lg p-3.5 hover:border-slate-600 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-slate-700 text-slate-300 font-bold text-xs rounded-full">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-sm text-white">{item.title}</h4>
                    <input
                      type="text"
                      placeholder="Nota (ej. Transición rápida, Solo de guitarra)"
                      value={item.notes}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSetlist(setlist.map(s => s.id === item.id ? { ...s, notes: val } : s));
                      }}
                      className="text-xs bg-transparent text-slate-400 focus:outline-none focus:text-slate-200 w-full mt-0.5"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400">Tono:</span>
                    <input
                      type="text"
                      value={item.key}
                      onChange={(e) => handleKeyChange(item.id, e.target.value)}
                      className="w-10 bg-slate-900 border border-slate-700 text-center font-bold text-amber-400 rounded py-0.5 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveSong(item.id)}
                    className="text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {setlist.length === 0 && (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg text-xs text-slate-500">
                No hay canciones agregadas a este servicio.
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Equipo / Voluntarios (1 col) */}
        <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-8 pt-6 lg:pt-0">
          <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
            <UserPlus className="w-5 h-5" /> Equipo Asignado
          </h2>

          {/* Formulario rápido para programar miembro */}
          <div className="space-y-2 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <input
              type="text"
              placeholder="Nombre del músico..."
              value={newVolName}
              onChange={(e) => setNewVolName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded p-2 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex gap-2">
              <select
                value={newVolRole}
                onChange={(e) => setNewVolRole(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded p-2 focus:outline-none"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <button
                onClick={handleAddVolunteer}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded transition"
              >
                Asignar
              </button>
            </div>
          </div>

          {/* Lista de Voluntarios Programados */}
          <div className="space-y-2 pt-2">
            {volunteers.map((vol) => (
              <div
                key={vol.id}
                className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-lg border border-slate-800"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200">{vol.name}</div>
                  <div className="text-[11px] text-indigo-400">{vol.role}</div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Confirmado
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};