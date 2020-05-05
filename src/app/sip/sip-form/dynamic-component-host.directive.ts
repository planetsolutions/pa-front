import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[appDynComponent]'
})
export class AppDynComponentDirective {


  constructor(public viewContainerRef: ViewContainerRef) { }

}
