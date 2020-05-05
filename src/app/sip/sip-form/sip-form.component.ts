import {
  Component, EventEmitter, Input, OnInit, Output, ViewChild, ComponentFactoryResolver,
  AfterViewInit, Type
} from '@angular/core';
import {Application} from '../../services/api/model/application';
import {AppDynComponentDirective} from './dynamic-component-host.directive';
import {Platforms} from '../../services/api/model/platforms.enum';
import {SipFormPgComponent} from './pg-impl/sip-form-pg.component';
import {SipFormIaComponent} from './ia-impl/sip-form-ia.component';
import {SipFormDataComponent} from './data-impl/sip-form-data.component';
import {SipFormI} from './sip-form-i';
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {CommunicationService} from '../../services/communication.service';
import {AlertsService} from '../../alerts/alerts.service';

@Component({
  selector: 'app-sip-form',
  templateUrl: './sip-form.component.html'
})
export class SipFormComponent implements OnInit {
  @Input()  public application: Application;
  @Input()  public parentFolder: string;
  @Input()  public docId: string;
  @Input()  public typeId: string;
  @Input()  public implName: string;
  @Input()  public mode: boolean;
  @Input()  public isSystem: boolean;

  onSubmit: EventEmitter<string> = new EventEmitter<string>();
  formTitle: string;
  formIsValid = true;
  roles: string[] = [];
  showEditJson = false;
  showRemove = false;
  showEdit = false;

  private subForm: SipFormI;


  @ViewChild(AppDynComponentDirective) formContainer: AppDynComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver, public bsModalRef: BsModalRef,
              private commService: CommunicationService, private alertsService: AlertsService) { }


  ngOnInit(): void {
    this.commService.get('roles').subscribe((val) => {
      this.roles = val;
    });
  }

  public afterParamsSet(): void {
    let componentType: Type<SipFormI>;

    if (this.implName === SipFormDataComponent.code) {
      componentType = SipFormDataComponent;
      this.showEditJson = false;
    } else if (!this.application || this.application.platform === Platforms.PG) {
      componentType = SipFormPgComponent;
    } else {
      componentType = SipFormIaComponent;
    }

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);

    const viewContainerRef = this.formContainer.viewContainerRef;

    viewContainerRef.clear();
    this.subForm = <SipFormI>viewContainerRef.createComponent(componentFactory).instance;
    this.subForm.application = this.application;
    if (this.parentFolder) {
      this.subForm.parentFolderId = this.parentFolder;
    }
    if (this.typeId) {
      this.subForm.docTypeId = this.typeId;
    }
    this.subForm.docId = this.docId;
    this.subForm.mode = this.mode;
    this.subForm.isSystem = this.isSystem;
    this.subForm.onAfterCreated();

    this.subForm.onTitleChange.subscribe((title: string) => this.setTitle(title));
    this.subForm.onValidChange.subscribe((value: boolean) => { this.formIsValid = value; });
    this.subForm.onAclSet.subscribe((value) => {
      this.checkAcl(value);
    });

  }

  public setTitle(title: string): void {
    this.formTitle = title;
  }

  public submit(): void {
    this.subForm.submit().subscribe((id: string) => {
      this.onSubmit.emit(id);
      this.bsModalRef.hide();
    });
  }

  public edit(): void {
    this.subForm.changeMode(
      this.mode = true
    );
  }

  public remove(): void {
    this.alertsService.confirm({title: 'actions.remove', text: 'document.confirm.remove'})
      .subscribe((result) => {
      if (result === 'yes') {
        this.subForm.remove().subscribe((id: string) => {
          this.bsModalRef.hide();
          this.onSubmit.emit('removed');
        });
      }
    });
  }

  public editJson(): void {
    this.mode = true;
    this.implName = SipFormDataComponent.code;
    this.afterParamsSet();
  }

  private checkAcl(docAcl: {edit: boolean, remove: boolean, full: boolean}): void {
    this.showRemove = docAcl.remove;
    this.showEdit = docAcl.edit;

    if (this.roles.indexOf('admin') > -1) {
      if (docAcl.full) {
        this.showEditJson = true;
      }
    }
  }
}
