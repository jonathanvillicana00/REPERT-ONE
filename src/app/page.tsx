'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChordViewer } from '@/components/ChordViewer';
import { ServicePlanner } from '@/components/ServicePlanner';
import { OnStageLive } from '@/components/OnStageLive';
import { Music, Calendar, Radio, X, LogOut } from 'lucide-react';

const SAMPLE_CHORDPRO = `[C]Luz del mundo que bajaste a la [G]oscuridad
[Am]Mis ojos a[F]briste
[C]Hermoso e[G]res Se[Am]ñor [F]

[F]Y te a[C]doraré, te exal[G]taré [Am]
[F]Rindo mi co[C]razón a [G]ti`;

const MOCK_SETLIST = [
  {
    id: '1',
    title: 'Luz del Mundo',
    key: 'C',
    content: SAMPLE_CHORDPRO
  },
  {
    id: '2',
    title: 'Cuerdas de Amor',
    key: 'G',
    content: `[G]Hay una cuerda que no se [C]rompe
[Em]Tu amor que me sostiene [D]firme`
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'planner' | 'editor' | 'live'>('planner');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Verificar la sesión de Supabase
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Si no hay usuario logueado, redirige a /login
        router.push('/login');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  // Función para Cerrar Sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="animate-pulse font-medium text-slate-400">Cargando OnStage...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 py-8 px-4">
      {/* Si está activo el modo Live, mostramos el modal a pantalla completa */}
      {activeTab === 'live' && (
        <div>
          <button
            onClick={() => setActiveTab('planner')}
            className="fixed top-3 right-4 z-[60] bg-red-600 hover:bg-red-500 text-white font-bold p-2 rounded-full shadow-2xl transition"
            title="Salir del modo escenario"
          >
            <X className="w-5 h-5" />
          </button>
          <OnStageLive songs={MOCK_SETLIST} />
        </div>
      )}

      {/* Navegación Superior */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
            OnStage Live
          </h1>
          <p className="text-xs text-slate-400">
            Bienvenido, <span className="text-indigo-400 font-semibold">{user?.email}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'planner'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" /> Planificador
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'editor'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" /> Visor & Transpositor
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
            >
              <Radio className="w-4 h-4" /> Modo Escenario
            </button>
          </div>

          {/* Botón de Cerrar Sesión */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-red-600/80 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition border border-slate-700"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </div>

      {/* Renderizado Dinámico */}
      {activeTab === 'planner' && <ServicePlanner />}
      {activeTab === 'editor' && <ChordViewer initialContent={SAMPLE_CHORDPRO} originalKey="C" />}
    </main>
  );
}