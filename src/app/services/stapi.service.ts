import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable, Subscription, catchError, from, interval, map, of, switchMap, takeWhile, tap, throwError } from 'rxjs';
import { APIResponse, AuthRequestConfig, HistoricoAuth, ResultTerminal, TokenExpirationResponse, UserData } from '../interfaces';
import { StorageService } from './storage.service';
import { CookieService } from 'ngx-cookie-service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class STApiService {

  private apiUrl = environment.apiURL;
  
  private IsLoggedInSubject = new BehaviorSubject<boolean>(false);
  private authDataSubject = new BehaviorSubject<UserData | null>(null);
  private isSessionExpired = new BehaviorSubject<boolean>(false);
  private credentials: any = {};
  private userData: UserData = {};
  
  
  constructor(
              private http: HttpClient,
              private storageService: StorageService,
              private cookieService: CookieService,
              private alertService : AlertService
  ) 
  {
    this.init();
  }
  async init() {
    const token = this.storageService.getItem('token');
    const credentials = this.storageService.getItem('credentials');
  
    if (token && credentials) {
      const creds: any = JSON.parse(await credentials);
      this.setUserData(await token, creds);
    }
  }
  // login(correo: string, pass:string): Observable<any>{
  //   const url = `${this.apiUrl}/login.php`;
  //   const credentials = { correo, pass};

  //   return this.http.post<APIResponse>(url, credentials).pipe(
  //     tap((response) => {
  //       this.credentials = credentials;

  //       const result = response.result;

  //       if(!result){
  //         throw new Error('No se recibieron datos del usuario en la respuesta');
  //       }

  //       this.storageService.setItem('credentials', credentials);
  //       this.storageService.setItem('token', response.result);

  //       localStorage.setItem('token', response.result.toString());
  //       localStorage.setItem('userData', JSON.stringify(result));
        
  //       this.IsLoggedInSubject.next(true);
  //       this.authDataSubject.next(this.userData);

  //       console.log('Datos antes del userData', response);
  //       this.storageService.setItem('credentials', credentials);
  //       this.storageService.setItem('token', response.result);
  //       console.log('Datos del userData', response.result);
  //       // this.setTokenRenewal(response);

  //       return response;
  //     }),catchError((error) => {
  //       return throwError(error);
  //     })
  //   );
  // }
  async login(correo: string, pass:string): Promise<Observable<any>>{
    const url = `${this.apiUrl}/login.php`;
    const credentials = { correo, pass};

    return this.http.post<APIResponse>(url, credentials).pipe(
      tap((response) => {
        this.credentials = credentials;

        const result = response.result;

        if(!result){
          throw new Error('No se recibieron datos del usuario en la respuesta');
        }

        this.storageService.setItem('credentials', credentials);
        this.storageService.setItem('userData', JSON.stringify(result));

        localStorage.setItem('token', response.result.toString());
        // localStorage.setItem('userData', JSON.stringify(result));
        
        this.IsLoggedInSubject.next(true);
        this.authDataSubject.next(this.userData);

        console.log('Datos antes del userData', response);
        // this.storageService.setItem('credentials', credentials);
        this.storageService.setItem('token', response.result);
        this.storageService.saveSession(result);
        console.log('Save session', result);
        
        console.log('Datos del userData', response.result);
        // this.setTokenRenewal(response);

        return response;
      }),catchError((error) => {
        return throwError(error);
      })
    );
  }

  async logout(): Promise <any> {
    // Limpia los datos de sesión
    this.clearUserData();
    // Notifica que el usuario ha cerrado sesión
    this.IsLoggedInSubject.next(false);
    // Elimina los datos del almacenamiento
    await this.storageService.removeItem('credentials');
    await this.storageService.removeItem('token');
    await this.storageService.removeItem('session');
    await this.storageService.removeItem('userData');
    // localStorage.removeItem('token');
    localStorage.clear();
  }

  GetAuth(): Observable<UserData> {
    const tokenPromise = this.storageService.getItem('token');
  
    // Esperar a que la Promise se resuelva
    return from(tokenPromise).pipe(
      switchMap((token) => {
        // console.log(token);
        if (!token) {
          // Manejar el caso en que no haya un token en el localStorage
          return throwError(new Error('No se encontró un token en el localStorage.'));
        }
  
        const userData = this.authDataSubject.getValue(); // Obtén los datos del usuario
        const url = `${this.apiUrl}/get_autorizaciones_fechas.php`;
  
        const requestBody = {
          "autorizacion": "todos",
          "fechaInicial": "2023-01-01",
          "fechaFinal": "2024-12-29",
          "terminal": "todo"
        };
  
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        });
  
        const httpOptions = {
          headers: headers,
          withCredentials: true,
        };
  
        return this.http.post<UserData>(url, JSON.stringify(requestBody), httpOptions).pipe(
          catchError((error) => {
            console.error('Error en la solicitud GETAUTH: ', error);
            return throwError(error);
          })
        );
      }),
      catchError((error) => {
        console.error('Error en la obtención del token: ', error);
        return throwError(error);
      })
    );
  }
  GetRenewToken(): Observable<UserData> {
    const tokenPromise = this.storageService.getItem('token');
  
    return from(tokenPromise).pipe(
      switchMap((token) => {
        if (!token) {
          return throwError(new Error('No se encontró un token en el localStorage.'));
        }
  
        const url = `${this.apiUrl}/renew_token.php`;
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
        });
  
        const httpOptions = {
          headers: headers,
        };
  
        return this.http.post<TokenExpirationResponse>(url, null, httpOptions).pipe(
          switchMap((tokenExpirationResponse: TokenExpirationResponse) => {
            if (tokenExpirationResponse.expired) {
              // Token vencido, solicitar un nuevo token
              return this.http.post<UserData>(url, null).pipe(
                switchMap((userData: UserData) => {
                  // Almacenar el nuevo token en el localStorage
                  this.storageService.setItem('token', userData.token);
                  // Return a new observable that emits the updated token
                  return of({ token: userData.token });
                }),
                catchError((error) => {
                  console.error('Error al renovar el token: ', error);
                  return throwError(new Error('Error al renovar el token.'));
                })
              );
            } else {
              // Devolver el token actual si no está vencido
              return of({ token });
            }
          }),
          catchError((error) => {
            console.error('Error en la solicitud GETAUTH: ', error);
            // Check if the response body is a valid JSON format
            const isJson = (str: string) => {
              try {
                JSON.parse(str);
              } catch (e) {
                return false;
              }
              return true;
            };
  
            if (error.error && !isJson(error.error)) {
              // Si la respuesta no es JSON válido, el token es inválido
              // No es necesario eliminar el token del almacenamiento local aquí
              return throwError(new Error('Token inválido. Por favor, inicie sesión nuevamente.'));
            }
            return throwError(error);
          })
        );
      }),
      catchError((error) => {
        console.error('Error en la obtención del token: ', error);
        return throwError(error);
      })
    );
  }

  GetHisAuth(terminal?: string, selectedDate?: string, selectedDateFinal?: string): Observable<HistoricoAuth> {
    // console.log('valor de terminal', terminal);
    // console.log('valor de selected date', selectedDate);
    // console.log('valor de selected date final', selectedDateFinal);
    const tokenPromise = this.storageService.getItem('token');
  
    // Esperar a que la Promise se resuelva
    return from(tokenPromise).pipe(
      switchMap((token) => {
        // console.log(token);
        if (!token) {
          // Manejar el caso en que no haya un token en el localStorage
          return throwError(new Error('No se encontró un token en el localStorage.'));
        }
  
        const userData = this.authDataSubject.getValue(); // Obtén los datos del usuario
        const url = `${this.apiUrl}/get_info_hist_auths.php`;
  
        const requestBody = {
          "historico" : "todos",
          "fechaInicial" : selectedDate || "2024-01-01",
          "fechaFinal" :  selectedDateFinal  || "2024-12-29",
          "terminal" : terminal
        };
  
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        });
  
        const httpOptions = {
          headers: headers,
          withCredentials: true,
        };
  
        return this.http.post<HistoricoAuth>(url, JSON.stringify(requestBody), httpOptions).pipe(
          catchError((error) => {
            console.error('Error en la solicitud GetHisAuth: ', error);
            return throwError(error);
          })
        );
      }),
      catchError((error) => {
        console.error('Error en la obtención del token: ', error);
        return throwError(error);
      })
    );
  }

  getUserData(): any {
    return this.userData;
  }

  clearUserData(): void {
    this.storageService.removeItem('credentials');
    this.storageService.removeItem('token');
  }

  setUserData(token: string, credentials: any) {
    this.credentials = credentials || {};
    this.userData = {};
    this.storageService.setItem('credentials', JSON.stringify(credentials));
    this.storageService.setItem('token', token);
  
    this.IsLoggedInSubject.next(true);
    this.authDataSubject.next(this.userData);
  }

  get_terminals(): Observable<ResultTerminal> {
    const token = this.storageService.getItem('token');
    return from(token).pipe(
      switchMap((token) => {
        if (!token) {
          return throwError(new Error('No se encontró un token en el localStorage.'));
        }
  
        const url = `${this.apiUrl}/get_terminal.php`;
        
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        });
        const httpOptions = {
          headers: headers,
          withCredentials: true,
        };

        return this.http.post<ResultTerminal>(url, null, httpOptions).pipe(
          catchError((error) => {
            console.error('Error en la solicitud get_terminals: ', error);
            return throwError(error);
          })
        );
      })
    );
  }
}
