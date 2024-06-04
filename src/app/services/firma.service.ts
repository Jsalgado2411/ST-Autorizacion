import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirmaService {
  firmaBlob$: BehaviorSubject<Blob | null> = new BehaviorSubject<Blob | null>(null);

  constructor() { }

  guardarFirma(firma: Blob){
    this.firmaBlob$.next(firma);
  }
}
