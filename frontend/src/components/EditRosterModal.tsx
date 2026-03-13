"use client";

import { useState } from "react";
import { Roster } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";

interface EditRosterModalProps {
  roster: Roster;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
}

export function EditRosterModal({ roster, onClose, onSubmit }: EditRosterModalProps) {
  const [name, setName] = useState(roster.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim() });
  };

  return (
    <Modal onClose={onClose}>
        <h3 className="text-xl font-semibold text-white mb-4">Edit roster</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Roster name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Varsity, JV, Game 1"
              className="w-full px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-accent"
              required
              autoFocus
            />
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
