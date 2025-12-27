import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSound } from "@/contexts/SoundContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SoundToggle() {
  const { enabled, toggle, play } = useSound();

  const handleToggle = () => {
    const newState = toggle();
    // Play a click sound if enabling
    if (newState) {
      play("click");
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="h-9 w-9"
          aria-label={enabled ? "Mute sounds" : "Enable sounds"}
        >
          {enabled ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {enabled ? "Sound on (click to mute)" : "Sound off (click to enable)"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
