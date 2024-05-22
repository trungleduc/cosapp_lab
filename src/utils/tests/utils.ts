export class MockModel {
  constructor() {}

  on = jest.fn((name: string, func: () => void) => {});

  get = jest.fn((name: string) => {});

  listenTo = jest.fn((model: any, name: string, callback: () => void) => {});

  stopListening = jest.fn(
    (model: any, name: string, callback: () => void) => {}
  );
}

export const computedResult = {
  'model.source.inwards.I': ['float', 0.15],
  'model.source.I_out.I': ['float', 0.15],
  'model.ground.inwards.V': ['float', 0],
  'model.ground.V_out.V': ['float', 0],
  'model.circuit.inwards.n1_V': ['float', 50],
  'model.circuit.inwards.n2_V': ['float', 15.000001666561477],
  'model.circuit.I_in.I': ['float', 0.15],
  'model.circuit.Vg.V': ['float', 0],
  'model.circuit.n1.inwards.n_in': ['int', 1],
  'model.circuit.n1.inwards.n_out': ['int', 2],
  'model.circuit.n1.inwards.V': ['float', 50],
  'model.circuit.n1.I_in0.I': ['float', 0.15],
  'model.circuit.n1.I_out0.I': ['float', 0.08999999333375407],
  'model.circuit.n1.I_out1.I': ['float', 0.06000000666624591],
  'model.circuit.n1.outwards.sum_I_in': ['float', 0.15],
  'model.circuit.n1.outwards.sum_I_out': ['float', 0.14999999999999997],
  'model.circuit.n2.inwards.n_in': ['int', 1],
  'model.circuit.n2.inwards.n_out': ['int', 1],
  'model.circuit.n2.inwards.V': ['float', 15.000001666561477],
  'model.circuit.n2.I_in0.I': ['float', 0.06000000666624591],
  'model.circuit.n2.I_out0.I': ['float', 0.06000000666624591],
  'model.circuit.n2.outwards.sum_I_in': ['float', 0.06000000666624591],
  'model.circuit.n2.outwards.sum_I_out': ['float', 0.06000000666624591],
  'model.circuit.R1.inwards.R': ['float', 555.5555727091753],
  'model.circuit.R1.V_in.V': ['float', 50],
  'model.circuit.R1.V_out.V': ['float', 0],
  'model.circuit.R1.outwards.deltaV': ['float', 50],
  'model.circuit.R1.I.I': ['float', 0.0899999972211137],
  'model.circuit.R2.inwards.R': ['float', 583.333244020294],
  'model.circuit.R2.V_in.V': ['float', 50],
  'model.circuit.R2.V_out.V': ['float', 15.000001666561477],
  'model.circuit.R2.outwards.deltaV': ['float', 34.999998333438526],
  'model.circuit.R2.I.I': ['float', 0.06000000632952248],
  'model.circuit.R3.inwards.R': ['float', 250],
  'model.circuit.R3.V_in.V': ['float', 15.000001666561477],
  'model.circuit.R3.V_out.V': ['float', 0],
  'model.circuit.R3.outwards.deltaV': ['float', 15.000001666561477],
  'model.circuit.R3.I.I': ['float', 0.06000000666624591]
};

export const driverData = {
  'model.design': {
    Residue: [
      9.514909996866194, 7.611928076209867, 5.9373045037406875,
      4.500477723716071, 3.3024514550000093, 2.335428379904188,
      1.583182804208563, 1.022242226391722, 0.6238303125168398,
      0.35638334175735237, 0.18831677693278762, 0.09062777543877386,
      0.03891346763254288, 0.014488046187067474, 0.004484714256324506,
      0.0010785754113869154, 0.00017747999459961485, 0.00001437683858305407,
      8.27532143484284e-9
    ]
  }
};

export const recorderData = {
  'model.design': {
    Section: ['', ''],
    Status: ['', ''],
    'Error code': ['0', '0'],
    Reference: ['pt1', 'pt2'],
    'circuit.R1.R': [555.5555727092, 555.5555727092],
    'circuit.R2.R': [583.3332440203, 583.3332440203],
    'circuit.n1.V': [26.6666634664, 50],
    'circuit.n2.V': [8, 15.0000016666],
    'ground.V': [0, 0],
    'source.I': [0.08, 0.15]
  }
};
