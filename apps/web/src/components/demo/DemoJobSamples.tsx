import { Button } from "../ui/Button";
import {
  SAMPLE_JD_CLEAN,
  SAMPLE_JD_EDGE,
  SAMPLE_JD_MESSY,
} from "../../data/sampleJobDescriptions";

export function DemoJobSamples({
  onPick,
}: {
  onPick: (text: string) => void;
}) {
  return (
    <div className="border-t border-slate-100 pt-8">
      <p className="text-xs font-medium text-slate-500">
        Try with sample job descriptions
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="secondary"
          className="text-xs font-normal"
          onClick={() => onPick(SAMPLE_JD_CLEAN)}
        >
          Clean JD
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="text-xs font-normal"
          onClick={() => onPick(SAMPLE_JD_MESSY)}
        >
          Messy JD
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="text-xs font-normal"
          onClick={() => onPick(SAMPLE_JD_EDGE)}
        >
          Edge-case JD
        </Button>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-slate-400">
        Opens a new application with the sample text in the paste field — use{" "}
        <span className="font-medium text-slate-500">Parse</span> to try AI.
      </p>
    </div>
  );
}
