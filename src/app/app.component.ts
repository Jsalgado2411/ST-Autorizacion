import { Component, Input, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './services/storage.service';
import { STApiService } from './services/stapi.service';
import { APIResponse, UserData } from './interfaces';
import { Storage } from '@ionic/storage';
import { NotificationService } from './services/notification.service';
import { Platform } from '@ionic/angular';
import { SharedService } from './services/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  totalTarjetas: number = 0;
  @Input() session!: APIResponse;
  notification: any;
  
  constructor(
    private router: Router,
    private localService: StorageService,
    private stApiservice: STApiService,
    private storageService: StorageService,
    private storage : Storage,
    private notificacion: NotificationService,
    private zone: NgZone,
    private plataform: Platform,
    private sharedService: SharedService
  ) 
  {
    this.sharedService.totalTarjetas$.subscribe(total => {
      this.totalTarjetas = total;
    });

    this.plataform.ready().then(() => {
      this.notificacion.initPush();

      this.notification = setInterval(() => {
        this.sendNotification();
      }, 180000);
    }).catch(e => {
      console.log('error fcm: ', e);
    });
    
    // this.notification = setInterval(async () =>{
    //   this.notificacion.PushNotificacion(this.totalTarjetas);
    // }, 180000);
  }
  async ngOnInit() {
    
    await this.localService.init();
    const session = await this.localService.getItem('session');
    if(session) {
      this.zone.run(() =>{
        this.router.navigate(['/tabs/index']);
      });
    }else{
      this.zone.run(() => {
        this.router.navigate(['/auth']);
      });
    }
  }

  sendNotification(){
    this.notificacion.PushNotificacion(this.totalTarjetas);
  }
  
}
