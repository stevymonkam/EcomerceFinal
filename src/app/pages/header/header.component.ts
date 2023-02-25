import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentCategorie: undefined;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onSelectedProducts(){
    this.currentCategorie=undefined;
    this.router.navigateByUrl("/products/1/0");
  }

}
