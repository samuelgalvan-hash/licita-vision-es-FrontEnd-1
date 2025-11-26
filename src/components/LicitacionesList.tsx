import { FileText, Building2, Euro, Calendar, Eye, Tag, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Licitacion } from "@/types/licitacion";

interface LicitacionesListProps {
  licitaciones: Licitacion[];
  count: number;
  onViewDetail: (licitacion: Licitacion) => void;
  onBack: () => void;
  isLoadingDetail: boolean;
  loadingDetailId?: string;
}

export function LicitacionesList({
  licitaciones,
  count,
  onViewDetail,
  onBack,
  isLoadingDetail,
  loadingDetailId,
}: LicitacionesListProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a comunidades
          </Button>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Licitaciones encontradas
          </h2>
          <p className="text-muted-foreground">
            Se han encontrado <span className="font-semibold text-primary">{count}</span> licitaciones
          </p>
        </div>
      </div>

      {/* List */}
      <ScrollArea className="h-[calc(100vh-350px)]">
        <div className="grid gap-4 pr-4">
          {licitaciones.map((licitacion, index) => {
            const id = licitacion.id || `licitacion-${index}`;
            const isLoading = isLoadingDetail && loadingDetailId === id;

            return (
              <Card
                key={id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {licitacion.title}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetail(licitacion)}
                      disabled={isLoadingDetail}
                      className="shrink-0"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver detalles
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {licitacion.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {licitacion.summary}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {licitacion.provincia && (
                      <Badge variant="secondary">
                        {licitacion.provincia}
                      </Badge>
                    )}
                    {licitacion.cpv_guess && (
                      <Badge variant="outline" className="gap-1">
                        <Tag className="h-3 w-3" />
                        CPV: {licitacion.cpv_guess}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    {licitacion.organo_contratacion && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4 shrink-0" />
                        <span className="truncate">{licitacion.organo_contratacion}</span>
                      </div>
                    )}
                    {licitacion.importe && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Euro className="h-4 w-4 shrink-0" />
                        <span>{licitacion.importe}</span>
                      </div>
                    )}
                    {licitacion.fecha_publicacion && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>{licitacion.fecha_publicacion}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
