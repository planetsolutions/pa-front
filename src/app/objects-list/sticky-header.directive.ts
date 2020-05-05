import {Directive, ElementRef, HostListener} from '@angular/core';
import {ResizeService} from '../services/util/resize.service';

@Directive({
  selector: '[appStickyHeader]'
})
export class StickyHeaderDirective {

  private resizingElement;
  private redrawTimer = null;

  constructor(private _element: ElementRef, private resizeService: ResizeService) {

  }

  @HostListener('window:scroll', ['$event'])
  handleScrollEvent(e) {
    if (window.pageYOffset > 100) {
      if (!this._element.nativeElement.classList.contains('stick')) {
        const that = this;
        this.redraw(true);
        this._element.nativeElement.classList.add('stick');
        if (this._element.nativeElement.tagName === 'THEAD') {
          this.resizingElement = this._element.nativeElement.parentNode;
        } else {
          this.resizingElement = this._element.nativeElement;
        }
        this.resizeService.addResizeEventListener(this.resizingElement, (elem) => {
          that.redraw();
        });
      }
    } else {
      this._element.nativeElement.classList.remove('stick');
      if (this.resizingElement) {
        this.resizeService.removeResizeEventListener(this.resizingElement);
      }
    }
  }

  private redraw(force?) {
    const that = this;

    if (!force) {
      if (this.redrawTimer) {
        // console.log('redrawTimer block');
        return;
      };

      this.redrawTimer = window.setTimeout(function () {
        that.redraw(true);
        that.redrawTimer = null;
      }, 500);
      // console.log('redrawTimer set');
      return;
    }


    // console.log('redrawing')
    if (this._element.nativeElement.tagName === 'THEAD') {
      const ths: any[] = this._element.nativeElement.getElementsByTagName('TH');
      if (ths && ths.length > 0) {
        const trs = this._element.nativeElement.parentNode.getElementsByTagName('TR');
        let tds = null;
        if (trs.length > 1) {
          tds = trs[1].getElementsByTagName('TD');
        }
        for (let i = 0; i < ths.length; i++) {
          const width = window.getComputedStyle(tds[i]).width;
    /*      if (i == 0) {
            console.log(tds[i].offsetWidth + " - " + width)
          }*/

          if (tds) {
            ths[i].style.width = tds[i].offsetWidth + 'px';
            tds[i].style.width = tds[i].offsetWidth + 'px';
          } else {
            ths[i].style.width = ths[i].offsetWidth + 'px';
          }
        }
      }
    }
  }
}
