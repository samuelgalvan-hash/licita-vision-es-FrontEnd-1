import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileSearch, Loader2, AlertCircle } from "lucide-react";
import { ProvinciasFilter } from "@/components/ProvinciasFilter";
import { CPVFilter } from "@/components/CPVFilter";
import { LicitacionCard } from "@/components/LicitacionCard";
import { LicitacionDetail } from "@/components/LicitacionDetail";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import type { ApiResponse, Licitacion, LicitacionDetalle, CPV } from "@/types/licitacion";

const API_BASE_URL = "https://licitaciones-7q8a.onrender.com";

const Index = () => {
  const [provinciasSeleccionadas, setProvinciasSeleccionadas] = useState<string[]>([]);
  const [cpvsSeleccionados, setCpvsSeleccionados] = useState<string[]>([]);
  const [licitacionSeleccionada, setLicitacionSeleccionada] = useState<LicitacionDetalle | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Query para obtener licitaciones por provincias
  const { data: licitaciones, isLoading: loadingLicitaciones, error: errorLicitaciones } = useQuery<ApiResponse<Licitacion>>({
    queryKey: ['licitaciones', provinciasSeleccionadas],
    queryFn: async () => {
      if (provinciasSeleccionadas.length === 0) return { results: [], count: 0 };
      
      const params = new URLSearchParams();
      provinciasSeleccionadas.forEach(p => params.append('comunidades', p));
      params.append('limit', '50');
      
      const response = await fetch(`${API_BASE_URL}/licitaciones_es?${params}`);
      if (!response.ok) throw new Error('Error al obtener licitaciones');
      return response.json();
    },
    enabled: provinciasSeleccionadas.length > 0,
  });

  // Query para obtener CPVs automáticamente
  const { data: cpvsData, isLoading: loadingCPVs } = useQuery<ApiResponse<CPV>>({
    queryKey: ['cpvs', provinciasSeleccionadas],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/cpv_licitaciones`);
      if (!response.ok) throw new Error('Error al obtener CPVs');
      return response.json();
    },
    enabled: provinciasSeleccionadas.length > 0 && !!licitaciones,
  });

  // Query para filtrar por CPVs
  const { data: licitacionesFiltradas, isLoading: loadingFiltradas, error: errorFiltradas } = useQuery<ApiResponse<Licitacion>>({
    queryKey: ['licitaciones-filtradas', cpvsSeleccionados],
    queryFn: async () => {
      if (cpvsSeleccionados.length === 0) return licitaciones!;
      
      const params = new URLSearchParams();
      cpvsSeleccionados.forEach(cpv => params.append('cpvs', cpv));
      
      const response = await fetch(`${API_BASE_URL}/filtrar_cpvs?${params}`);
      if (!response.ok) throw new Error('Error al filtrar por CPVs');
      return response.json();
    },
    enabled: cpvsSeleccionados.length > 0 && !!licitaciones,
  });

  // Obtener detalle de licitación
  const fetchDetalle = async (url: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/detalle_licitacion?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Error al obtener detalle');
      const data = await response.json();
      setLicitacionSeleccionada(data);
      setShowDetail(true);
    } catch (error) {
      toast.error('No se pudo cargar el detalle de la licitación');
      console.error(error);
    }
  };

  // Resetear CPVs cuando cambian las provincias
  useEffect(() => {
    setCpvsSeleccionados([]);
  }, [provinciasSeleccionadas]);

  // Determinar qué licitaciones mostrar
  const licitacionesAMostrar = cpvsSeleccionados.length > 0 
    ? licitacionesFiltradas 
    : licitaciones;

  const isLoading = loadingLicitaciones || loadingCPVs || loadingFiltradas;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileSearch className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Explorador de Licitaciones Públicas
              </h1>
              <p className="text-sm text-muted-foreground">
                Plataforma de Contratación del Estado - España
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Filtros */}
          <aside className="lg:col-span-1 space-y-6">
            <Card className="p-5 shadow-md">
              <h2 className="text-lg font-semibold text-foreground mb-4">Filtros de búsqueda</h2>
              
              <div className="space-y-6">
                {/* Filtro de provincias */}
                <ProvinciasFilter
                  selected={provinciasSeleccionadas}
                  onChange={setProvinciasSeleccionadas}
                />

                {/* Filtro de CPVs */}
                {provinciasSeleccionadas.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <CPVFilter
                      cpvs={cpvsData?.results || []}
                      selected={cpvsSeleccionados}
                      onChange={setCpvsSeleccionados}
                      disabled={loadingCPVs}
                    />
                    
                    {loadingCPVs && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Obteniendo códigos CPV...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Estadísticas */}
            {licitacionesAMostrar && licitacionesAMostrar.count > 0 && (
              <Card className="p-5 bg-primary/5 border-primary/20">
                <div className="space-y-3">
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {licitacionesAMostrar.count}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Licitaciones encontradas
                    </div>
                  </div>
                  
                  {cpvsData && cpvsData.count > 0 && (
                    <div className="pt-3 border-t border-primary/20">
                      <div className="text-xl font-semibold text-foreground">
                        {cpvsData.count}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Códigos CPV disponibles
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </aside>

          {/* Main content - Licitaciones */}
          <main className="lg:col-span-2">
            {/* Estado: Sin provincias seleccionadas */}
            {provinciasSeleccionadas.length === 0 && (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-muted rounded-full">
                    <FileSearch className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Comienza tu búsqueda
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      Selecciona una o varias provincias o comunidades autónomas en el panel
                      de filtros para comenzar a explorar licitaciones públicas.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Estado: Cargando */}
            {isLoading && provinciasSeleccionadas.length > 0 && (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Cargando licitaciones...
                    </h3>
                    <p className="text-muted-foreground">
                      Esto puede tardar unos momentos
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Estado: Error */}
            {(errorLicitaciones || errorFiltradas) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ha ocurrido un error al cargar las licitaciones. Por favor, verifica que
                  el backend esté corriendo en {API_BASE_URL}.
                </AlertDescription>
              </Alert>
            )}

            {/* Estado: Sin resultados */}
            {!isLoading && licitacionesAMostrar && licitacionesAMostrar.count === 0 && provinciasSeleccionadas.length > 0 && (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-muted rounded-full">
                    <AlertCircle className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No se encontraron licitaciones
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      No hay licitaciones disponibles para los filtros seleccionados.
                      Intenta cambiar las provincias o los códigos CPV.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Lista de licitaciones */}
            {!isLoading && licitacionesAMostrar && licitacionesAMostrar.count > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Resultados
                  </h2>
                  {cpvsSeleccionados.length > 0 && (
                    <Badge variant="secondary">
                      Filtrado por {cpvsSeleccionados.length} CPV{cpvsSeleccionados.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                <div className="grid gap-4">
                  {licitacionesAMostrar.results.map((licitacion) => (
                    <LicitacionCard
                      key={licitacion.id}
                      licitacion={licitacion}
                      onViewDetail={() => fetchDetalle(licitacion.url)}
                    />
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal de detalle */}
      <LicitacionDetail
        licitacion={licitacionSeleccionada}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </div>
  );
};

export default Index;
