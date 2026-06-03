"use client";

import React, { ChangeEvent } from "react";

type Props = {
  value: number;
  onChange: (newSize: number) => void;
  label?: string;
};

export default function SizeSelector({ value, onChange, label = "Elementi per pagina:" }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="font-semibold text-zinc-650 dark:text-zinc-400">
        {label}
      </label>
      <select
        id="pageSize"
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>): void => onChange(Number(e.target.value))}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
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
