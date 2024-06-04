import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';
import { STApiService } from './services/stapi.service';
import { AuthInitializerService } from './services/auth-initializer.service';
import { NativeBiometric } from 'capacitor-native-biometric';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot({mode: 'md'}), 
    AppRoutingModule, 
    HttpClientModule, 
    IonicStorageModule.forRoot(),    
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    STApiService,
    { 
      provide: APP_INITIALIZER, useFactory: (authInitializerService : STApiService) => () => authInitializerService.init(),
      multi: true,
      deps: [STApiService]
    },
      
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
