// src/lib/format.ts
export const formatarReal = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })