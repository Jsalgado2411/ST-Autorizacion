import { Injectable } from '@angular/core';
import { BehaviorSubject, from, switchMap, throwError, catchError, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserData } from '../interfaces';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from './storage.service';
import { STApiService } from './stapi.service';

@Injectable({
  providedIn: 'root'
})
export class AutoViatService {

  private apiURL = environment.apiURL;
  private authDataSubject = new BehaviorSubject<UserData | null>(null);
  private userData: UserData = {};

  private tarjetasActualizadasSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    public stapiService: STApiService,
  ) { }

  async Auth_Viat(folio?: string, firma?: string, accion?: string){
    const tokenStorage = this.storageService.getItem('token');
    const credentials = this.storageService.getItem('credentials');

    return from(tokenStorage).pipe(
      switchMap((token) =>{
        if (!token) {
          return throwError(new Error('No se encontró un token en el localStorage.'));
        }

        const url = `${this.apiURL}/auth_array_solicitud_viats.php`;

        const requestBody = {
          "autorizacion" : "autorizar",
          "pin" : "No Pin",
          "accion" : accion,
          "foliosViaticos" : folio,
          "base64" : firma
        };

        const headers = new HttpHeaders({
          'Content-Type' : 'application/json',
          'Authorization': `Bearer ${token}`,
        });
        const httpOptions = {
          headers: headers,
          withCredencials : true
        };
        return this.http.post<any>(url, requestBody, httpOptions).pipe(
          catchError((error) => {
            console.error('Error en la solicitud Auth_Viat: ', error);
            return throwError(error);
          }),
          tap(() => {
            this.tarjetasActualizadasSubject.next(true); // Emitir evento de actualización
          })
        );
      })
    );
  }

  getTarjetasActualizadasObservable() {
    return this.tarjetasActualizadasSubject.asObservable();
  }

  Auth_Pago_Viat(){

  }

  Auth_Solicitud_Viat(){

  }
}
