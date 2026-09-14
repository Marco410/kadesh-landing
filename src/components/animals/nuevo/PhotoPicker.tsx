"use client";

import { useRef, useState, type DragEvent, type PointerEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  DragDropVerticalIcon,
  Image01Icon,
} from "@hugeicons/core-free-icons";

export interface PhotoPreview {
  preview: string;
}

interface PhotoPickerProps {
  images: PhotoPreview[];
  max: number;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  onReorder: (from: number, to: number) => void;
}

const PHOTO_DRAG = "text/kadesh-photo";

function hasFiles(event: DragEvent) {
  return Array.from(event.dataTransfer.types).includes("Files");
}

function reorderIndexFromPoint(
  clientX: number,
  clientY: number,
): number | null {
  const hit = document.elementFromPoint(clientX, clientY);
  const thumb = hit?.closest("[data-photo-index]");
  if (!thumb) return null;
  const value = Number((thumb as HTMLElement).dataset.photoIndex);
  return Number.isInteger(value) ? value : null;
}

export default function PhotoPicker({
  images,
  max,
  onAdd,
  onRemove,
  onReorder,
}: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pointerFrom = useRef<number | null>(null);
  const [isFileDrag, setIsFileDrag] = useState(false);
  const [reorderFrom, setReorderFrom] = useState<number | null>(null);
  const [reorderOver, setReorderOver] = useState<number | null>(null);
  const remaining = max - images.length;
  const isFull = remaining <= 0;

  const openPicker = () => {
    if (isFull) return;
    inputRef.current?.click();
  };

  const handleFileDragEnter = (event: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    setIsFileDrag(true);
  };

  const handleFileDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (hasFiles(event)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = isFull ? "none" : "copy";
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleFileDragLeave = (event: DragEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && event.currentTarget.contains(next)) return;
    setIsFileDrag(false);
  };

  const handleFileDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsFileDrag(false);

    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length) {
      if (!isFull) onAdd(droppedFiles);
      return;
    }

    const fromRaw =
      event.dataTransfer.getData(PHOTO_DRAG) ||
      event.dataTransfer.getData("text/plain");
    if (fromRaw !== "") {
      const from = Number(fromRaw);
      const to = reorderIndexFromPoint(event.clientX, event.clientY);
      if (Number.isInteger(from) && to != null && from !== to) {
        onReorder(from, to);
      }
      setReorderFrom(null);
      setReorderOver(null);
    }
  };

  const handleThumbDragStart = (
    event: DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    event.dataTransfer.setData(PHOTO_DRAG, String(index));
    event.dataTransfer.setData("text/plain", String(index));
    event.dataTransfer.effectAllowed = "move";
    setReorderFrom(index);
    setReorderOver(index);
    setIsFileDrag(false);
  };

  const handleThumbDragOver = (
    event: DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (hasFiles(event)) {
      event.dataTransfer.dropEffect = isFull ? "none" : "copy";
      return;
    }
    event.dataTransfer.dropEffect = "move";
    setReorderOver(index);
  };

  const handleThumbDrop = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    if (hasFiles(event) && event.dataTransfer.files.length) {
      setIsFileDrag(false);
      if (!isFull) onAdd(Array.from(event.dataTransfer.files));
      return;
    }
    const fromRaw =
      event.dataTransfer.getData(PHOTO_DRAG) ||
      event.dataTransfer.getData("text/plain");
    const from = Number(fromRaw);
    if (Number.isInteger(from) && from !== index) onReorder(from, index);
    setReorderFrom(null);
    setReorderOver(null);
  };

  const handleThumbPointerDown = (
    event: PointerEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (event.pointerType === "mouse") return;
    pointerFrom.current = index;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleThumbPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    if (pointerFrom.current == null) return;
    const to = reorderIndexFromPoint(event.clientX, event.clientY);
    if (to == null) return;
    setReorderFrom(pointerFrom.current);
    setReorderOver(to);
  };

  const finishPointerReorder = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    const from = pointerFrom.current;
    pointerFrom.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (from == null) {
      setReorderFrom(null);
      setReorderOver(null);
      return;
    }
    const to =
      reorderOver ?? reorderIndexFromPoint(event.clientX, event.clientY);
    if (to != null && from !== to) onReorder(from, to);
    setReorderFrom(null);
    setReorderOver(null);
  };

  const dropClass = isFileDrag
    ? isFull
      ? "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-950/30"
      : "border-kadesh bg-kadesh-50 dark:bg-kadesh/20"
    : "border-[#d8dee8] bg-white hover:border-kadesh hover:bg-kadesh-50 dark:border-white/18 dark:bg-night-raised dark:hover:bg-kadesh/15";

  return (
    <div
      onDragEnter={handleFileDragEnter}
      onDragOver={handleFileDragOver}
      onDragLeave={handleFileDragLeave}
      onDrop={handleFileDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          if (event.target.files?.length) onAdd(Array.from(event.target.files));
          event.target.value = "";
        }}
      />

      {images.length === 0 ? (
        <button
          type="button"
          onClick={openPicker}
          className={`flex min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${dropClass}`}
        >
          <HugeiconsIcon
            icon={Image01Icon}
            size={28}
            className="text-[#5a5a5a] dark:text-[#9aa3b2]"
            strokeWidth={1.5}
          />
          <span className="text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
            {isFileDrag
              ? "Suelta las fotos aquí"
              : "Arrastra fotos o elige varias"}
          </span>
          <span className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            PNG o JPG, hasta {max} · 5 MB cada una
          </span>
        </button>
      ) : (
        <div
          className={`relative grid grid-cols-3 gap-2 rounded-xl p-1 ${
            isFileDrag ? `border border-dashed ${dropClass}` : ""
          }`}
        >
          {images.map((image, index) => {
            const isCover = index === 0;
            const isSource = reorderFrom === index;
            const isTarget =
              reorderOver === index &&
              reorderFrom != null &&
              reorderFrom !== index;
            return (
              <div
                key={image.preview}
                data-photo-index={index}
                draggable
                onDragStart={(event) => handleThumbDragStart(event, index)}
                onDragOver={(event) => handleThumbDragOver(event, index)}
                onDrop={(event) => handleThumbDrop(event, index)}
                onDragEnd={() => {
                  setReorderFrom(null);
                  setReorderOver(null);
                }}
                onPointerDown={(event) => handleThumbPointerDown(event, index)}
                onPointerMove={handleThumbPointerMove}
                onPointerUp={finishPointerReorder}
                onPointerCancel={finishPointerReorder}
                className={`relative aspect-square cursor-grab touch-none overflow-hidden rounded-xl active:cursor-grabbing ${
                  isSource ? "opacity-60" : ""
                } ${isTarget ? "ring-2 ring-kadesh ring-offset-2 ring-offset-[#f7f8fa] dark:ring-offset-night" : ""}`}
                aria-label={
                  images.length > 1
                    ? isCover
                      ? "Portada. Arrastra para cambiar el orden"
                      : `Foto ${index + 1}. Arrastra para cambiar el orden`
                    : isCover
                      ? "Portada"
                      : `Foto ${index + 1}`
                }
              >
                <img
                  src={image.preview}
                  alt=""
                  className="pointer-events-none h-full w-full object-cover"
                />
                <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-full bg-[#121212]/75 px-2 py-0.5 text-[11px] font-bold text-white">
                  {isCover ? "Portada" : index + 1}
                </span>
                {images.length > 1 && (
                  <span
                    className="pointer-events-none absolute bottom-2 left-1/2 inline-flex h-8 min-w-8 -translate-x-1/2 items-center justify-center rounded-lg bg-white text-[#121212] shadow-[0_6px_16px_rgba(15,35,80,0.32)]"
                    aria-hidden
                  >
                    <HugeiconsIcon
                      icon={DragDropVerticalIcon}
                      size={20}
                      strokeWidth={2}
                    />
                  </span>
                )}
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => onRemove(index)}
                  className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#121212]/70 text-white hover:bg-[#121212]/85"
                  aria-label={`Quitar foto ${index + 1}`}
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    size={14}
                    strokeWidth={1.5}
                  />
                </button>
              </div>
            );
          })}
          {!isFull && (
            <button
              type="button"
              onClick={openPicker}
              className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#d8dee8] bg-[#f7f8fa] text-[#5a5a5a] transition-colors hover:border-kadesh hover:bg-kadesh-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:border-white/18 dark:bg-night dark:text-[#9aa3b2] dark:hover:bg-kadesh/15"
            >
              <HugeiconsIcon icon={Image01Icon} size={22} strokeWidth={1.5} />
              <span className="text-xs font-semibold">Agregar</span>
            </button>
          )}
          {isFileDrag && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-[#f7f8fa]/80 text-sm font-semibold text-[#121212] dark:bg-night/80 dark:text-[#eef1f6]">
              {isFull ? `Ya tienes ${max} fotos` : "Suelta para agregar"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
