export type ModelId = "cube-baby" | "cube-baby-bass" | "cube-baby-ac";

export interface Model {
  id: ModelId;
  name: string;
  knobs: { [knob_name: string]: [number, number] };
}

const cubeBabyModel: Model = {
  id: "cube-baby",
  name: "Cube Baby",
  knobs: {
    volume: [0, 127],
    ir_cab: [0, 8],
    reverb: [0, 15],
    mix: [0, 118],
    fb: [0, 127],
    time: [0, 31],
    mod: [0, 15],
    tone: [0, 15],
    gain: [0, 7],
    type: [0, 8],
  },
};

const cubeBabyBassModel: Model = {
  id: "cube-baby-bass",
  name: "Cube Baby Bass",
  knobs: {
    volume: [0, 127],
    ir_cab: [0, 8],
    time: [0, 127],
    space: [0, 30],
    mod: [0, 14],
    comp: [0, 8],
    bass: [0, 127],
    mid: [0, 127],
    treb: [0, 127],
    boost: [0, 127],
  },
};

const cubeBabyAcModel: Model = {
  id: "cube-baby-ac",
  name: "Cube Baby AC",
  knobs: {
    volume: [0, 127],
    ir_cab: [0, 8],
    time: [0, 127],
    space: [0, 31],
    mod: [0, 15],
    anti_fb: [0, 8],
    comp: [0, 8],
    bass: [0, 127],
    mid: [0, 127],
    treb: [0, 127],
  },
};

const getModels = async (): Promise<Model[]> => {
  return Promise.resolve([cubeBabyModel, cubeBabyBassModel, cubeBabyAcModel]);
};

export const ModelService = { getModels };
