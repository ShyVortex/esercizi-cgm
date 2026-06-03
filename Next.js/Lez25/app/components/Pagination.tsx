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

  const getButtonClasses = (isDisabled: boolean, isActiveButton: boolean = false) => {
    const baseClasses =
      "px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 shadow-sm border ";
    if (isDisabled) {
      return (
        baseClasses +
        "opacity-35 cursor-not-allowed bg-md-surface-container/40 border-md-outline-variant/20 text-zinc-400 dark:text-zinc-650"
      );
    }
    if (isActiveButton) {
      return (
        baseClasses +
        "bg-md-primary border-md-primary text-white"
      );
    }
    return (
      baseClasses +
      "border-md-outline-variant/30 bg-background text-md-primary hover:bg-md-primary-container hover:text-md-on-primary-container"
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-6 justify-center align-center">
      <button
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        className={getButtonClasses(currentPage === 1, true)}
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

      <div className="flex items-center gap-2 px-3 py-1 bg-md-surface-container/30 border border-md-outline-variant/25 rounded-full text-xs font-semibold">
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="w-12 text-center border-b border-md-primary bg-transparent py-0.5 text-md-foreground font-bold focus:outline-none focus:border-b-2"
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
