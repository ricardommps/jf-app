import type { DimensionValue, ImageSourcePropType } from "react-native";

export type ModulePresentation = {
  artwork?: ImageSourcePropType;
  message: string[];
  strength?: boolean;
  messageTop?: DimensionValue;
};

export const MODULE_PRESENTATION: Record<string, ModulePresentation> = {
  ALTERNANDO_RITMO: { artwork: require("@/assets/images/shered/01_corrida_finalizada_cansada.png"), message: ["FORTE QUANDO PRECISA.", "LEVE QUANDO DEVE."], messageTop: "20%" },
  COMPETICAO: { artwork: require("@/assets/images/shered/02_competicao_medalha.png"), message: ["PARABÉNS POR MAIS", "ESSA CONQUISTA."] },
  CONTRARRELOGIO: { artwork: require("@/assets/images/shered/03_rodagem_correndo_feliz.png"), message: ["CALIBRANDO", "OS MOTORES"] },
  FARTLEK: { message: ["FORTE QUANDO PRECISA.", "LEVE QUANDO DEVE."] },
  HIIT_CURTO: { artwork: require("@/assets/images/shered/06_sprint_hiit_intenso.png"), message: ["TERMINOU? ENTÃO AGORA", "VOCÊ SABE QUE CONSEGUE."] },
  HIT_ELEVACAO: { artwork: require("@/assets/images/shered/06_sprint_hiit_intenso.png"), message: ["TERMINOU? ENTÃO AGORA", "VOCÊ SABE QUE CONSEGUE."] },
  HIITT_LONGO: { artwork: require("@/assets/images/shered/06_sprint_hiit_intenso.png"), message: ["TERMINOU? ENTÃO AGORA", "VOCÊ SABE QUE CONSEGUE."] },
  LL1: { message: ["CORRER, ACUMULAR", "E SEGUIR."] },
  LL2_INTERVALADO: { artwork: require("@/assets/images/shered/01_corrida_finalizada_cansada.png"), message: ["É TUDO SOBRE", "CONTROLE!"], messageTop: "20%" },
  LL2_RITMADO: { artwork: require("@/assets/images/shered/01_corrida_finalizada_cansada.png"), message: ["É TUDO SOBRE", "CONTROLE!"], messageTop: "20%" },
  LONGAO: { artwork: require("@/assets/images/shered/05_longao_cansada.png"), message: ["CORRER LONGE É", "APRENDER A CONTINUAR."], messageTop: "12%" },
  PROGRASSIVO: { artwork: require("@/assets/images/shered/01_corrida_finalizada_cansada.png"), message: ["CONTROLE NO INÍCIO,", "CORAGEM NO FINAL."] },
  RODAGEM: { message: ["CORRER, ACUMULAR", "E SEGUIR."] },
  SPRINT: { artwork: require("@/assets/images/shered/06_sprint_hiit_intenso.png"), message: ["TERMINOU? ENTÃO AGORA", "VOCÊ SABE QUE CONSEGUE."] },
  TESTE_FISICO: { message: ["CALIBRANDO", "OS MOTORES"] },
  FORCA: { artwork: require("@/assets/images/shered/04_treino_forca_cansada.png"), message: ["MAIS FORTE", "DO QUE ONTEM."], strength: true },
};
