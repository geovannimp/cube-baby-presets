export type ModelId = "cube-baby" | "cube-baby-bass" | "cube-baby-ac";

export interface Model {
  id: ModelId;
  name: string;
  knobs: { [knob_name: string]: [number, number] };
}

const getModels = async (): Promise<Model[]> => {
  return Promise.resolve([
    {
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
    },
  ]);
};

export const ModelService = { getModels };
