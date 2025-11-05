import { Download, FileText, Building2, Euro, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LicitacionDetalle } from "@/types/licitacion";

interface LicitacionDetailProps {
  licitacion: LicitacionDetalle | null;
  open: boolean;
  onClose: () => void;
}

export function LicitacionDetail({ licitacion, open, onClose }: LicitacionDetailProps) {
  if (!licitacion) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-2xl leading-tight pr-8">
              {licitacion.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0 -mr-2 -mt-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="px-6 pb-6 max-h-[calc(85vh-8rem)]">
          <div className="space-y-6">
            {/* Información general */}
            <div className="space-y-3">
              {licitacion.organo_contratacion && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Órgano de contratación
                    </div>
                    <div className="text-sm text-foreground">
                      {licitacion.organo_contratacion}
                    </div>
                  </div>
                </div>
              )}

              {licitacion.importe && (
                <div className="flex items-start gap-3">
                  <Euro className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Importe estimado
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {licitacion.importe}
                    </div>
                  </div>
                </div>
              )}

              {licitacion.fecha_publicacion && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Fecha de publicación
                    </div>
                    <div className="text-sm text-foreground">
                      {licitacion.fecha_publicacion}
                    </div>
                  </div>
                </div>
              )}

              {licitacion.plazo_presentacion && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Plazo de presentación
                    </div>
                    <div className="text-sm text-foreground font-medium">
                      {licitacion.plazo_presentacion}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Descripción */}
            {licitacion.descripcion && (
              <>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Descripción</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {licitacion.descripcion}
                  </p>
                </div>
                <Separator />
              </>
            )}

            {/* Códigos CPV */}
            {licitacion.cpv && licitacion.cpv.length > 0 && (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-accent" />
                    <h4 className="text-sm font-semibold text-foreground">
                      Códigos CPV ({licitacion.cpv.length})
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {licitacion.cpv.map((code, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="font-mono text-xs px-2.5 py-1"
                      >
                        {code}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Pliegos descargables */}
            {licitacion.pliegos && licitacion.pliegos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Download className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Documentos descargables ({licitacion.pliegos.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {licitacion.pliegos.map((pliego, index) => (
                    <a
                      key={index}
                      href={pliego.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-smooth group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground group-hover:text-primary transition-smooth">
                            {pliego.nombre}
                          </div>
                          {pliego.tipo && (
                            <div className="text-xs text-muted-foreground">
                              {pliego.tipo}
                            </div>
                          )}
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-smooth" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Enlace original */}
            <div className="pt-2">
              <Button
                variant="outline"
                asChild
                className="w-full hover:bg-muted transition-smooth"
              >
                <a
                  href={licitacion.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver en plataforma oficial
                </a>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
