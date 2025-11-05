import { useState } from "react";
import { Check, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CPV } from "@/types/licitacion";

interface CPVFilterProps {
  cpvs: CPV[];
  selected: string[];
  onChange: (cpvs: string[]) => void;
  disabled?: boolean;
}

export function CPVFilter({ cpvs, selected, onChange, disabled }: CPVFilterProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (code: string) => {
    const newSelected = selected.includes(code)
      ? selected.filter(c => c !== code)
      : [...selected, code];
    onChange(newSelected);
  };

  const handleRemove = (code: string) => {
    onChange(selected.filter(c => c !== code));
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent" />
          Filtrar por códigos CPV
        </label>
        {selected.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8 px-2 text-xs"
          >
            Limpiar
          </Button>
        )}
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || cpvs.length === 0}
            className="w-full justify-start text-left font-normal h-auto min-h-[2.5rem] hover:bg-muted transition-smooth"
          >
            {selected.length === 0 ? (
              <span className="text-muted-foreground">
                {cpvs.length === 0 ? "No hay CPVs disponibles" : "Selecciona CPVs..."}
              </span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selected.slice(0, 2).map(code => (
                  <Badge key={code} variant="secondary" className="text-xs font-mono">
                    {code}
                  </Badge>
                ))}
                {selected.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selected.length - 2} más
                  </Badge>
                )}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0 pointer-events-auto" align="start">
          <Command>
            <CommandInput placeholder="Buscar código CPV..." />
            <CommandList>
              <CommandEmpty>No se encontró el CPV.</CommandEmpty>
              <CommandGroup>
                {cpvs.map((cpv) => (
                  <CommandItem
                    key={cpv.code}
                    value={`${cpv.code} ${cpv.description || ""}`}
                    onSelect={() => handleSelect(cpv.code)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(cpv.code) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-mono text-sm">{cpv.code}</div>
                      {cpv.description && (
                        <div className="text-xs text-muted-foreground">{cpv.description}</div>
                      )}
                    </div>
                    {cpv.count && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {cpv.count}
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selected.map(code => {
            const cpv = cpvs.find(c => c.code === code);
            return (
              <Badge
                key={code}
                variant="secondary"
                className="pl-2 pr-1 gap-1 hover:bg-secondary/80 transition-smooth font-mono"
              >
                {code}
                {cpv?.count && (
                  <span className="text-xs text-muted-foreground">({cpv.count})</span>
                )}
                <button
                  onClick={() => handleRemove(code)}
                  className="ml-1 hover:text-destructive transition-smooth"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
