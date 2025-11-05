import { useState } from "react";
import { Check, MapPin, X } from "lucide-react";
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

const PROVINCIAS = [
  "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila",
  "Badajoz", "Baleares", "Barcelona", "Burgos", "Cáceres", "Cádiz",
  "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Coruña (A)",
  "Cuenca", "Girona", "Granada", "Guadalajara", "Guipúzcoa", "Huelva",
  "Huesca", "Jaén", "León", "Lleida", "Lugo", "Madrid", "Málaga",
  "Murcia", "Navarra", "Ourense", "Palencia", "Palmas (Las)", "Pontevedra",
  "Rioja (La)", "Salamanca", "Santa Cruz de Tenerife", "Segovia",
  "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia",
  "Valladolid", "Vizcaya", "Zamora", "Zaragoza"
];

interface ProvinciasFilterProps {
  selected: string[];
  onChange: (provincias: string[]) => void;
  disabled?: boolean;
}

export function ProvinciasFilter({ selected, onChange, disabled }: ProvinciasFilterProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (provincia: string) => {
    const newSelected = selected.includes(provincia)
      ? selected.filter(p => p !== provincia)
      : [...selected, provincia];
    onChange(newSelected);
  };

  const handleRemove = (provincia: string) => {
    onChange(selected.filter(p => p !== provincia));
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Provincias / Comunidades Autónomas
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
            disabled={disabled}
            className="w-full justify-start text-left font-normal h-auto min-h-[2.5rem] hover:bg-muted transition-smooth"
          >
            {selected.length === 0 ? (
              <span className="text-muted-foreground">Selecciona provincias...</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selected.slice(0, 3).map(provincia => (
                  <Badge key={provincia} variant="secondary" className="text-xs">
                    {provincia}
                  </Badge>
                ))}
                {selected.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selected.length - 3} más
                  </Badge>
                )}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 pointer-events-auto" align="start">
          <Command>
            <CommandInput placeholder="Buscar provincia..." />
            <CommandList>
              <CommandEmpty>No se encontró la provincia.</CommandEmpty>
              <CommandGroup>
                {PROVINCIAS.map((provincia) => (
                  <CommandItem
                    key={provincia}
                    value={provincia}
                    onSelect={() => handleSelect(provincia)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(provincia) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {provincia}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selected.map(provincia => (
            <Badge
              key={provincia}
              variant="secondary"
              className="pl-2 pr-1 gap-1 hover:bg-secondary/80 transition-smooth"
            >
              {provincia}
              <button
                onClick={() => handleRemove(provincia)}
                className="ml-1 hover:text-destructive transition-smooth"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
