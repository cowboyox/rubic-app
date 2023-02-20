import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit } from '@angular/core';
import { TuiDestroyService, TuiDialog, TuiSwipe } from '@taiga-ui/cdk';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { ModalStates } from '../../models/modal-states.enum';
import { takeUntil, delay, tap } from 'rxjs/operators';
import { switchMap } from 'rxjs';
import { ModalService } from '../../services/modal.service';
import { IMobileNativeOptions } from '../../models/mobile-native-options';
import { animationTimeout } from '../../utils/animation-timeout';

@Component({
  selector: 'app-mobile-native-modal',
  templateUrl: './mobile-native-modal.component.html',
  styleUrls: ['./mobile-native-modal.component.scss'],
  providers: [TuiDestroyService],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MobileNativeModalComponent implements OnInit {
  public title: string = this.context.title;

  public state: ModalStates;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    readonly context: TuiDialog<IMobileNativeOptions, void>,
    private readonly destroy$: TuiDestroyService,
    private readonly modalService: ModalService,
    private readonly el: ElementRef<HTMLElement>
  ) {
    if (this.context.forceClose$) {
      this.context.forceClose$.pipe(takeUntil(this.destroy$)).subscribe(() => {
        if (this.state === ModalStates.HIDDEN) {
          this.state = ModalStates.OPENED;
          this.show();
        } else {
          this.hide();
          animationTimeout(this.context.completeWith);
        }
      });
    }

    if (this.context.nextModal$) {
      this.context.nextModal$
        .pipe(takeUntil(this.destroy$))
        .pipe(
          tap(() => {
            this.state = ModalStates.HIDDEN;
            this.hide();
          }),
          delay(300),
          switchMap(nextModal =>
            this.modalService.openNextModal(
              nextModal.component,
              {
                title: nextModal.title,
                fitContent: nextModal.fitContent,
                scrollableContent: nextModal.scrollableContent,
                previousComponent: true
              },
              nextModal.injector
            )
          ),
          tap(() => this.show())
        )
        .subscribe();
    }
  }

  ngOnInit(): void {
    animationTimeout(() => this.show());
  }

  public toggle(): void {
    if (this.context.fitContent) {
      this.hide();
      animationTimeout(this.context.completeWith);
      return;
    }

    if (this.state === ModalStates.COLLAPSED) {
      this.state = ModalStates.OPENED;
      this.expand();
    } else {
      this.state = ModalStates.COLLAPSED;
      this.collapse();
    }
  }

  public close(): void {
    this.hide();
    animationTimeout(this.context.completeWith);
  }

  public onSwipe(swipe: TuiSwipe): void {
    if (swipe.direction === 'top' && this.state === ModalStates.COLLAPSED) {
      this.state = ModalStates.OPENED;
      this.expand();
    } else if (swipe.direction === 'bottom' && this.state === ModalStates.OPENED) {
      this.state = ModalStates.COLLAPSED;
      this.collapse();
    } else if (swipe.direction === 'bottom' && this.state === ModalStates.COLLAPSED) {
      this.close();
    }
  }

  private hide(): void {
    this.el.nativeElement.classList.add('hidden');
    this.el.nativeElement.classList.remove('opened');
    this.el.nativeElement.classList.remove('collapsed');
  }

  private show(): void {
    this.el.nativeElement.classList.remove('hidden');
    if (this.context.fitContent) {
      this.el.nativeElement.classList.add('fit-content');
    } else {
      this.el.nativeElement.classList.add('opened');
    }
    if (this.context.scrollableContent) {
      this.el.nativeElement.classList.add('scrollable-content');
    }
  }

  private collapse(): void {
    this.el.nativeElement.classList.add('collapsed');
    this.el.nativeElement.classList.remove('opened');
  }

  private expand(): void {
    this.el.nativeElement.classList.remove('collapsed');
    this.el.nativeElement.classList.add('opened');
  }
}
