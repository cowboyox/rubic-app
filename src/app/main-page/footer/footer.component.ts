import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer-main-page',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterMainPageComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
  public onSubmit(form) {
    form.submit();
  }
}
