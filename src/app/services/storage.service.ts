import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { APIResponse, Result, UserData } from '../interfaces';


@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
   }

   async init(){
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async saveSession( session: Result ){
    this._storage?.set('session', session);
  }

  setItem(key: string, value: any): void {
    if (this._storage) {
      this._storage.set(key, value);
    }
  }

  getItem(key: string): Promise<any> {
    return this._storage ? this._storage.get(key) : Promise.resolve(null);
  }

  removeItem(key: string): void {
    if (this._storage) {
      this._storage.remove(key);
    }
  }

}
