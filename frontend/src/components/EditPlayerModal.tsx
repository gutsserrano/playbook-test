"use client";

import { useState, useEffect } from "react";
import { Player } from "@/lib/api";
import { PLAYER_POSITIONS, normalizePosition } from "@/lib/positions";
import { Modal } from "@/components/ui/Modal";

interface EditPlayerModalProps {
  player: Player;
  onClose: () => void;
  onSubmit: (data: { name: string; number?: number | null; position: string }) => void;
}

export function EditPlayerModal({ player, onClose, onSubmit }: EditPlayerModalProps) {
  const [name, setName] = useState(player.name);
  const [number, setNumber] = useState(player.number != null ? player.number.toString() : "");
  const [position, setPosition] = useState(normalizePosition(player.position));

  useEffect(() => {
    setName(player.name);
    setNumber(player.number != null ? player.number.toString() : "");
    setPosition(normalizePosition(player.position));
  }, [player.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const num = number.trim() ? parseInt(number, 10) : null;
    if (number.trim() && (isNaN(num!) || num! < 0 || num! > 99)) {
      alert("Number must be 0-99");
      return;
    }
    onSubmit({ name: name.trim(), number: num ?? undefined, position: position });
  };

  return (
    <Modal onClose={onClose}>
        <h3 className="text-xl font-semibold text-white mb-4">Edit player</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Player name"
              className="w-full px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-accent"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Number (optional)</label>
            <input
              type="number"
              min={0}
              max={99}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="0-99"
              className="w-full px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(normalizePosition(e.target.value))}
              className="w-full px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white focus:ring-2 focus:ring-accent"
            >
              {PLAYER_POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-turf-600 rounded-lg text-slate-300 hover:bg-turf-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-accent text-turf-950 font-medium rounded-lg hover:bg-accent-hover transition-colors"
            >
              Save
            </button>
          </div>
        </form>
    </Modal>
  );
}
