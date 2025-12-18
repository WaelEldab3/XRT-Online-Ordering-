import { Customer, MappedPaginatorInfo } from "@/types";

export type ImportRow = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  rewards?: number;
  notes?: string;
  business_id?: string;
  location_id?: string;
};

export type Business = {
  _id: string;
  name: string;
};

export type Location = {
  _id: string;
  branch_name?: string;
  name?: string;
  business_id: string | { _id: string };
};

export interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Omit<ImportRow, 'id'>[]) => void;
  data: Omit<ImportRow, 'id' | 'business_id' | 'location_id'>[];
  businesses: Business[];
  locations: Location[];
  isLoading?: boolean;
}

export type IProps = {
  customers: Customer[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

export type CustomerFormProps = {
  initialValues?: any;
};

export type FormValues = {
  name: string;
  email: string;
  phoneNumber: string;
  business_id: string;
  location_id: string;
  rewards?: number;
  notes?: string;
};
