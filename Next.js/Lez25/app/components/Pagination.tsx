"use client";

import React, { useState } from "react";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  const [prevPage, setPrevPage] = useState<number>(currentPage);
  const [inputValue, setInputValue] = useState<string>(currentPage.toString());

  if (currentPage !== prevPage) {
    setPrevPage(currentPage);
    setInputValue(currentPage.toString());
  }

  const goToPage = (page: number) => {
    let targetPage = page;
    if (targetPage < 1) targetPage = 1;
    if (targetPage > totalPages) targetPage = totalPages;

    if (targetPage !== currentPage) {
      onPageChange(targetPage);
    } else {
      setInputValue(currentPage.toString());
    }
  };

  const handleInputBlur = () => {
    const val = parseInt(inputValue, 10);
    if (!isNaN(val)) {
      goToPage(val);
    } else {
      setInputValue(currentPage.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleInputBlur();
  };

  const getButtonClasses = (isDisabled: boolean) => {
    const baseClasses =
      "px-3 py-1.5 border rounded-lg text-sm font-semibold transition-colors shadow-sm ";
    if (isDisabled) {
      return (
        baseClasses +
        "opacity-40 cursor-not-allowed bg-zinc-100 border-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-650"
      );
    }
    return (
      baseClasses +
      "border-zinc-200 bg-white text-indigo-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-indigo-400 dark:hover:bg-zinc-900"
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-6 justify-center align-center">
      <button
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        className={getButtonClasses(currentPage === 1)}
      >
        1
      </button>

      <button
        onClick={() => goToPage(currentPage - 10)}
        disabled={currentPage <= 10}
        className={getButtonClasses(currentPage <= 10)}
      >
        -10
      </button>

      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={getButtonClasses(currentPage === 1)}
      >
        Prev
      </button>

      <div className="flex items-center gap-2 px-2 text-sm">
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="w-16 text-center border border-zinc-200 rounded-lg py-1.5 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <span className="text-zinc-500 dark:text-zinc-400">di {totalPages}</span>
      </div>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={getButtonClasses(currentPage === totalPages)}
      >
        Next
      </button>

      <button
        onClick={() => goToPage(currentPage + 10)}
        disabled={currentPage > totalPages - 10}
        className={getButtonClasses(currentPage > totalPages - 10)}
      >
        +10
      </button>

      <button
        onClick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        className={getButtonClasses(currentPage === totalPages)}
      >
        {totalPages}
      </button>
    </div>
  );
}
