import {MimeIconPipe} from './pipes/mime-icon.pipe';
import {FileSizePipe} from './pipes/file-size.pipe';
import {DateTimeFormatPipe} from './pipes/date-time-format.pipe';
import {DateFormatPipe} from './pipes/date-format.pipe';
import {NgModule} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {LimitToPipe} from './pipes/limit-to.pipe';


// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    FileSizePipe,
    MimeIconPipe,
    DateFormatPipe,
    DateTimeFormatPipe,
    LimitToPipe
  ],
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  providers: [ FileSizePipe, MimeIconPipe, DateFormatPipe, DateTimeFormatPipe, LimitToPipe ],
  exports: [ FileSizePipe, MimeIconPipe, DateFormatPipe, DateTimeFormatPipe, TranslateModule, LimitToPipe ]
})

export class SharedModule {}
