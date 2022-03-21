import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { TuiSizeXL, TuiSizeXS } from '@taiga-ui/core/types/size';

@Component({
  selector: 'app-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconButtonComponent {
  public _disabled: boolean;

  public _border: boolean;

  @Input() public buttonSize: TuiSizeXS | TuiSizeXL = 'xl';

  @Input() icon: string;

  @Input() scale: number = 1;

  @Input() label: string;

  @Input('disabled') set setDisabled(disabled: boolean | '') {
    this._disabled = disabled === '' || disabled;
  }

  @Input('border') set setBorder(border: boolean | '') {
    this._border = border === '' || border;
  }

  @Output()
  iconButtonClick = new EventEmitter<void>();

  public onClick(): void {
    this.iconButtonClick.emit();
  }

  constructor() {}
}
