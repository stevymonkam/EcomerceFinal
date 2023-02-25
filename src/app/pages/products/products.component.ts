import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CatelogueService } from 'src/app/service/catelogue/catelogue.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup } from '@angular/forms';
import { FormValidationService } from 'src/app/service/validation/form-validation.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  products: any;
  dataSource: any;
  @Input() myData: string[] | undefined;
  //displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  displayedColumns: string[] = ['id', 'name', 'description', 'currentprice', 'promotion', 'button'];
  imgArray = new Array();
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  catchFileType: any;
  imageToShow: any;
  isImageLoading: boolean | undefined;
  @Input() being: EventEmitter < any > = new EventEmitter < any > ();
  category: any;
  currentCategorie: any;
  currentProduct: any;
  editPhoto: boolean | undefined;
  progress: { percentage: number } = { percentage: 0 };
  currentFileUpload: any;
  selectedFile = null;
  selectedFiles: any;
  currentId: any;
  productModal: any;
  idcat: any;
  flagCat: boolean = false;
  closeResult: string = '';
  flagp: boolean = true;
  fa: FormGroup;
  submitted: boolean = false;

 
 // flag_product: boolean = true;


  constructor(public catService: CatelogueService,   private toastrService: ToastrService, private route: ActivatedRoute, private router: Router,private modalService: NgbModal, private validationService: FormValidationService) {
    this.fa = this.validationService.detaglioProductForm(null, '');
    this.productModal = null;
  }

  ngOnInit(): void {
      this.getCategories();
      this.getProducts();
      this.being.emit('anything');
      this.imageToShow = null;
     
      

      this.router.events.subscribe((val) => {
          if (val instanceof NavigationEnd) {
              let url = val.url;
              console.log(url);
              let p1 = this.route.snapshot.params['p1'];

              if (p1 == 1) {
                  this.currentCategorie = undefined;
                  this.getProducts();

              } else if (p1 == 2) {

                  let idcat = this.route.snapshot.params['p2'];

                  console.log(idcat);
                  this.getCategorieById(idcat - 1);

              }

          }
      });
  }
  getProductsByCat(c: any) {
      this.currentCategorie = c;
      this.router.navigateByUrl('/products/2/' + c.id);
  }
  showToaster(){
    //alert('1')
    
}
public showSuccess(): void {
    this.toastrService.success('Message Success!', 'Title Success!');
  }

  public showInfo(): void {
    this.toastrService.info('Message Info!', 'Title Info!');
  }

  public showWarning(): void {
    this.toastrService.warning('Message Warning!', 'Title Warning!');
  }

  public showError(): void {
    this.toastrService.error('Message Error!', 'Title Error!');
  }
  getCategories() {
      this.catService.getResource().then((data) => {
          this.category = data.listcat;
          console.log("list cat sucess");
          console.log(data);
          console.log(this.category );
      }).catch((error) => {
          console.log("il ya erreur");
      });
  }
  getCategorieById(id: any) {
      this.catService.getResource().then((data) => {
          this.products = data.listcat[id].products;
          console.log("list cat sucess by id");
          console.log(this.products);
      }).catch((error) => {
          console.log("il ya erreur by idddddd");
      });
  }
  getProducts() {
      this.catService.getProducts().then((data) => {
          this.products = data.listp;
          this.dataSource = new MatTableDataSource(this.products)
          this.dataSource.paginator = this.paginator;
          console.log("list product sucess");
          console.log(data);
      }).catch((error) => {
          console.log("il ya erreur");
      });
  }
  createImageFromBlob(image: Blob, id: any) {
      console.log("idddddd eccoooo");
      console.log(id);
      let reader = new FileReader();
      reader.addEventListener("load", () => {
          this.imageToShow = reader.result;
          this.imgArray[id] = new Image();
          this.imgArray[id].src = this.imageToShow;
          console.log("image showwww");
          console.log(this.imageToShow);

      }, false);

      if (image) {
          reader.readAsDataURL(image);
      }
  }
  getImageFromService(id: any) {
      this.isImageLoading = true;
      this.catService.getPhoto(id).subscribe(data => {
          this.createImageFromBlob(data, id);
          this.isImageLoading = false;
      }, error => {
          this.isImageLoading = false;
          console.log(error);
      });
  }
  openEditModal2(id: any) {
      console.log("voici l'id")
      console.log(id)
  }
  pathUpload(id1: any) {
      console.log("voici l'id1")
      console.log(id1)
  }
  onEditPhoto(p: any){
    this.currentProduct=p;
    this.editPhoto=true;
  }
  onSelectedFile(event: any){
     this.selectedFiles = event.target.files;
  }
  createProduct(){
    //this.flag_product=false;
   this.flagp = true;
    
    //console.log(this.flag_create_product);
    //console.log(this.flag_product);
    //this.router.navigate(['create-product']);

  }

    /*openModal(targetModal:any){
    console.log("voiciiiii l'idd  16/2/2023");
    console.log(targetModal);
    this.getImageFromService(targetModal.id);
    this.currentProduct=targetModal;
   

  }*/
  async saveProduct(){
    console.log("info sur fa");
    console.log(this.fa);
    await this.catService.create(this.fa.value).then((data: any) => {
       
         
        console.log("voici les data");
        console.log(data);

    }).catch((error: any) => {
        console.log(error);
      })

  }


  
  async upload() {
        if(this.flagCat==false){
            alert('please insert category');
        }
        console.log("voiciiiii l'idd  prod et cat");
        console.log(this.currentProduct.id);
        console.log(this.idcat);
        this.progress.percentage = 0;
        this.currentFileUpload = this.selectedFiles.item(0);
        await this.catService.uploadPhotoProduct(this.currentFileUpload, this.currentProduct.id, this.idcat).then((data: any) => {
            
            
                 alert('File Successfully Uploaded');
                 this.getImageFromService(this.currentProduct.id);
                 this.idcat = null;
                 this.flagCat = false;
                 this.selectedFiles = undefined;
                 this.currentProduct=null;
                 this.category=null;
                 this.getCategories();

  
        }).catch((error: any) => {
          console.log(error);
        })
  
    }
    selectFile(event: any) {
      this.selectedFiles = event.target.files;
      }
      onChange(event: any){
        this.idcat = event;
        this.flagCat = true;
        console.log("voicii les categories .............................. +++++++++++++++++");
        console.log(event);

      }

    }
function id(id: any) {
  throw new Error('Function not implemented.');
}

