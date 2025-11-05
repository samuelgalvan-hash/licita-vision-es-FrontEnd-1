import { Building2, Calendar, Euro, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Licitacion } from "@/types/licitacion";

interface LicitacionCardProps {
  licitacion: Licitacion;
  onViewDetail: () => void;
}

export function LicitacionCard({ licitacion, onViewDetail }: LicitacionCardProps) {
  return (
    <Card className="p-5 hover:shadow-md transition-smooth cursor-pointer border-border hover:border-primary/30 group">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-foreground leading-tight group-hover:text-primary transition-smooth line-clamp-2">
            {licitacion.title}
          </h3>
          {licitacion.provincia && (
            <Badge variant="outline" className="shrink-0 text-xs">
              {licitacion.provincia}
            </Badge>
          )}
        </div>

        {licitacion.summary && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {licitacion.summary}
          </p>
        )}

        <div className="space-y-2">
          {licitacion.organo_contratacion && (
            <div className="flex items-start gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-muted-foreground line-clamp-1">
                {licitacion.organo_contratacion}
              </span>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm">
            {licitacion.importe && (
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <Euro className="h-4 w-4 text-primary" />
                <span>{licitacion.importe}</span>
              </div>
            )}

            {licitacion.fecha_publicacion && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{licitacion.fecha_publicacion}</span>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={onViewDetail}
          className="w-full mt-2 hover:bg-primary-hover transition-smooth"
          size="sm"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver detalle completo
        </Button>
      </div>
    </Card>
  );
}
