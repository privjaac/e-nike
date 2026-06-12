export interface Promotion {
  id: number;
  name: string;
  code: string;
  type: 'percentage' | 'fixed' | 'bundle';
  value: number;
  isAutoMarkdown: boolean;
  minWos?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
}
