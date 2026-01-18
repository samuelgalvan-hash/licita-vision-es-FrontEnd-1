import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileSearch, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

import { WizardSteps } from "@/components/WizardSteps";
import { ComunidadesSelector } from "@/components/ComunidadesSelector";
import { LicitacionesList } from "@/components/LicitacionesList";
import { CPVFilterPanel } from "@/components/CPVFilterPanel";
import { LicitacionDetailView } from "@/components/LicitacionDetailView";

import type {
  Licitacion,
  LicitacionDetalle,
  CPV,
  ApiResponse,
  CPVResponse,
} from "@/types/licitacion";



const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";



type Step = 1 | 2 | 3 | 4;

const Index = () => {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<Step>(1);
  
  // Data state
  const [comunidadesSeleccionadas, setComunidadesSeleccionadas] = useState<string[]>([]);
  const [cpvsSeleccionados, setCpvsSeleccionados] = useState<string[]>([]);
  const [licitacionSeleccionada, setLicitacionSeleccionada] = useState<LicitacionDetalle | null>(null);
  const [licitacionParaDetalle, setLicitacionParaDetalle] = useState<Licitacion | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | undefined>();
  
  // Stored data
  const [licitacionesData, setLicitacionesData] = useState<ApiResponse<Licitacion> | null>(null);
  const [cpvsData, setCpvsData] = useState<CPV[]>([]);
  const [filteredLicitaciones, setFilteredLicitaciones] = useState<ApiResponse<Licitacion> | null>(null);

  // Step 1 -> 2: Search licitaciones
  const {
    refetch: fetchLicitaciones,
    isFetching: loadingLicitaciones,
    error: errorLicitaciones,
  } = useQuery<ApiResponse<Licitacion>>({
    queryKey: ["licitaciones", comunidadesSeleccionadas],
    queryFn: async () => {
      const params = new URLSearchParams();
      comunidadesSeleccionadas.forEach((c) => params.append("comunidades", c));
      params.append("limit", "100");

      const response = await fetch(`${API_BASE_URL}/licitaciones_es?${params}`);
      if (!response.ok) throw new Error("Error al obtener licitaciones");
      const data = await response.json();
      setLicitacionesData(data);
      return data;
    },
    enabled: false,
  });

  // Step 2 -> 3: Populate CPVs
  const {
    refetch: fetchCPVLicitaciones,
    isFetching: loadingCPVPoblacion,
  } = useQuery({
    queryKey: ["cpv-licitaciones"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/cpv_licitaciones`);
      if (!response.ok) throw new Error("Error al poblar CPVs");
      return response.json();
    },
    enabled: false,
  });

  // Get available CPVs
  const {
    refetch: fetchCPVsDisponibles,
    isFetching: loadingCPVs,
    error: errorCPVs,
  } = useQuery<CPVResponse>({
    queryKey: ["cpvs-disponibles"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/cpv_disponibles`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al obtener CPVs");
      }
      const data = await response.json();
      setCpvsData(data.cpvs || []);
      return data;
    },
    enabled: false,
  });

  // Filter by CPVs
  const {
    refetch: fetchFiltrarCPVs,
    isFetching: loadingFiltradas,
    error: errorFiltradas,
  } = useQuery<ApiResponse<Licitacion>>({
    queryKey: ["filtrar-cpvs", cpvsSeleccionados],
    queryFn: async () => {
      const params = new URLSearchParams();
      cpvsSeleccionados.forEach((cpv) => params.append("cpvs", cpv));

      const response = await fetch(`${API_BASE_URL}/filtrar_cpvs?${params}`);
      if (!response.ok) throw new Error("Error al filtrar por CPVs");
      const data = await response.json();
      setFilteredLicitaciones(data);
      return data;
    },
    enabled: false,
  });

  // Handle search from step 1
  const handleSearch = async () => {
    if (comunidadesSeleccionadas.length === 0) {
      toast.error("Selecciona al menos una comunidad autónoma");
      return;
    }

    toast.loading("Buscando licitaciones...", { id: "search" });
    
    try {
      const result = await fetchLicitaciones();
      if (result.data) {
        toast.success(`Se encontraron ${result.data.count} licitaciones`, { id: "search" });
        setCurrentStep(2);
        
        // Auto-fetch CPVs
        await fetchCPVLicitaciones();
        await fetchCPVsDisponibles();
      }
    } catch (error) {
      toast.error("Error al buscar licitaciones", { id: "search" });
    }
  };

  // Handle view detail
  const handleViewDetail = async (licitacion: Licitacion) => {
    const id = licitacion.id || `${licitacion.title}`;
    setLoadingDetailId(id);
    setLicitacionParaDetalle(licitacion);

    toast.loading("Cargando detalle...", { id: "detail" });

    try {
      const params = new URLSearchParams();
      params.append("url", licitacion.url);
      if (licitacion.feed_origen) {
        params.append("feed", licitacion.feed_origen);
      }

      const response = await fetch(`${API_BASE_URL}/detalle_licitacion?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al obtener detalle");
      }

      const data: LicitacionDetalle = await response.json();
      
      // Add feed_origen and url from the original licitacion
      data.feed_origen = licitacion.feed_origen;
      data.url = licitacion.url;
      
      setLicitacionSeleccionada(data);
      setCurrentStep(4);
      toast.success("Detalle cargado", { id: "detail" });
    } catch (error: any) {
      toast.error(`Error: ${error.message}`, { id: "detail" });
      console.error("Error al obtener detalle:", error);
    } finally {
      setLoadingDetailId(undefined);
    }
  };

  // Handle CPV filter
  const handleApplyFilter = async () => {
    if (cpvsSeleccionados.length === 0) return;
    
    toast.loading("Filtrando por CPV...", { id: "filter" });
    
    try {
      const result = await fetchFiltrarCPVs();
      if (result.data) {
        toast.success(`${result.data.count} licitaciones filtradas`, { id: "filter" });
      }
    } catch (error) {
      toast.error("Error al filtrar", { id: "filter" });
    }
  };

  const handleClearFilter = () => {
    setCpvsSeleccionados([]);
    setFilteredLicitaciones(null);
  };

  // Navigate back
  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setComunidadesSeleccionadas([]);
    setLicitacionesData(null);
    setCpvsData([]);
    setFilteredLicitaciones(null);
    setCpvsSeleccionados([]);
  };

  const handleBackToStep2 = () => {
    setCurrentStep(2);
    setLicitacionSeleccionada(null);
  };

  // Determine which licitaciones to show
  const licitacionesToShow = filteredLicitaciones || licitacionesData;

  const isLoadingCPVs = loadingCPVPoblacion || loadingCPVs;

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

      <main className="container mx-auto px-4 py-8">
        {/* Wizard Steps */}
        <WizardSteps currentStep={currentStep} />

        {/* Error handling */}
        {(errorLicitaciones || errorFiltradas) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error de conexión con el backend. Verifica que el servidor esté activo en {API_BASE_URL}
            </AlertDescription>
          </Alert>
        )}

        {/* Step 1: Community selection */}
        {currentStep === 1 && (
          <ComunidadesSelector
            selected={comunidadesSeleccionadas}
            onChange={setComunidadesSeleccionadas}
            onSearch={handleSearch}
            isLoading={loadingLicitaciones}
          />
        )}

        {/* Step 2 & 3: Licitaciones list with CPV filter */}
        {(currentStep === 2 || currentStep === 3) && licitacionesData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2">
              <LicitacionesList
                licitaciones={licitacionesToShow?.results || []}
                count={licitacionesToShow?.count || 0}
                onViewDetail={handleViewDetail}
                onBack={handleBackToStep1}
                isLoadingDetail={!!loadingDetailId}
                loadingDetailId={loadingDetailId}
              />
            </div>

            {/* Sidebar with CPV filter */}
            <div className="lg:col-span-1">
              <Card className="p-5 sticky top-28">
                <CPVFilterPanel
                  cpvs={cpvsData}
                  selected={cpvsSeleccionados}
                  onChange={(cpvs) => {
                    setCpvsSeleccionados(cpvs);
                    if (currentStep === 2) setCurrentStep(3);
                  }}
                  onApplyFilter={handleApplyFilter}
                  onClearFilter={handleClearFilter}
                  isLoading={isLoadingCPVs}
                  isFiltering={loadingFiltradas}
                  totalLicitaciones={licitacionesData?.count || 0}
                  filteredCount={filteredLicitaciones?.count}
                />
              </Card>
            </div>
          </div>
        )}

        {/* Step 4: Detail view */}
        {currentStep === 4 && licitacionSeleccionada && (
          <LicitacionDetailView
            licitacion={licitacionSeleccionada}
            onBack={handleBackToStep2}
          />
        )}

        {/* Loading state for initial search */}
        {loadingLicitaciones && currentStep === 1 && (
          <Card className="p-12 text-center mt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Buscando licitaciones...
                </h3>
                <p className="text-muted-foreground">
                  Esto puede tardar unos momentos. El backend está consultando las fuentes oficiales.
                </p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Index;

