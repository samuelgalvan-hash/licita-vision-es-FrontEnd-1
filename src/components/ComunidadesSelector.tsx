import { useState } from "react";
import { MapPin, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { COMUNIDADES_AUTONOMAS } from "@/types/licitacion";

interface ComunidadesSelectorProps {
  selected: string[];
  onChange: (comunidades: string[]) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export function ComunidadesSelector({
  selected,
  onChange,
  onSearch,
  isLoading,
}: ComunidadesSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredComunidades = COMUNIDADES_AUTONOMAS.filter((comunidad) =>
    comunidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleComunidad = (comunidad: string) => {
    if (selected.includes(comunidad)) {
      onChange(selected.filter((c) => c !== comunidad));
    } else {
      onChange([...selected, comunidad]);
    }
  };

  const selectAll = () => {
    onChange([...COMUNIDADES_AUTONOMAS]);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Selecciona Comunidades Autónomas
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Elige una o varias comunidades para buscar licitaciones públicas disponibles
        </p>
      </div>

      {/* Search and actions */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar comunidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Seleccionar todas
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll}>
            Limpiar
          </Button>
        </div>
      </div>

      {/* Selected count */}
      {selected.length > 0 && (
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-sm">
            {selected.length} comunidad{selected.length !== 1 ? "es" : ""} seleccionada{selected.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      )}

      {/* Grid of comunidades */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
        {filteredComunidades.map((comunidad) => {
          const isSelected = selected.includes(comunidad);
          return (
            <Card
              key={comunidad}
              onClick={() => toggleComunidad(comunidad)}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleComunidad(comunidad)}
                  className="pointer-events-none"
                />
                <span
                  className={cn(
                    "font-medium",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {comunidad}
                </span>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary ml-auto" />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Search button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={onSearch}
          disabled={selected.length === 0 || isLoading}
          className="px-8"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Buscando...
            </>
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Buscar licitaciones
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
