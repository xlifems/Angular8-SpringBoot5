import { Component, OnInit } from '@angular/core';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import { ModalService } from './detalle/modal.service';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { from } from 'rxjs';
import { AuthService } from '../usuarios/auth.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {

  clientes: Cliente[];
  paginador: any;
  clienteSeleccionado: Cliente;

  constructor(private clienteService: ClienteService,
    public modalService: ModalService,
    public authService: AuthService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {

    this.activatedRoute.paramMap.subscribe(
      params => {
        let page: number = +params.get('page');
        if (!page) {
          page = 0;
        }
        this.clienteService.getClientes(page).subscribe(
          response => {
            this.clientes = response.content as Cliente[];
            this.paginador = response;
          }
        );
      }
    );

    //Nos suscribimos al emisor del evento del cargado de la foto, el cual emite un cliente actualizado
    this.modalService.notificarUpload.subscribe( cliente => {
      this.clientes = this.clientes.map( clienteOriginal => {
        if (clienteOriginal.id == cliente.id){
          clienteOriginal.foto = cliente.foto;
        }
        return clienteOriginal;
      })      
    });
  }

  /**
   * Otra forma by me
   */
  getClientes() {
    let page = 0;
    this.clienteService.getClientes(page).subscribe(
      clientes => {
        this.clientes = clientes;
        console.log(clientes);
      },
      err => {
        console.log(err.status);
      }
    );
  }

  deleteCliente(cliente: Cliente): void {
    Swal.fire({
      title: 'Estas Seguro?',
      text: `Estas seguro de eliminar el cliente ${cliente.nombre} ${cliente.apellido}`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Eliminar!',
      cancelButtonText: 'Cancelar!'
    }).then((result) => {
      if (result.value) {
        this.clienteService.deleteCliente(cliente.id).subscribe(
          response => {
            Swal.fire(
              'Cliente Eliminado!',
              `Cliente ${cliente.nombre} ha sido eliminado con éxito.`,
              'success'
            )
            this.clientes = this.clientes.filter(cli => cli !== cliente);
            console.log("delete ", cliente);
          },
          err => {
            console.log(err.status);
          }
        );

      }
    })
  }

  abrirModal(cliente: Cliente) {
    this.clienteSeleccionado = cliente;
    this.modalService.abrirModal();
    console.log(this.clienteSeleccionado);
  }


}
