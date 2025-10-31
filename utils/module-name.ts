export const trainingModules = [
  { value: "ALTERNANDO_RITMO", label: "Alternando ritmo" },
  { value: "COMPETICAO", label: "Competição" },
  { value: "CONTRARRELOGIO", label: "Contrarrelógio" },
  { value: "FARTLEK", label: "Fartlek" },
  { value: "HIIT_CURTO", label: "Hiit Curto", metrics: true },
  { value: "HIT_ELEVACAO", label: "Hiit com elevação", metrics: true },
  { value: "HIITT_LONGO", label: "Hiit Longo", metrics: true },
  { value: "LL1", label: "LL1" },
  { value: "LL2_INTERVALADO", label: "LL2 intervalado", metrics: true },
  { value: "LL2_RITMADO", label: "LL2 ritmado" },
  { value: "LONGAO", label: "Longão" },
  { value: "PROGRASSIVO", label: "Progressivo" },
  { value: "RODAGEM", label: "Rodagem" },
  { value: "SPRINT", label: "Sprint", metrics: true },
  { value: "TESTE_FISICO", label: "Teste Físico" },
  { value: "FORCA", label: "Força" },
];

export const moduleName = (name: string) => {
  if (name) {
    const moduleName = trainingModules.filter(
      (module) => module.value === name
    )[0];
    if (moduleName) {
      return moduleName.label;
    }
    return name;
  }
};
