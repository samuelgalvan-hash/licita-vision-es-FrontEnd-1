import {
  ArrowLeft,
  Building2,
  Euro,
  FileText,
  Download,
  ExternalLink,
  Tag,
  Rss,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LicitacionDetalle } from "@/types/licitacion";

interface LicitacionDetailViewProps {
  licitacion: LicitacionDetalle;
  onBack: () => void;
}

export function LicitacionDetailView({
  licitacion,
  onBack,
}: LicitacionDetailViewProps) {
  const cpvArray = Array.isArray(licitacion.cpv)
    ? licitacion.cpv
    : licitacion.cpv
    ? [licitacion.cpv]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a licitaciones
        </Button>
        <h2 className="text-2xl font-bold text-foreground leading-tight">
          {licitacion.title}
        </h2>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-6 pr-4">
          {/* Info general */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Información general
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {licitacion.entidad && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Entidad contratante</p>
                    <p className="font-medium">{licitacion.entidad}</p>
                  </div>
                </div>
              )}

              {licitacion.importe && (
                <div className="flex items-start gap-3">
                  <Euro className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Importe</p>
                    <p className="font-medium text-lg">{licitacion.importe}</p>
                  </div>
                </div>
              )}

              {licitacion.valor_estimado && (
                <div className="flex items-start gap-3">
                  <Euro className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Valor estimado</p>
                    <p className="font-medium">{licitacion.valor_estimado}</p>
                  </div>
                </div>
              )}

              {licitacion.estado && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estado</p>
                  <Badge variant="secondary">{licitacion.estado}</Badge>
                </div>
              )}

              {licitacion.feed_origen && (
                <div className="flex items-start gap-3">
                  <Rss className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">Feed origen</p>
                    <p className="font-mono text-xs break-all">{licitacion.feed_origen}</p>
                  </div>
                </div>
              )}

              {licitacion.url && (
                <div className="flex items-start gap-3">
                  <LinkIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">URL completa</p>
                    <a
                      href={licitacion.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono text-xs break-all"
                    >
                      {licitacion.url}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Descripción */}
          {licitacion.descripcion && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {licitacion.descripcion}
                </p>
              </CardContent>
            </Card>
          )}

          {/* CPVs */}
          {cpvArray.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Códigos CPV
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {cpvArray.map((cpv, index) => (
                    <Badge key={index} variant="outline" className="font-mono">
                      {cpv}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pliegos */}
          {licitacion.pliegos_xml && licitacion.pliegos_xml.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  Pliegos disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {licitacion.pliegos_xml.map((pliego, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-card rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{pliego.tipo || pliego.nombre || `Documento ${index + 1}`}</p>
                          <p className="text-xs text-muted-foreground font-mono truncate max-w-md">
                            {pliego.url}
                          </p>
                        </div>
                      </div>
                      <a
                        href={pliego.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Button size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Descargar PDF
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Link externo */}
          {licitacion.url && (
            <div className="flex justify-center pt-4">
              <a
                href={licitacion.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="lg" className="gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Ver en plataforma oficial
                </Button>
              </a>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
