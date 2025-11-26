import { useState } from "react";
import { Filter, Search, Check, X, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { CPV } from "@/types/licitacion";

interface CPVFilterPanelProps {
  cpvs: CPV[];
  selected: string[];
  onChange: (cpvs: string[]) => void;
  onApplyFilter: () => void;
  onClearFilter: () => void;
  isLoading: boolean;
  isFiltering: boolean;
  totalLicitaciones: number;
  filteredCount?: number;
}

export function CPVFilterPanel({
  cpvs,
  selected,
  onChange,
  onApplyFilter,
  onClearFilter,
  isLoading,
  isFiltering,
  totalLicitaciones,
  filteredCount,
}: CPVFilterPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCPVs = cpvs.filter(
    (cpv) =>
      cpv.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cpv.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCPV = (code: string) => {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <div className="text-center">
            <p className="font-medium text-foreground">Obteniendo códigos CPV...</p>
            <p className="text-sm text-muted-foreground">
              Esto puede tardar unos segundos
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (cpvs.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Filter className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium text-foreground">No hay códigos CPV disponibles</p>
            <p className="text-sm text-muted-foreground">
              No se han encontrado códigos CPV para las licitaciones actuales
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Filtrar por CPV</h3>
        </div>
        <Badge variant="outline">
          {cpvs.length} CPV{cpvs.length !== 1 ? "s" : ""} disponible{cpvs.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar CPV por código o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected CPVs */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((code) => (
            <Badge
              key={code}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/10"
              onClick={() => toggleCPV(code)}
            >
              {code}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={onClearFilter}>
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* CPV List */}
      <ScrollArea className="h-64 border rounded-lg">
        <div className="p-2 space-y-1">
          {filteredCPVs.map((cpv) => {
            const isSelected = selected.includes(cpv.code);
            return (
              <Card
                key={cpv.code}
                onClick={() => toggleCPV(cpv.code)}
                className={cn(
                  "p-3 cursor-pointer transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleCPV(cpv.code)}
                    className="mt-0.5 pointer-events-none"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-primary">
                        {cpv.code}
                      </span>
                      {cpv.count && (
                        <Badge variant="outline" className="text-xs">
                          {cpv.count}
                        </Badge>
                      )}
                    </div>
                    {cpv.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {cpv.description}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Stats and apply button */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-muted-foreground">
          {selected.length > 0 ? (
            <>
              Mostrando{" "}
              <span className="font-medium text-foreground">
                {isFiltering ? "..." : filteredCount ?? totalLicitaciones}
              </span>{" "}
              de {totalLicitaciones} licitaciones
            </>
          ) : (
            <>Total: {totalLicitaciones} licitaciones</>
          )}
        </div>
        <Button
          onClick={onApplyFilter}
          disabled={selected.length === 0 || isFiltering}
        >
          {isFiltering ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Filtrando...
            </>
          ) : (
            <>
              <Filter className="h-4 w-4 mr-2" />
              Aplicar filtro
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
