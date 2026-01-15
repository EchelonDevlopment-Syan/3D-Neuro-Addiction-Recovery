export interface BrainState {
  dopamine: { baseline: number; current: number };
  serotonin: { baseline: number; current: number };
  adrenaline: { baseline: number; current: number };
  stage: AddictionStage;
  substance: SubstanceType;
  recoveryDay: number;
}

export interface HistoryPoint {
  day: number;
  dopamine: number;
  serotonin: number;
  adrenaline: number;
}

export enum AddictionStage {
  NORMAL = 'normal',
  EARLY = 'early',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  RECOVERY = 'recovery'
}

export enum SubstanceType {
  ALCOHOL = 'alcohol',
  OPIOIDS = 'opioids',
  STIMULANTS = 'stimulants'
}
