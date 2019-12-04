import { Component, OnInit } from '@angular/core';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { map } from 'rxjs/operators';
import { Region } from './region';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  titulo: String = 'Crear Cliente';
  public cliente: Cliente = new Cliente();
  errores: String[];
  regiones: Region[];

  constructor(private clienteService: ClienteService,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.cargarcliente();
    this.clienteService.getRegiones().subscribe(regiones => this.regiones = regiones as Region[]);

  }

  cargarcliente(): void {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id'];
      if (id) {
        this.clienteService.getCliente(id).subscribe(
          (response) => {
            this.cliente = response;
          },
          err => {
            console.log(err.status);
          }
        );
      }
    });



  }

  public create(): void {
    this.clienteService.create(this.cliente)
      .subscribe(
        response => {
          this.router.navigate(['/clientes']);
          Swal.fire('Nuevo Cliente!', `El cliente ${response.nombre} ha sido creado con éxito.`, 'success');
        },
        err => {
          this.errores = err.error.errors as String[];
          console.log(err.error.errors);
          console.log('Codido de errors desde el backen ' + err.status);
        }
      );
    console.log('ok create');

  }

  /**
   * 
   */
  public update(): void {
    this.cliente.facturas = null;
    this.clienteService.updateCliente(this.cliente).subscribe(
      response => {
        this.router.navigate(['/clientes']);
        console.log('ok update', response);
        Swal.fire('Actualizar Cliente!', `${response.mensaje}: ${response.cliente.nombre}`, 'success');
      },
      err => {
        this.errores = err.error.errors as String[];
        console.log(err.error.errors);
        console.log('Codido de errors desde el backen ' + err.status);
      }
    );

  }

  compararRegion(o1: Region, o2: Region): boolean {
    if (o1 === undefined && o2 === undefined ){
      return true;
    }

    return o1 === null || o2 === null || o1 === undefined || o2 === undefined ? false : o1.id === o2.id;
  }
}
