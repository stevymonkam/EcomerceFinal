import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  constructor( private formBuilder: FormBuilder) { }

  detaglioProductForm(detaglioProduct: any, status: any) {
    if (status == "edit") {
    console.log(JSON.stringify(detaglioProduct));
    let formEdit: FormGroup = this.formBuilder.group({
    id_product:[detaglioProduct.id_product, Validators.required],
    id_user:[detaglioProduct.id_user],
    //id_cat:[detagliocontrato.id_cat, {readonly :true}, Validators.required],
    idCat: [detaglioProduct.idCat, Validators.required],
    name: [detaglioProduct.name, Validators.required],
    photoName: [detaglioProduct.photoName, Validators.required],
    description: [detaglioProduct.description],
    promotion: [detaglioProduct.promotion],
    selected: [detaglioProduct.selected],
    available: [detaglioProduct.available],
    currentprice: [detaglioProduct.available],
    });
      return formEdit;
    } else {

    let formAdd: FormGroup = this.formBuilder.group({
    id_product:[''],
    id_user:[''],
    idCat:[''],
    name: ['stevy', Validators.required],
    photoName: ['', Validators.required],
    description: ['', Validators.required],
    promotion: [''],
    selected: [''],
    available: [''],
    currentprice: [''],
    });

      return formAdd;
    }
  }
}
