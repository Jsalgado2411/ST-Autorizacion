import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { STApiService } from 'src/app/services/stapi.service';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
})
export class ConfiguracionPage implements OnInit {

  constructor(
              private alertCtrl: AlertController,
              private stApiService : STApiService,
              private router: Router,) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
  }

  async presentAlert() {
    const alert = await this.alertCtrl.create({
      header: '¿Estás seguro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancelado');
          },
        },
        {
          text: 'Cerrar Sesión',
          handler: async () => {
            try{
              await this.stApiService.logout();
              console.log('Sesion Cerrada');
              this.stApiService.clearUserData();
              this.router.navigate(['/auth']);
            }catch(error){
              console.error('Error al cerrar Sesion', error);              
            }
          },
        },
      ],
    });
    await alert.present();
  }

}
