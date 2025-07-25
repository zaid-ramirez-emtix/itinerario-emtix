import { DangerCircleSvg } from './danger-circle';
import { SuccessCircleSvg } from './success-circle';

export const statusOptions = [
  { name: 'Activo', uid: 'activo' },
  { name: 'Inactivo', uid: 'inactivo' },
] as const;

export type StatusOptions = (typeof statusOptions)[number]['name'];

export const statusColorMap: Record<StatusOptions, JSX.Element> = {
  Activo: SuccessCircleSvg,
  Inactivo: DangerCircleSvg,
};
