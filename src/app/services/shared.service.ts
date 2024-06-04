import { Injectable } from '@angular/core';
import { STApiService } from './stapi.service';
import { HistoricoAuth, Result, UserData } from '../interfaces';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private totalTarjetasSubject = new BehaviorSubject<number>(0);
  totalTarjetas$ = this.totalTarjetasSubject.asObservable();

  constructor() { }

   actualizarTotalTarjetas(total: number) {
    this.totalTarjetasSubject.next(total);
  }

}
