export interface Licitacion {
  id: string;
  title: string;
  url: string;
  summary?: string;
  organo_contratacion?: string;
  importe?: string;
  fecha_publicacion?: string;
  provincia?: string;
}

export interface LicitacionDetalle extends Licitacion {
  cpv?: string[];
  pliegos?: Pliego[];
  descripcion?: string;
  plazo_presentacion?: string;
}

export interface Pliego {
  nombre: string;
  url: string;
  tipo?: string;
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
