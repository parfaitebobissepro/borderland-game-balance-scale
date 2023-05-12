import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-response-card',
  templateUrl: './response-card.component.html',
  styleUrls: ['./response-card.component.scss']
})
export class ResponseCardComponent {
  @Input() number?: number = 100;
}
