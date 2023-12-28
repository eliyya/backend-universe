export interface TODO {
  get(id: string): Promise<tTODO>;
}

export type tTODO = {
  owner: string;
  description: string;
};
