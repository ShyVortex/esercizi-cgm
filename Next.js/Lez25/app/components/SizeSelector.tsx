"use client";

import React, { ChangeEvent } from "react";

type Props = {
  value: number;
  onChange: (newSize: number) => void;
  label?: string;
};

export default function SizeSelector({ value, onChange, label = "Elementi per pagina:" }: Props) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <label className="font-bold text-zinc-550 dark:text-zinc-400">
        {label}
      </label>
      <select
        id="pageSize"
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>): void => onChange(Number(e.target.value))}
        className="rounded-full border border-md-outline-variant/35 bg-background px-4 py-1.5 text-xs font-bold text-md-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-md-primary"
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
        <option value="25">25</option>
      </select>
    </div>
  );
}
