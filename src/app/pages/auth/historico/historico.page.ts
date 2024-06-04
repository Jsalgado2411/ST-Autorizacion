import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { Observable, map } from 'rxjs';
import { ResultTerminal } from 'src/app/interfaces';
import { SharedService } from 'src/app/services/shared.service';
import { STApiService } from 'src/app/services/stapi.service';
import { ModalHistoricoComponent } from 'src/app/shared/components/modal-historico/modal-historico.component';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.page.html',
  styleUrls: ['./historico.page.scss'],
})
export class HistoricoPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  tarjetasDemo: any[] = [];
  Totaltarjetas: any[] = [];
  userData: any = {};
  showRefreshLabel = true;
  todasTarjetasConViaticosIgualesACero: boolean = false;
  selectedOption: string = 'Pendientes';
  selectedCountry: any;
  selectedCity: any;
  selectedDate: string | null = null;
  selectedDateFinal: string | null = null;
  terminals: any = {}; // Almacena los resultados del método getTerminals
  minDate: string;
  maxDate: string;
  
  constructor(
              private modalController: ModalController,
              private stapiService : STApiService,
              private sharedService: SharedService)
              {
                const today = new Date();
                this.maxDate = today.toISOString(); // Fecha máxima es la fecha actual
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(today.getDate() - 7); // Restar 7 días a la fecha actual
                this.minDate = sevenDaysAgo.toISOString();
              }
  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
    // this.DataHistoricoAuth();
    this.getTerminales();
  }
  getDisabledDates() {
    let disabledDates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const previousDate = new Date();
      previousDate.setDate(today.getDate() - i);
      disabledDates.push(previousDate.toISOString());
    }
    return disabledDates;
  }
  
  async abrirModal(index: number) {
    const tarjeta = this.tarjetasDemo[index];
    const modal = await this.modalController.create({
      component: ModalHistoricoComponent,
      componentProps: {
        tarjeta: tarjeta,
      },
    });
    return await modal.present();
  }

  async handleRefresh(event: any) {
    this.showRefreshLabel = false;
    await this.DataHistoricoAuth();
    event.target.complete();
  }

  async DataHistoricoAuth() {      
    if(this.selectedCountry !==null && this.selectedDate !==undefined && this.selectedDateFinal !==undefined){
      const terminalVal = this.selectedCountry.nom_terminal; //OBTIENE EL VALOR DE MI SELECTED
      const fechaInicial = this.selectedDate ? this.selectedDate.substring(0, 10) : undefined;
      const fechaFinal = this.selectedDateFinal ? this.selectedDateFinal.substring(0, 10) : undefined;
      try {
        
            const userData = await this.stapiService.GetHisAuth(terminalVal, fechaInicial, fechaFinal).toPromise();
            console.log('Datos del historico:', userData);            
            this.userData = userData;
            this.tarjetasDemo = Array.isArray(this.userData.result) ? this.userData.result.slice(0, 20) : [];
            this.Totaltarjetas = Array.isArray(this.userData.result) ? this.userData.result : [];
            console.log('Total de tarjetas', this.tarjetasDemo.length);
            console.log('Total de tarjetas completas', this.Totaltarjetas.length);
          } catch (error) {
          console.error('Error al realizar la solicitud:', error);
        }
      }
      else{
        console.error('Un dato de los selectd es null');        
      }
  }

  onIonInfinite(){
    console.log('Se llamo al infinite');
    setTimeout(() => {
      if(this.tarjetasDemo.length > this.userData.result.length){
        this.infiniteScroll.complete();
        this.infiniteScroll.disabled = true;
        return;
      }
      const additionalCards = this.userData.result.slice(this.tarjetasDemo.length, this.tarjetasDemo.length + 20);
      this.tarjetasDemo = this.tarjetasDemo.concat(additionalCards);
      this.infiniteScroll.complete();
    }, 1500);    
  }
  handleInput(event: any){
    const query = event.target.value.toLowerCase().trim();
    if (query === '') {
      this.tarjetasDemo = [...this.userData.result];
    } else {
      this.tarjetasDemo = this.tarjetasDemo.filter((tarjeta) => {
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
  
  handleDateChange(event: any) {
    if (event.detail.value === 'selectNew') {
      // Si el usuario selecciona "Seleccionar nueva fecha", restablece la fecha seleccionada a nula para mostrar el ion-datetime
      this.selectedDate = null;
    }
  }
  handleDateChange2(event: any) {
    if (event.detail.value === 'selectNew') {
      // Si el usuario selecciona "Seleccionar nueva fecha", restablece la fecha seleccionada a nula para mostrar el ion-datetime
      this.selectedDateFinal = null;
    }
  }
  async dateSelected(event: any) {
    this.selectedDate = event.detail.value;
    console.log('selectedCountry:', this.selectedCountry);
    console.log('selectedDate:', this.selectedDate);
    console.log('selectedDateFinal:', this.selectedDateFinal);
  }

  async getTerminales() {
    try {
      const terminales = await this.stapiService.get_terminals().toPromise();
      // console.log('Datos sin filtro', terminales);      
      this.terminals = terminales;
        // console.log('Datos de terminales', this.terminals.result);    
    } catch (error) {
      console.error('Error al obtener los datos de terminales:', error);
    }
  }

}
