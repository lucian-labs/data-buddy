import { uuidGen } from "./utils";

export type ID = string | number;

/** @deprecated Alias kept so imports written against 0.3.0 keep resolving. */
export type UUID = ID;

export type DataRecord = {
  id: ID;
};

export type DataBuddyParams<T extends DataRecord> = T[];

export interface IDataBuddy<T extends DataRecord> {
  get: () => T[];
  getOne: (id: T["id"]) => T | null;
  create: (body: Omit<T, "id">) => T;
  update: (id: T["id"], body: Partial<T>) => T | null;
  delete: (id: T["id"]) => boolean;
}

export class DataBuddy<T extends DataRecord> implements IDataBuddy<T> {
  readonly data: T[];
  private genId: () => T["id"];

  // The default generator only ever produces strings, hence the cast: a store
  // whose records declare a numeric id has to supply its own genId.
  constructor(records: T[], genId: () => T["id"] = uuidGen as () => T["id"]) {
    this.data = [...records];
    this.genId = genId;
  }

  get = (): T[] => {
    return [...this.data];
  };

  getOne = (id: T["id"]): T | null => {
    return this.data.find((record) => record.id === id) || null;
  };

  create = (body: Omit<T, "id">): T => {
    // TS cannot see that Omit<T, "id"> plus an id is T for a generic T, so the
    // assertion stands in for a construction that is in fact complete.
    const record: T = {
      ...body,
      id: this.genId(),
    } as T;

    this.data.push(record);
    return record;
  };

  update = (id: T["id"], body: Partial<T>): T | null => {
    const index = this.data.findIndex((record) => record.id === id);
    if (index === -1) return null;

    const record = this.data[index];
    this.data[index] = { ...record, ...body };
    return this.data[index];
  };

  delete = (id: T["id"]): boolean => {
    const index = this.data.findIndex((record) => record.id === id);
    if (index === -1) return false;
    this.data.splice(index, 1);
    return true;
  };
}
