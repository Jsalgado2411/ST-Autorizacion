import { Injectable } from '@angular/core';
import { STApiService } from './stapi.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInitializerService {

  constructor(private stApiService: STApiService) { }

  initializeApp() {
    return new Promise((resolve) => {
      const token = localStorage.getItem('token');
      const credentials = localStorage.getItem('credentials');

      if (token && credentials) {
        const creds: any = JSON.parse(credentials);
        this.stApiService.setUserData(token, creds);
      }

      resolve(true);
    });
  }
}
