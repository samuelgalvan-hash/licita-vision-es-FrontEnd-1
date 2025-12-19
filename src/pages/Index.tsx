import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileSearch, Loader2, AlertCircle, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

import { WizardSteps } from "@/components/WizardSteps";
import { LicitacionesList } from "@/components/LicitacionesList";
import { LicitacionDetailView } from "@/components/LicitacionDetailView";

import type {
  Licitacion,
  LicitacionDetalle,
  ApiResponse,
} from "@/types/licitacion";

const API_BASE_URL = "https://licitaciones-backend-1.onrender.com";

// 1: CPV -> 2: Comunidades -> 3: Licitaciones -> 4: Detalles
type Step = 1 | 2 | 3 | 4;

type ComunidadesPorCpvsResponse = {
  cpvs: string[];
  sugeridas: { comunidad: string; matches: number }[];
  nota?: string;
};

// Comunidades disponibles (para botón “Mostrar todas”)
const ALL_COMUNIDADES = [
  "andalucía",
  "aragón",
  "asturias",
  "baleares",
  "canarias",
  "cantabria",
  "castilla-la mancha",
  "castilla y león",
  "cataluña",
  "comunidad valenciana",
  "extremadura",
  "galicia",
  "madrid",
  "murcia",
  "navarra",
  "la rioja",
  "país vasco",
  "ceuta",
  "melilla",
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Paso 1: CPVs seleccionados (entrada manual)
  const [cpvInput, setCpvInput] = useState("");
  const [cpvsSeleccionados, setCpvsSeleccionados] = useState<string[]>([]);

  // Paso 2: comunidades sugeridas + seleccionadas
  const [comunidadesSugeridas, setComunidadesSugeridas] = useState<{ comunidad: string; matches: number }[]>([]);
  const [mostrarTodasComunidades, setMostrarTodasComunidades] = useState(false);
  const [comunidadesSeleccionadas, setComunidadesSeleccionadas] = useState<string[]>([]);

  // Paso 3: datos licitaciones
  const [licitacionesData, setLicitacionesData] = useState<ApiResponse<Licitacion> | null>(null);
  const [filteredLicitaciones, setFilteredLicitaciones] = useState<ApiResponse<Licitacion> | null>(null);

  // Paso 4: detalle
  const [licitacionSeleccionada, setLicitacionSeleccionada] = useState<LicitacionDetalle | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | undefined>();

  // --- Queries ---

  // 1) CPV -> comunidades sugeridas (aproximado)
  const {
    refetch: fetchComunidadesPorCPVs,
    isFetching: loadingComunidadesPorCPVs,
    error: errorComunidadesPorCPVs,
  } = useQuery<ComunidadesPorCpvsResponse>({
    queryKey: ["comunidades-por-cpvs", cpvsSeleccionados],
    queryFn: async () => {
      const params = new URLSearchParams();
      cpvsSeleccionados.forEach((c) => params.append("cpvs", c));
      const res = await fetch(`${API_BASE_URL}/comunidades_por_cpvs?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Error al obtener comunidades por CPV");
      }
      const data = await res.json();
      setComunidadesSugeridas(data.sugeridas || []);
      return data;
    },
    enabled: false,
  });

  // 2) Comunidades -> licitaciones base
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

      const res = await fetch(`${API_BASE_URL}/licitaciones_es?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Error al obtener licitaciones");
      }

      const data = await res.json();
      setLicitacionesData(data);
      return data;
    },
    enabled: false,
  });

  // 3) poblar CPVs exactos (Playwright)
  const {
    refetch: fetchCPVLicitaciones,
    isFetching: loadingCPVPoblacion,
  } = useQuery({
    queryKey: ["cpv-licitaciones"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/cpv_licitaciones`);
      if (!res.ok) throw new Error("Error al poblar CPVs");
      return res.json();
    },
    enabled: false,
  });

  // 4) filtrar por CPVs exactos
  const {
    refetch: fetchFiltrarCPVs,
    isFetching: loadingFiltradas,
    error: errorFiltradas,
  } = useQuery<ApiResponse<Licitacion>>({
    queryKey: ["filtrar-cpvs", cpvsSeleccionados],
    queryFn: async () => {
      const params = new URLSearchParams();
      cpvsSeleccionados.forEach((cpv) => params.append("cpvs", cpv));

      const res = await fetch(`${API_BASE_URL}/filtrar_cpvs?${params}`);
      if (!res.ok) throw new Error("Error al filtrar por CPVs");
      const data = await res.json();
      setFilteredLicitaciones(data);
      return data;
    },
    enabled: false,
  });

  // --- Helpers UI ---

  const comunidadesParaMostrar = useMemo(() => {
    if (mostrarTodasComunidades) {
      return ALL_COMUNIDADES.map((c) => ({ comunidad: c, matches: 0 }));
    }
    return comunidadesSugeridas;
  }, [mostrarTodasComunidades, comunidadesSugeridas]);

  const toggleComunidad = (c: string) => {
    setComunidadesSeleccionadas((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const normalizeCPV = (value: string) => {
    const m = value.match(/\b\d{8}\b/);
    return m ? m[0] : "";
  };

  const addCPV = () => {
    const cpv = normalizeCPV(cpvInput);
    if (!cpv) {
      toast.error("Introduce un CPV válido de 8 dígitos (ej. 30200000)");
      return;
    }
    setCpvsSeleccionados((prev) => (prev.includes(cpv) ? prev : [...prev, cpv]));
    setCpvInput("");
  };

  const removeCPV = (cpv: string) => {
    setCpvsSeleccionados((prev) => prev.filter((x) => x !== cpv));
  };

  // --- Step actions ---

  // Paso 1 -> Paso 2: pedir comunidades sugeridas
  const handleContinuarDesdeCPV = async () => {
    if (cpvsSeleccionados.length === 0) {
      toast.error("Añade al menos un CPV para continuar");
      return;
    }

    toast.loading("Buscando comunidades para esos CPVs...", { id: "cpv" });
    try {
      const r = await fetchComunidadesPorCPVs();
      if (r.data) {
        toast.success("Comunidades cargadas", { id: "cpv" });
        // preseleccionar sugeridas por defecto
        const sugeridas = (r.data.sugeridas || []).map((x: any) => x.comunidad);
        setComunidadesSeleccionadas(sugeridas.slice(0, 5)); // preselecciona las 5 primeras (ajusta si quieres)
        setCurrentStep(2);
      }
    } catch (e: any) {
      toast.error(e.message || "Error obteniendo comunidades", { id: "cpv" });
    }
  };

  // Paso 2 -> Paso 3: buscar licitaciones y filtrar exacto por CPV
  const handleBuscarLicitaciones = async () => {
    if (comunidadesSeleccionadas.length === 0) {
      toast.error("Selecciona al menos una comunidad autónoma");
      return;
    }

    toast.loading("Buscando licitaciones...", { id: "search" });
    try {
      const lic = await fetchLicitaciones();
      if (!lic.data) throw new Error("No se recibieron licitaciones");

      // poblar CPVs exactos (Playwright)
      toast.loading("Extrayendo CPVs (puede tardar)...", { id: "cpvfill" });
      await fetchCPVLicitaciones();
      toast.success("CPVs extraídos", { id: "cpvfill" });

      // aplicar filtro exacto
      toast.loading("Aplicando filtro por CPV...", { id: "filter" });
      const fil = await fetchFiltrarCPVs();
      if (fil.data) {
        toast.success(`${fil.data.count} licitaciones filtradas`, { id: "filter" });
        setCurrentStep(3);
      }
      toast.success(`Se encontraron ${lic.data.count} licitaciones`, { id: "search" });
    } catch (e: any) {
      toast.error(e.message || "Error al buscar licitaciones", { id: "search" });
    }
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setComunidadesSugeridas([]);
    setMostrarTodasComunidades(false);
    setComunidadesSeleccionadas([]);
    setLicitacionesData(null);
    setFilteredLicitaciones(null);
    setLicitacionSeleccionada(null);
  };

  const handleBackToStep2 = () => {
    setCurrentStep(2);
    setLicitacionSeleccionada(null);
  };

  const handleViewDetail = async (licitacion: Licitacion) => {
    const id = licitacion.id || `${licitacion.title}`;
    setLoadingDetailId(id);

    toast.loading("Cargando detalle...", { id: "detail" });

    try {
      const params = new URLSearchParams();
      params.append("url", licitacion.url);
      if (licitacion.feed_origen) params.append("feed", licitacion.feed_origen);

      const res = await fetch(`${API_BASE_URL}/detalle_licitacion?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Error al obtener detalle");
      }

      const data: LicitacionDetalle = await res.json();
      data.feed_origen = licitacion.feed_origen;
      data.url = licitacion.url;

      setLicitacionSeleccionada(data);
      setCurrentStep(4);
      toast.success("Detalle cargado", { id: "detail" });
    } catch (e: any) {
      toast.error(e.message || "Error al obtener detalle", { id: "detail" });
    } finally {
      setLoadingDetailId(undefined);
    }
  };

  // Licitaciones a mostrar (filtradas exactas)
  const licitacionesToShow = filteredLicitaciones || licitacionesData;

  const anyError = errorComunidadesPorCPVs || errorLicitaciones || errorFiltradas;

  return (
    <div className="min-h-screen bg-background">
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
        <WizardSteps currentStep={currentStep} />

        {anyError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error de conexión con el backend. Verifica que el servidor esté activo en {API_BASE_URL}
            </AlertDescription>
          </Alert>
        )}

        {/* STEP 1: CPV */}
        {currentStep === 1 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">1) Filtrar por CPV</h2>
            <p className="text-muted-foreground mb-4">
              Añade uno o varios CPVs (8 dígitos). Después te sugeriremos comunidades donde probablemente existan coincidencias.
            </p>

            <div className="flex flex-col md:flex-row gap-3">
              <input
                className="w-full md:flex-1 border border-border rounded-md px-3 py-2 bg-background"
                placeholder="Ej: 30200000"
                value={cpvInput}
                onChange={(e) => setCpvInput(e.target.value)}
              />
              <Button onClick={addCPV}>Añadir CPV</Button>
            </div>

            {cpvsSeleccionados.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {cpvsSeleccionados.map((cpv) => (
                  <span
                    key={cpv}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {cpv}
                    <button
                      className="opacity-80 hover:opacity-100"
                      onClick={() => removeCPV(cpv)}
                      aria-label={`Eliminar ${cpv}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button onClick={handleContinuarDesdeCPV} disabled={loadingComunidadesPorCPVs}>
                {loadingComunidadesPorCPVs ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Cargando comunidades…
                  </span>
                ) : (
                  "Continuar"
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 2: Comunidades */}
        {currentStep === 2 && (
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold mb-1">2) Selecciona comunidades</h2>
                <p className="text-muted-foreground">
                  Mostramos comunidades sugeridas para tus CPVs. Si no ves la tuya, pulsa “Mostrar todas”.
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMostrarTodasComunidades((v) => !v)}>
                  {mostrarTodasComunidades ? "Ver sugeridas" : "Mostrar todas"}
                </Button>
                <Button variant="outline" onClick={handleBackToStep1}>
                  Volver
                </Button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {comunidadesParaMostrar.map((item) => {
                const c = item.comunidad;
                const checked = comunidadesSeleccionadas.includes(c);
                return (
                  <label
                    key={c}
                    className={`border rounded-md px-3 py-3 cursor-pointer flex items-center justify-between gap-3 ${
                      checked ? "border-primary" : "border-border"
                    }`}
                  >
                    <span className="capitalize">{c}</span>
                    <span className="flex items-center gap-3">
                      {!mostrarTodasComunidades && (
                        <span className="text-xs text-muted-foreground">
                          {item.matches} matches
                        </span>
                      )}
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleComunidad(c)}
                      />
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={handleBuscarLicitaciones}
                disabled={loadingLicitaciones || loadingCPVPoblacion || loadingFiltradas}
              >
                {(loadingLicitaciones || loadingCPVPoblacion || loadingFiltradas) ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Buscando…
                  </span>
                ) : (
                  "Buscar licitaciones"
                )}
              </Button>
            </div>

            {(loadingCPVPoblacion || loadingFiltradas) && (
              <p className="mt-3 text-sm text-muted-foreground">
                Nota: extraer CPVs exactos puede tardar porque se consulta el detalle de cada licitación.
              </p>
            )}
          </Card>
        )}

        {/* STEP 3: Licitaciones */}
        {currentStep === 3 && licitacionesToShow && (
          <div className="grid grid-cols-1 gap-6">
            <LicitacionesList
              licitaciones={licitacionesToShow.results || []}
              count={licitacionesToShow.count || 0}
              onViewDetail={handleViewDetail}
              onBack={() => setCurrentStep(2)}
              isLoadingDetail={!!loadingDetailId}
              loadingDetailId={loadingDetailId}
            />
          </div>
        )}

        {/* STEP 4: Detalles */}
        {currentStep === 4 && licitacionSeleccionada && (
          <LicitacionDetailView licitacion={licitacionSeleccionada} onBack={handleBackToStep2} />
        )}
      </main>
    </div>
  );
};

export default Index;
