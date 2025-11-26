export interface Licitacion {
  id?: string;
  title: string;
  url: string;
  feed_origen?: string;
  summary?: string;
  organo_contratacion?: string;
  importe?: string;
  fecha_publicacion?: string;
  provincia?: string;
  cpv_guess?: string;
}

export interface LicitacionDetalle {
  title: string;
  entidad?: string;
  importe?: string;
  cpv?: string | string[];
  descripcion?: string;
  feed_origen?: string;
  url?: string;
  plazo_presentacion?: string;
  estado?: string;
  valor_estimado?: string;
  fecha_limite?: string;
  fecha_inicio?: string;
  pliegos_xml?: Pliego[];
}

export interface Pliego {
  tipo: string;
  url: string;
  nombre?: string;
}

export interface CPV {
  code: string;
  description?: string;
  count?: number;
}

export interface ApiResponse<T> {
  results: T[];
  count: number;
}

export interface CPVResponse {
  cpvs: CPV[];
  count: number;
}

export const COMUNIDADES_AUTONOMAS = [
  "Andalucía",
  "Aragón",
  "Asturias",
  "Baleares",
  "Canarias",
  "Cantabria",
  "Castilla-La Mancha",
  "Castilla y León",
  "Cataluña",
  "Comunidad Valenciana",
  "Extremadura",
  "Galicia",
  "Madrid",
  "Murcia",
  "Navarra",
  "La Rioja",
  "País Vasco",
  "Ceuta",
  "Melilla",
] as const;

export type ComunidadAutonoma = typeof COMUNIDADES_AUTONOMAS[number];
