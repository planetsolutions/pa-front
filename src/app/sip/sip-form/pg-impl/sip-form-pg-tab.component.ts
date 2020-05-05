import {
  Compiler, Component, ComponentRef, Injector, Input, ModuleWithComponentFactories, NgModule, OnInit, Type,
  ViewContainerRef
} from '@angular/core';
import {SystemDoc, Doc, Application} from '../../../index';
import {ApiService} from '../../../services/api/api.service';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../../shared.module';
import {SipService} from '../../sip.service';

@Component({
  selector: 'app-sip-form-pg-tab',
  template: `
    <div [ngClass]="{hidden: !isLoading}" class="spinner">
      <div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>

  `
})
export class SipFormPgTabComponent implements OnInit {

  @Input()  public tabId: string;
  @Input()  public doc: Doc;
  @Input()  public application: Application;
  @Input()  public set activeTabId(value: string) {
    if (!this.wasInitOnce && value === this.tabId) {
      this.wasInitOnce = true;
      this.isLoading = true;
      this.initTabConfig();
    }
  }

  isLoading: boolean;
  docId: string;

  private wasInitOnce: boolean;
  private data: any[];
  private compiledQuery;

  compRef: ComponentRef<any>;

  constructor(private vcRef: ViewContainerRef, private compiler: Compiler,
              private api: ApiService, private injector: Injector) { }

  ngOnInit() {
  }

  private initTabConfig() {
    this.api.getSystemDoc(this.tabId, false).subscribe( (tabDoc: SystemDoc) => {
      const tabTemplate = tabDoc.data.template;
      const tabQuery = tabDoc.data.query;

      const query = this.compileTemplate(tabQuery, {doc: this.doc});
      if (query && query !== 'null' && query !== '') {
        this.compiledQuery = query;
        this.api.getObjects(query).subscribe((data: any[]) => {
          this.isLoading = false;
          this.data = data;
          this.compileBody(tabTemplate);

        }, (error) => {
          this.isLoading = false;
        });
      } else {
        this.isLoading = false;
        this.data = null;
        this.compileBody(tabTemplate);
      }

    })
  }

  private compileBody(tabTemplate) {
    this.vcRef.clear();
    this.compRef = null;

    const component = this.createDynamicComponent(tabTemplate, this.tabId);
    const module = this.createDynamicModule(component);
    this.compiler.compileModuleAndAllComponentsAsync(module)
      .then((moduleWithFactories: ModuleWithComponentFactories<any>) => {
        const compFactory = moduleWithFactories.componentFactories.find(x => x.componentType === component);

        this.compRef = this.vcRef.createComponent(compFactory);
        this.setContextProperties();
      })
      .catch(error => {
        console.log(error);
      });
  }

  private compileTemplate(templateString, templateVars) {
    return new Function('var doc = this.doc; return `' + templateString + '`;').call(templateVars);
  }

  private setContextProperties () {
    this.compRef.instance['containerRef'] = this;
    this.compRef.instance['doc'] = this.doc;
    this.compRef.instance['data'] = this.data;
    this.compRef.instance['api'] = this.api;
    this.compRef.instance['openDoc'] = this.openDoc.bind(this);
    this.compRef.instance['reloadData'] = this.reloadData.bind(this);
    this.compRef.instance['serverCall'] = this.serverCall.bind(this);
  }

  private createDynamicComponent (template: string, suffix: string) {
    @Component({
      selector: 'app-custom-dynamic-component-' + suffix,
      template: template,
    })
    class CustomDynamicComponent {}
    return CustomDynamicComponent;
  }

  private createDynamicModule (component: Type<any>) {
    @NgModule({

      imports: [CommonModule, SharedModule],
      declarations: [component]
    })
    class DynamicModule {}
    return DynamicModule;
  }

  private openDoc(id: string): void {
    this.injector.get(SipService).open(id, this.application);
  }

  private serverCall(url: string, refreshData: boolean) {

    this.api.getObjects(url).subscribe(() => {
      if (refreshData) {
        this.reloadData()
      }
    })
  }

  private reloadData() {

    const that = this;
    this.api.getObjects(this.compiledQuery).subscribe((data: any[]) => {

      that.data = data;
      that.compRef.instance['data'] = this.data;

    }, (error) => {

    });
  }

}
