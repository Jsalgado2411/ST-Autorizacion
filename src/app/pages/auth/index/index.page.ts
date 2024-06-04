import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { UserData } from 'src/app/interfaces';
import { SharedService } from 'src/app/services/shared.service';
import { STApiService } from 'src/app/services/stapi.service';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { map, Subscription } from 'rxjs';
import { AutoViatService } from 'src/app/services/auto-viat.service';
import { SignatureComponent } from 'src/app/shared/components/signature/signature.component';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
})
export class IndexPage implements OnInit {
  [x: string]: any;
  Tarjetas : any[] = [];
  IndexDatos: any = {};
  selectedOption: string = 'Pendientes';
  selectedTarjeta: any = null;
  tarjetasSubscription!: Subscription;
  refreshInterval: any;
  isSelecting: boolean = false; // Modo de selección activado/desactivado
  selectedTarjetas: number[] = [];
  modalOpen: boolean = false;
  selectedCardIndex: number = -1;
  private longPressTimer: any;
  notification: any;

  constructor(
              private actionSheetCtrl: ActionSheetController, 
              private modalController: ModalController, 
              public stapiService: STApiService,
              private sharedService: SharedService,
              private autoViatService : AutoViatService,
              private navCtrl: NavController,
              private router: Router,         
              private NotificacionService : NotificationService
            ) { }

  async ngOnInit() {
    await this.DataAuth();
    // this.todasTarjetasConViaticosIgualesACero = this.Tarjetas.every(tarjeta => tarjeta.ver_viaticos === 1);
      //Esto es para cuando se inicializa directamente al llamar este index
      this.tarjetasSubscription = this.autoViatService.getTarjetasActualizadasObservable().subscribe(updated => {
        if (updated) {
          this.DataAuth(); // Vuelve a cargar las tarjetas
        }
      });

      this.refreshInterval = setInterval(async () =>{
        await this.DataAuth();        
      }, 10000); //Intervalo de 3 min 180000

      this.notification = setInterval(async () =>{
        this.NotificacionService.PushNotificacion(this.Tarjetas.length);
      }, 60000); 
      // 180000
      // this.addListeners = async () =>{
      //   await PushNotifications
      // }

      // this.getDeviceId();   

  }
  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy() {
    // Importante desuscribirse para evitar memory leaks
    this.tarjetasSubscription.unsubscribe();
  }

  canDismiss = async () => {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Desea salir sin guardar?',
      buttons: [
        {
          text: 'Si',
          role: 'confirm',
        },
        {
          text: 'No',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();

    return role === 'confirm';
  };

  // async abrirModal(index: number) {
  //   console.log(index);    
  //   this.selectedTarjeta = this.Tarjetas[index];
  //   const modal = await this.modalController.create({
  //     component: ModalComponent,
  //     componentProps: {
  //       tarjeta: this.selectedTarjeta,
  //       showSignature: true
  //     },
  //   });
  //   // modal.onDidDismiss().then((data) => {
  //   //   if(data.data){
  //   //     const updatedTarjeta = data.data;
  //   //     const indexToUpdate = this.Tarjetas.findIndex((tarjeta: any) => tarjeta.id === updatedTarjeta.id);
  //   //     this.Tarjetas[indexToUpdate] = updatedTarjeta;
  //   //     this.selectedTarjeta = null;
  //   //   }
  //   // });
  //   modal.onDidDismiss();
  //   return await modal.present();
  // }
  async abrirModal(index: number) {
    console.log(index);    
    this.selectedTarjeta = this.Tarjetas[index];
    const modal = await this.modalController.create({
      component: ModalComponent,
      componentProps: {
        tarjeta: this.selectedTarjeta,
        showSignature: true
      },
    });
  
    // Limpiar selección cuando se cierre el modal
    modal.onDidDismiss().then(() => {
      // this.selectedTarjetas = [];
    });
  
    modal.onDidDismiss();
    await modal.present();
    this.selectedTarjetas = [];
  }

  async handleRefresh(event: any) {
    await this.DataAuth();
    event.target.complete();
  }
  
  handleInput(event: any) {
    const query = event.target.value.toLowerCase().trim();
    if (query === '') {
      this.Tarjetas = [...this.IndexDatos.result];
    } else {
      this.Tarjetas = this.Tarjetas.filter((tarjeta) => {
        return Object.values(tarjeta).some((value: any) => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query);
          } else if (typeof value === 'number') {
            return value.toString().toLowerCase().includes(query);
          } else {
            return false;
          }
        });
      });
    }
  }

  async DataAuth() {
    try {
      // Obtener o renovar el token
      const IndexData = await this.stapiService.GetAuth().toPromise();
      console.log('Autorizaciones del usuario: ', IndexData);
      this.IndexDatos = IndexData;
      this.Tarjetas = Array.isArray(this.IndexDatos.result) ? this.IndexDatos.result.map((tarjeta: any) =>{
        return {
          ...tarjeta,
          firma: null
        }
      }) : [];
      const totalTarjetas = this.Tarjetas.length;
      this.sharedService.actualizarTotalTarjetas(totalTarjetas);
      console.log('Total de tarjetas', this.Tarjetas.length);
    } catch(error) {
      console.error('Error al realizar la solicitud: ', error);
    }
  }

  handleCardClick(tarjeta: any, index: number) {
    // Si estamos en modo de selección, alternamos la selección de la tarjeta
    if (this.isSelecting) {
      this.toggleSelectMode(tarjeta);
    } else {
      // Si no estamos en modo de selección, activamos el modo de selección y abrimos el modal
      // this.isSelecting = true;
      this.abrirModal(index);
    }
  }

  toggleSelectMode(tarjeta: any) {
    if (this.selectedTarjetas.includes(tarjeta)) {
        // Si la tarjeta ya está seleccionada, la eliminamos del array
        this.selectedTarjetas = this.selectedTarjetas.filter(selected => selected !== tarjeta);
    } else {
        // Si la tarjeta no está seleccionada, la añadimos al array
        this.selectedTarjetas.push(tarjeta);
    }
  }
  
  handleLongPress(tarjeta: any) {
    this.longPressTimer = setTimeout(() => {
      if (!this.isSelecting && !this.selectedTarjetas.includes(tarjeta)) {
        this.isSelecting = true;
        this.selectedTarjetas = [tarjeta];
      }
    }, 1000);
  }

  handleCardTouchEnd() {
    clearTimeout(this.longPressTimer); // Cancelar el temporizador si se suelta el card
  }
  
  autorizarSeleccionadas() {
    // Verificar si hay tarjetas seleccionadas
    if (this.selectedTarjetas.length > 0) {
      // Mostrar los botones solo si hay tarjetas seleccionadas
      // y no hay ningún modal abierto
      if (!this.modalOpen) {
        // Lógica para autorizar las tarjetas seleccionadas
        this.selectedTarjetas.forEach(tarjeta => {
          console.log('Se autorizaron las tarjetas:', tarjeta);
          // Aquí puedes implementar la lógica de autorización para cada tarjeta
        });
        this.modalController.create({
          component: SignatureComponent,
          componentProps: {
            tarjetas: this.selectedTarjetas,
          }
        }).then(modal => {
          modal.present();
        });
      }
      // Limpiar selección después de autorizar
      clearTimeout(this.longPressTimer); // Cancelar el temporizador
      this.isSelecting = false;
      this.selectedTarjetas = [];
    }
  }
  
  rechazar() {
    // Verificar si hay tarjetas seleccionadas
    if (this.selectedTarjetas.length > 0) {
      this.selectedTarjetas.forEach(tarjeta => {
        console.log('Se rechazó la tarjeta:', tarjeta);
        // Aquí puedes implementar la lógica de rechazo para cada tarjeta
      });
      // Limpiar selección después de rechazar
      clearTimeout(this.longPressTimer); // Cancelar el temporizador
      this.isSelecting = false;
      this.selectedTarjetas = [];
    }
  }
  
  deseleccionarTodos() {
    this.selectedTarjetas = [];
    this.isSelecting = false;
    clearTimeout(this.longPressTimer); // Cancelar el temporizador
  }
}

