import { Injectable } from '@angular/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { Capacitor } from '@capacitor/core';

export const FCM_TOKEN ='push_notification_token';

@Injectable({
  providedIn: 'root'
})

export class NotificationService {
  deviceId: string = '';

  private _redirect = new BehaviorSubject<any>(null);
  
  get redirect(){
    return this._redirect.asObservable();
  }

  constructor(
    private storageService: StorageService,
  ) { }

  initPush(){
    if(Capacitor.getPlatform() !== 'web'){
      this.registerPush();
    }
  }

  private async registerPush(){
    try{
      await this.addListeners();
      let permStatus = await PushNotifications.checkPermissions();

      if(permStatus.receive === 'prompt'){
        permStatus = await PushNotifications.requestPermissions();
      }
      
      if(permStatus.receive !== 'granted'){
        throw new Error('Usuario denegando permisos!');
      }
      await PushNotifications.register();
    }catch (e) {
      console.log(e);
    }
  }
  
  async getDeliveredNotifications() {
    const notificationList = await PushNotifications.getDeliveredNotifications();
    console.log('delivered notifications', notificationList);
  }

  addListeners(){
    PushNotifications.addListener(
      'registration',
      async(token: Token) => {
        console.log('My token ',token);
        this.deviceId = token?.value;
        const fcm_token = (token?.value);
        this.storageService.setItem(FCM_TOKEN, token);
        let go = 1;
        const saved_token = JSON.parse((await this.storageService.getItem(FCM_TOKEN)).value);
        if(saved_token){
          if(fcm_token === saved_token){
            console.log('Token igual');
            go = 0;
          }else{
            go = 2;
          }
        }
        if( go == 1 ){
          this.storageService.setItem(FCM_TOKEN, JSON.stringify(fcm_token));
        }else if(go == 2){
          const data = {
            expired_token : saved_token,
            refreshed_token: fcm_token
          };
          this.storageService.setItem(FCM_TOKEN, fcm_token );
        }
      }
    )
  }

  async removeFcmToken(){
    try{
      const saved_token = JSON.parse((await this.storageService.getItem(FCM_TOKEN)).value);
      this.storageService.removeItem(FCM_TOKEN);
    }catch(e){
      console.log(e);
      throw(e);
    }
  }

  registerNotifications = async () => {
    let permStatus = await PushNotifications.checkPermissions();
  
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
  
    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }
  
    await PushNotifications.register();
  }
    
  async PushNotificacion(totalNotifi: number){
    const payload = {
      to: this.deviceId,
      notification: {
        title: 'Tienes un total de ' + totalNotifi + ' autorizaciones pendientes'        
      }
    };
    try{
      const response = await fetch('https://fcm.googleapis.com/fcm/send',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'key=AAAASHK6mYs:APA91bGsoyIcZHrQcEIQ_1YMgIgNbreGCom6nwQakRkNRz4QYwywqdwXVMZouVC1Mk7rGAENwuNWmufoeRbwvpQvrRcH46n_4d4BGUjHrtYMXXUCmh3zpbbphPmnxC5W7aZ5-TnxmrrA',
          'Authorization':  `Bearer ${'AAAASHK6mYs:APA91bGsoyIcZHrQcEIQ_1YMgIgNbreGCom6nwQakRkNRz4QYwywqdwXVMZouVC1Mk7rGAENwuNWmufoeRbwvpQvrRcH46n_4d4BGUjHrtYMXXUCmh3zpbbphPmnxC5W7aZ5-TnxmrrA'}`
        },
        body: JSON.stringify(payload)
      });
      console.log('Notificacion enviada satisfactoriamente: ', response);
      
    }catch (error){
      console.error('Error al enviar la notificacion: ', error);      
    } 

  }
}
