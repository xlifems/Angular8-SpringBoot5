import { Component, OnInit, Input } from '@angular/core';
import { Cliente } from '../cliente';
import { ClienteService } from '../cliente.service';
import { ModalService } from './modal.service';
import Swal from 'sweetalert2';
import { HttpEventType } from '@angular/common/http';
import { AuthService } from '../../usuarios/auth.service';



@Component({
  selector: 'detalle-cliente',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.css']
})
export class DetalleComponent implements OnInit {

  @Input() cliente: Cliente;
  titulo: string = "Detalle del Cliente";
  private fotoSeleccionada: File;
  progreso: number;

  constructor(private clienteService: ClienteService, 
    private modalService: ModalService, private authService: AuthService) { }

  ngOnInit() {
    
  }

  seleccionarArchivo(event) {
    this.fotoSeleccionada = event.target.files[0];
    this.progreso = 0;
    console.log(this.fotoSeleccionada);
    if (this.fotoSeleccionada.type.indexOf('image') < 0){
      this.fotoSeleccionada = null;
      Swal.fire('Error Tipo Archivo', `El archivo seleccionado no es una imagen`, 'error');
    }
  }

  subirFoto() {
    if (!this.fotoSeleccionada) {
      Swal.fire('Error Upload', `Debe seleccionar una foto`, 'error');
    } else {
      this.clienteService.subirFoto(this.fotoSeleccionada, this.cliente.id).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress){
          this.progreso = Math.round((event.loaded / event.total)* 100 );
        } else if (event.type === HttpEventType.Response) {
          let response:any = event.body;
          this.cliente = response.cliente as Cliente;

          // Iniciamos la emicion del cambio de la foto
          this.modalService.notificarUpload.emit(this.cliente);

          Swal.fire('Foto subida completamente', response.mensaje , 'success');
        }      
        
      });
    }
  }

  cerrarModal(){
    this.fotoSeleccionada = null;
    this.progreso = 0;
    this.modalService.cerrarModal();
  }

}
