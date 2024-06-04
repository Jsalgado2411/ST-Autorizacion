import { Component, OnInit } from '@angular/core';
import { STApiService } from '../../../services/stapi.service';
import { SharedService } from 'src/app/services/shared.service';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
const { App } = Plugins;
@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
  totalTarjetas: number = 0;

  constructor(
    public sharedService: SharedService,
    private platform: Platform,
    private router: Router,
    private alertControler: AlertController,    
  ) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
    this.sharedService.totalTarjetas$.subscribe(total => {
      this.totalTarjetas = total;
    });

    this.platform.backButton.subscribeWithPriority(10, () => {
      this.confirmarSalida();
    });
  }
  async confirmarSalida(){
    const alert = await this.alertControler.create({
      header: 'Confirmar Salida',
      message: '¿Estas seguro de que quieres salir de la aplicacion?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancelado');
          }
        },
        {
          text: 'Salir',
          handler: () => {
            console.log('Saliendo de la aplicacion');
            App['exitApp'](); 
          }
        }
      ]
    });
    await alert.present();
  }

}
