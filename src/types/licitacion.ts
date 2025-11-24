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
  cpv?: string[] | string;
  pliegos?: Pliego[];
  pliegos_xml?: Pliego[];
  descripcion?: string;
  plazo_presentacion?: string;
  entidad?: string;
  estado?: string;
  valor_estimado?: string;
  fecha_limite?: string;
  fecha_inicio?: string;
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

export interface CPVResponse {
  cpvs: CPV[];
  count: number;
}
