export interface Label {
  id?: string;
  name: string;
  color?: string;
  iconRef?: string;
}

export interface GetAllLabelsResponse {
  values: Label[];
  count: number;
}
