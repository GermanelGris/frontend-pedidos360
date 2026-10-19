import { goalLevel, stockLevel } from './kpi-levels';

describe('stockLevel', () => {
  const cases: [number, string, string][] = [
    [0, 'danger', 'Sin stock'],
    [9, 'danger', 'Sin stock'],
    [10, 'warn', 'Stock bajo'],
    [20, 'warn', 'Stock bajo'],
    [21, 'ok', 'Normal'],
    [139, 'ok', 'Normal'],
    [140, 'warn', 'Stock alto'],
    [149, 'warn', 'Stock alto'],
    [150, 'danger', 'Sobrestock'],
    [300, 'danger', 'Sobrestock'],
  ];

  for (const [stock, tone, label] of cases) {
    it(`stock ${stock} → ${label}`, () => {
      expect(stockLevel(stock)).toEqual({ tone: tone as 'danger' | 'warn' | 'ok', label });
    });
  }
});

describe('goalLevel', () => {
  it('menos de 50 % está en riesgo', () => expect(goalLevel(49.9).tone).toBe('danger'));
  it('entre 50 % y 99 % está en progreso', () => expect(goalLevel(50).tone).toBe('warn'));
  it('100 % o más está cumplida', () => {
    expect(goalLevel(100).label).toBe('Cumplida');
    expect(goalLevel(140).tone).toBe('ok');
  });
});
