export type PrintTemplateType = 'kitchen' | 'cashier' | 'generic';

export type PaperWidth = '58mm' | '80mm';

/** Single block in a template section (header, body, footer) */
export type TemplateLayoutBlock =
  | { type: 'field'; value: string }
  | { type: 'itemsTable'; columns: string[] }
  | { type: 'separator' }
  | { type: 'line'; text?: string }
  | { type: 'logo' }
  | { type: 'logo' };

/** Dynamic layout: ordered blocks per section. No hardcoded templates. */
export interface TemplateLayout {
  header?: TemplateLayoutBlock[];
  body?: TemplateLayoutBlock[];
  footer?: TemplateLayoutBlock[];
}

export interface PrintTemplate {
  id: string;
  name: string;
  type: PrintTemplateType;
  layout: TemplateLayout;
  paper_width: PaperWidth;
  active: boolean;
  autoCut: boolean;
  sections: string[];
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePrintTemplateDTO {
  name: string;
  type: PrintTemplateType;
  layout: TemplateLayout;
  paper_width?: PaperWidth;
  active?: boolean;
  autoCut?: boolean;
  sections?: string[];
  created_by?: string | null;
}

export interface UpdatePrintTemplateDTO {
  name?: string;
  type?: PrintTemplateType;
  layout?: TemplateLayout;
  paper_width?: PaperWidth;
  active?: boolean;
  autoCut?: boolean;
  sections?: string[];
}

export interface PrintTemplateFilters {
  type?: PrintTemplateType;
  active?: boolean;
}
