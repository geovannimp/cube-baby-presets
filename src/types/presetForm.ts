export type PresetFormValues = {
  name: string;
  description: string;
  customIR: string;
  customIRDistance: number;
  modelId: string;
  knobValues: Record<string, number>;
};
