import React from 'react';

export default function PlaylistTab() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Playlist active</h2>
      <p className="text-xs text-gray-400">Les morceaux validés par les votes s'affichent ici en direct.</p>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-gray-400 text-sm">
        🎵 Aucun morceau en cours de lecture. Le lecteur de l'hôte démarrera bientôt.
      </div>
    </div>
  );
}