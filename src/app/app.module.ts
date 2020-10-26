import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS  } from '@angular/common/http';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TreeModule } from 'angular-tree-component';
import {
  Bootstrap3Framework,
  Bootstrap3FrameworkModule, Framework, FrameworkLibraryService, JsonSchemaFormModule, JsonSchemaFormService,
  WidgetLibraryService
} from 'angular2-json-schema-form';
import { PrettyJsonModule } from 'angular2-prettyjson';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {TabsModule} from 'ngx-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import { NgProgressModule, NgProgressInterceptor } from 'ngx-progressbar';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { VgCoreModule } from 'videogular2/core';
import { VgControlsModule } from 'videogular2/controls';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { VgBufferingModule } from 'videogular2/buffering';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import {TagsInputModule } from 'ngx-tags-input/dist';

import {SharedModule} from './shared.module';

import {XsdParserService} from './services/util/xsd.parser.service';
import {ApiService} from './services/api/api.service';
import {ApiHttpInterceptor} from './services/api/http.interceptor';
import {AuthService} from './services/api/auth.service';
import {AuthGuard} from './services/api/auth.guard';
import {CommunicationService} from './services/communication.service';
import {XformParserService} from './services/util/xform-parser.service';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ApplicationsListComponent } from './applications-list/applications-list.component';
import { SearchesComponent } from './applications-list/searches/searches.component';
import { SearchFormComponent } from './applications-list/searches/search-form/search-form.component';

import { LoginComponent } from './login/login.component';
import { TypeSelectComponent } from './type/type-select/type-select.component';
import {TypeSelectService} from './type/type.service';

import { ApplicationTreeComponent } from './applications-list/searches/application-tree/application-tree.component';

import { ObjectsListComponent } from './objects-list/objects-list.component';
import { ObjectsListCellComponent } from './objects-list/objects-list-cell/objects-list-cell.component';

import { SipFormComponent } from './sip/sip-form/sip-form.component';
import {SipFormPgComponent} from './sip/sip-form/pg-impl/sip-form-pg.component';
import {SipFormIaComponent} from './sip/sip-form/ia-impl/sip-form-ia.component';
import { SipFormDataComponent } from './sip/sip-form/data-impl/sip-form-data.component';
import {QuestionControlService} from './sip/sip-form/ia-impl/dynamic-form/services/question-control.service';
import {AttachmentsComponent} from './sip/attachments/attachments.component';
import {DynamicFormQuestionComponent } from './sip/sip-form/ia-impl/dynamic-form/dynamic-form-question.component';
import {AppDynComponentDirective } from './sip/sip-form/dynamic-component-host.directive';
import {SipService} from './sip/sip.service';
import {PreviewService} from './sip/preview/preview.service';
import {SipFormI} from './sip/sip-form/sip-form-i';
import {PreviewI} from './sip/preview/preview-i';

import { TypesManageComponent } from './type/types-manage/types-manage.component';
import { TypesTreeComponent } from './type/types-manage/types-tree/types-tree.component';
import { TypeEditComponent } from './type/types-manage/type-edit/type-edit.component';
import { FoldersManageComponent } from './folder/folders-manage/folders-manage.component';
import { FoldersTreeComponent } from './folder/folders-manage/folders-tree/folders-tree.component';
import { FolderEditComponent } from './folder/folder-edit/folder-edit.component';
import {FolderService} from './folder/folder.service';
import { FolderEditDialogComponent } from './folder/folder-edit-dialog/folder-edit-dialog.component';
import { AceEditorDirective } from './sip/sip-form/data-impl/ace-editor.directive';
import {TypeSelectWidgetComponent} from './form-widgets/type-select-widget.component';
import {DatePickerWidgetComponent} from './form-widgets/date-picker-widget.component';
import {PermissionsWidgetComponent} from './form-widgets/permissions-widget.component';
import {AuditWidgetComponent} from './form-widgets/audit-widget.component';
import {StorageManageComponent } from './storage-manage/storage-manage.component';
import {TypeaheadWidgetComponent } from './form-widgets/typeahead-widget.component';
import {SystemService} from './sip/system.service';
import {UsersManageComponent} from './users/users-manage.component';
import {UserEditComponent} from './users/user-edit/user-edit.component';
import {UserService} from './users/user.service';
import {GroupEditComponent} from './users/group-edit/group-edit.component';
import {GroupService} from './users/group.service';
import {SearchFormService} from './applications-list/searches/search-form/search-form.service';
import {environment} from '../environments/environment';
import {StickyHeaderDirective} from './objects-list/sticky-header.directive';
import {ResizeService} from './services/util/resize.service';
import {ObjectsListSetupDialogComponent} from './objects-list/setup/setup-dialog.component';
import {ObjectsListSetupService} from './objects-list/setup/objects-list-setup.service';
import {AlertDialogComponent} from './alerts/alert-dialog/alert-dialog.component';
import {AlertsService} from './alerts/alerts.service';
import {ProcessesManageComponent} from './processes-manage/processes-manage.component';
import {ExportsManageComponent} from './exports-manage/exports-manage.component';
import {FormsManageComponent} from './forms-manage/forms-manage.component';
import { SipFormPgTabComponent } from './sip/sip-form/pg-impl/sip-form-pg-tab.component';
import {arLocale, defineLocale, frLocale, ruLocale} from 'ngx-bootstrap';
import {ExportDialogComponent} from './applications-list/searches/export/export-dialog.component';
import {ExportService} from './applications-list/searches/export/export.service';
import {FacetsComponent} from './applications-list/searches/facets/facets.component';
import {PreviewDialogComponent} from './sip/preview/preview-dialog.component';
import {PreviewVideoComponent} from './sip/preview/video-impl/preview-video.component';
import {PreviewPictureComponent} from './sip/preview/picture-impl/preview-picture.component';
import {PreviewPdfComponent} from './sip/preview/pdf-impl/preview-pdf.component';


defineLocale('ru', ruLocale);
defineLocale('fr', frLocale);
defineLocale('ar', arLocale);

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    ApplicationsListComponent,
    SearchesComponent,
    DynamicFormQuestionComponent,
    SearchFormComponent,
    LoginComponent,
    TypeSelectComponent,
    TypeSelectWidgetComponent,
    AttachmentsComponent,
    ApplicationTreeComponent,
    ObjectsListComponent,
    ObjectsListCellComponent,

    SipFormComponent,
    SipFormPgComponent,
    SipFormIaComponent,
    AppDynComponentDirective,

    TypesManageComponent,
    TypesTreeComponent,
    TypeEditComponent,
    FoldersManageComponent,
    FoldersTreeComponent,
    FolderEditComponent,
    FolderEditDialogComponent,
    SipFormDataComponent,
    AceEditorDirective,
    StorageManageComponent,
    DatePickerWidgetComponent,
    UsersManageComponent,
    UserEditComponent,
    GroupEditComponent,
    StickyHeaderDirective,
    ObjectsListSetupDialogComponent,
    AlertDialogComponent,
    PermissionsWidgetComponent,
    AuditWidgetComponent,
    ProcessesManageComponent,
    ExportsManageComponent,
    TypeaheadWidgetComponent,
    FormsManageComponent,
    SipFormPgTabComponent,
    ExportDialogComponent,
    FacetsComponent,
    PreviewDialogComponent,
    PreviewVideoComponent,
    PreviewPictureComponent,
    PreviewPdfComponent
  ],
  imports: [
    SharedModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BsDropdownModule.forRoot(),
    TreeModule,
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    BrowserModule, Bootstrap3FrameworkModule,
    {
      ngModule: JsonSchemaFormModule,
      providers: [
        JsonSchemaFormService,
        FrameworkLibraryService,
        WidgetLibraryService,
        {provide: Framework, useClass: Bootstrap3Framework, multi: true}
      ]
    },
    NgxPaginationModule,
    PrettyJsonModule,
    NgProgressModule,
    BsDatepickerModule.forRoot(),
    RouterModule.forRoot([
      { path: '',   redirectTo: '/applications', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'applications', component: ApplicationsListComponent, canActivate: [AuthGuard] },
      { path: 'applications/:app_uuid', component: SearchesComponent, canActivate: [AuthGuard] },
      { path: 'admin/types', component: TypesManageComponent },
      { path: 'admin/folders', component: FoldersManageComponent },
      { path: 'admin/storage', component: StorageManageComponent },
      { path: 'admin/users', component: UsersManageComponent },
      { path: 'admin/processes', component: ProcessesManageComponent },
      { path: 'admin/export', component: ExportsManageComponent },
      { path: 'admin/forms', component: FormsManageComponent },
      { path: '**', component: PageNotFoundComponent }
    ], { useHash: environment.useHashLocationStrategy}),
    TagsInputModule.forRoot(),
    TypeaheadModule.forRoot(),
    InfiniteScrollModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    PdfViewerModule
  ],
  providers: [AuthGuard, ApiService, SipService, PreviewService, XsdParserService, XformParserService, AuthService, SystemService, UserService, GroupService,
              QuestionControlService, CommunicationService, TypeSelectService, FolderService, SearchFormService,
              ResizeService, ObjectsListSetupService, AlertsService, ExportService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiHttpInterceptor,
      multi: true,
    },
    { provide: HTTP_INTERCEPTORS, useClass: NgProgressInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  entryComponents: [TypeSelectComponent, TypeSelectWidgetComponent, DatePickerWidgetComponent, SipFormComponent, UserEditComponent, GroupEditComponent,
    SipFormPgComponent, SipFormIaComponent, SipFormDataComponent, TypesTreeComponent, FolderEditDialogComponent, FolderEditComponent, SearchFormComponent,
    ObjectsListSetupDialogComponent, AlertDialogComponent, PermissionsWidgetComponent, AuditWidgetComponent, TypeaheadWidgetComponent, ExportDialogComponent,
    PreviewDialogComponent, PreviewVideoComponent, PreviewPictureComponent, PreviewPdfComponent]
})
export class AppModule { }
