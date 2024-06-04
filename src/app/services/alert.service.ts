import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private alertControler : AlertController) { }

  async presentAlert(header: string, message: string){
    const alert = await this.alertControler.create({
      header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
