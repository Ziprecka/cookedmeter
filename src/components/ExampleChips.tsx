import { exampleChips } from "@/lib/cooked-data";

export function ExampleChips({ onPick }: { onPick: (value: string) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {exampleChips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={() => onPick(chip.value)}
          className="rounded-full border border-white/9 bg-white/[.035] px-3 py-2 text-xs font-bold text-white/52 transition hover:border-orange-200/35 hover:text-white"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
