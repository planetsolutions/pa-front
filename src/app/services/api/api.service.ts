import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders, HttpResponse, HttpParams} from '@angular/common/http';
import {LoginParameters, LoginResponse, Token, Application, Flag, Search, Doc, PagedList, XForm,
  SearchResultRow, ResultMaster, SearchComposition, IngestionResponse, CmisObject,
  DocType, AccessGroup, SystemDoc, UserInfo, Tenant, ContentData, ListElement, CmisConstants, SortOptions} from '../../index';
import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {TranslateService} from '@ngx-translate/core';
import {BsLocaleService} from 'ngx-bootstrap/datepicker';
import {AuthService} from './auth.service';

import * as FileSaver from 'file-saver';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/repeat';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/concat';
import {environment} from '../../../environments/environment';


@Injectable()
export class ApiService {
  private LOCAL_STORAGE_STORAGE_KEY = 'store_type';
  private loggedInFlag: Flag;
  // private IAEndpoint = 'http://doccloud.ru';
  private IAEndpoint = environment.IAEndpoint;
  private usePGStore = false;
  private readonly usernameSubject: ReplaySubject<string> = new ReplaySubject(1);
  private tenantId: string;
  private userInfo: UserInfo;
  private readonly LOCAL_STORAGE_USERINFO_KEY = 'user_info';
  private supportedLangs = ['en', 'ru', 'fr', 'ar'];
  private supportedLangsRtl = ['ar'];

  constructor(private httpClient: HttpClient, private router: Router, private translate: TranslateService,
              private authService: AuthService, private bsLocaleService: BsLocaleService) {

    translate.setDefaultLang('en');

    this.loggedInFlag = new Flag('Not logged in!');

    if (this.authService.getAuthToken()) {
      this.loggedInFlag.setWaiting();

      if (this.authService.getUserName()) {
        this.usernameSubject.next(this.authService.getUserName());
      }

      if (window.localStorage.getItem(this.LOCAL_STORAGE_STORAGE_KEY)) {
        this.setStoreType(window.localStorage.getItem(this.LOCAL_STORAGE_STORAGE_KEY));
      }

      this.getTenant().subscribe(() => {
        if (this.tenantId) {
          this.getDocument(this.tenantId).subscribe((doc: Doc) => {
            const theme = (doc.data ? doc.data.theme : null);
            if (theme && theme !== '') {
              this.changeTheme(theme);
            } else {
              this.changeTheme();
            }
          });

          this.loggedInFlag.setReady();
        }
      });
    }
  }

  private setStoreType(type: string): void {
    this.usePGStore = (type === 'PG');
    if(type) {
      window.localStorage.setItem(this.LOCAL_STORAGE_STORAGE_KEY, type);
    } else {
      window.localStorage.removeItem(this.LOCAL_STORAGE_STORAGE_KEY);
    }
  }

  private resetAuth() {
    this.loggedInFlag = new Flag('Not logged in!');
    this.authService.setAuthToken(null);
    this.authService.setUserName(null);
    this.setStoreType(null);
    this.usernameSubject.next(null);
  }

  /**
   * This method handles following cases:
   * 1. if user is already logged in then immediately call next() and complete() on subscriber
   * 2. if user is logging in at the moment then wait till login operation completes and after
   *    that call next() and complete() on subscriber
   * 3. if user is not logged in then call error() on subscriber
   * @returns {Observable<any>}
   */
  public throwErrorIfNotLoggedIn(): Observable<any> {
    return this.loggedInFlag.getObservable();
  }

  public getUsername(): Observable<string> {
    return this.usernameSubject.asObservable();
  }

  public login(username: string, password: string): Observable<UserInfo> {
    this.resetAuth();
    this.loggedInFlag.setWaiting();

    const loginParams = new HttpParams()
      .set('username', username)
      .set('password', password)
      .set('grant_type', LoginParameters.GRANT_TYPE)
      .set('scope', LoginParameters.SCOPE);

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');

    return this.httpClient.post(this.IAEndpoint + '/login', loginParams, {headers: headers})
      .flatMap((res: any) => {
        const lr = new LoginResponse(res);
        this.authService.setAuthToken(Token.fromAuthorization(lr));
        this.authService.setUserName(username);
        this.usernameSubject.next(username);
        this.loggedInFlag.setReady();
        return this.getTenant();
      })
      .catch((err) => {
        if (err.status === 400) {
          return Observable.of(null);
        }
        console.log(err);
        return Observable.throw(err);
      });
  }

  public logout() {
    this.loggedInFlag.throwError();
    this.resetAuth();
    this.router.navigate(['/login']);
  }

  /**
   * get new access token by refresh token
   */
  public refreshToken(refreshToken: string): Observable<string> {
    const refreshParams = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken);

    const headers = new HttpHeaders()
      .set('refresh_token', refreshToken);

    let url = '';
    if (this.usePGStore) {
      url = environment.IAEndpoint + '/boot/api/token/refresh';
    } else {
      url = environment.IAEndpoint + '/oauth/token';
    }
    return this.httpClient.post(url, refreshParams,{ headers: headers})
      .map(res => <string>res)
      .catch(error => Observable.of(null));
  }

  private changeLang(lang: string): void {
    this.translate.use(lang);
    if (this.supportedLangsRtl.indexOf(lang) > -1) {
      window.document.getElementById('css_right').setAttribute('href', 'assets/bootstrap-rtl.min.css');
    } else {
      window.document.getElementById('css_right').removeAttribute('href');
    }

    this.bsLocaleService.use(lang);
  }

  private changeTheme(theme?: string): void {
    if (theme) {
      window.document.getElementById('css_theme').setAttribute('href', `assets/themes/${theme}.css`);
    } else {
      window.document.getElementById('css_theme').removeAttribute('href');
    }
  }

  /**
   * Receive tenant id for usage in all other requests
   */
  public getTenant(): Observable<UserInfo> {

    return this.getUserInfo().map((res: UserInfo) => {
      if (res) {
          this.tenantId = res.tenantId;
          console.log('Tenant ID: ' + this.tenantId + ', lang: ' + res.lang);
          if (res.lang) {
            this.changeLang(res.lang);
          } else {
            const browserLang = this.translate.getBrowserLang();
            if (browserLang) {
              if (this.supportedLangs.indexOf(browserLang) > -1) {
                this.changeLang(browserLang);
              }
            }
          }
      } else {
        this.logout();
      }
      this.userInfo = res;

      return res;
    });
  };

  public getUserInfo(): Observable<UserInfo> {

    return this.httpClient.get(this.IAEndpoint + '/boot/api/system/userinfo')
      .map((res: any) => {
        this.setStoreType('PG');
        return new UserInfo(res);
      })
      .catch((err) => {
        if (err.status === 404) {
          this.setStoreType('IA');
          return this.getTenants()
            .map((res: Tenant[]) => new UserInfo({details: {tenant: res[0].uuid}}))
            .catch(() => Observable.of(null));
        } else {
          return Observable.of(null);
        }
      }
    );

  }

  public getTenants(): Observable<Tenant[]> {
    return this.httpClient.get(this.IAEndpoint + '/restapi/systemdata/tenants/')
      .map((res: any) => res._embedded.tenants)
      .map((tenants: Array<any>) => tenants.map( (tenant: any) => new Tenant(tenant)));
  }

  public getApplications(): Observable<Application> {
      return this.httpClient.get(this.IAEndpoint + '/restapi/systemdata/tenants/' + this.tenantId + '/applications?size=30')
      .map((res: any) => res._embedded.applications)
      .flatMap((apps: Array<any>) => Observable.from(apps.map((app) => new Application(app))));
  }

  public getApplicationInfo(applicationID: string): Observable<Application> {

    return this.httpClient.get(this.IAEndpoint + '/restapi/systemdata/applications/' + applicationID)
      .map((res: any) => new Application(res));
  }

  public getApplicationAIPs(applicationID: string) {
    return this.httpClient.get(this.IAEndpoint + '/restapi/systemdata/applications/' + applicationID + '/aips')
      .map((res: Response) => res.json());
  }

  public getSearchResultsCount(compId: string, query: string): Observable<number> {
    const url = `${this.IAEndpoint}/restapi/systemdata/search-compositions/${compId}?page=0&size=5&mode=countOnly`;

    const headers = new HttpHeaders().set('Content-Type', 'application/xml');

    return this.httpClient.post(url, query, {headers: headers})
      .map((obj: any) => obj['page'] ? obj.page.totalElements : obj.totalElements)
  }

  public executeSearch(compId: string, query: string, page = 1, size = environment.itemsOnPage, sortOptions?: SortOptions): Observable<PagedList<SearchResultRow>> {

    let url = `${this.IAEndpoint}/restapi/systemdata/search-compositions/${compId}?page=${page - 1}&size=${size}`;
    if (sortOptions && sortOptions.colName) {
      url += `&sort=${sortOptions.colName},${ (sortOptions.asc ? 'asc' : 'desc')}`;
    }

    const headers = new HttpHeaders().set('Content-Type', 'application/xml');

    return this.httpClient.post(url, query, {headers: headers})
      .map((res: any) => {
        const data: SearchResultRow[] = res._embedded.results[0].rows.map((v, z, zz) => new SearchResultRow(v));
        let isLast = (res.page.lastPage === true);
        if (res.page.totalPages === 1) {
          isLast = true;
        }
        if (res.page.number && res.page.number === res.page.totalPages - 1 ) {
          isLast = true;
        }
        return new PagedList(data, res.page.totalElements, isLast);
      });

/*
    return this.accessPaginatedResource(
      RequestMethod.Post,
      url,
      headers,
      (embedded) => embedded.results[0].rows.map((v, z, zz) => new SearchResultRow(v)),
      searchBody,
      page,
      size
    );*/
  }

  public executeFTSearch(query: any, page = 1, size = environment.itemsOnPage, sortOptions?: SortOptions): Observable<{docs: PagedList<Doc>, aggregations: any[]}> {

    let params = new HttpParams();
    params = params.append('page', (page - 1) + '')
    .append('searchTerm', query['query'])
    .append('resultConfigId', query['rootId'])
    .append('size', size + '');
    if (sortOptions && sortOptions.colName) {
      params = params.append('sort', `${sortOptions.colName},${ (sortOptions.asc ? 'asc' : 'desc')}`);
    } else {
      params = params.append('sort', '_score,DESC');
    }
    let postBody = null;
    if (query['filter']) {
      postBody = {query: query['filter']};
    }
    return this.httpClient.request('post', `${this.IAEndpoint}/boot/api/docs/search`, {params: params, body: postBody})  // /boot/api/docs/search
      .map((r: any) => {
        let docs = [];
        let total = 0;
        if(r) {
          if (r.hits && r.hits.total > 0) {
            docs = r.hits.hits.map((hit: any) => new Doc(hit._source));
            total = r.hits.total;
          } else if (r.content && r.content.length > 0) {
            docs = r.content.map((json: any) => new Doc(json));
            total = r.totalElements;
          }
        }
        return {docs:  new PagedList(docs, total), aggregations: r.aggregations || null};
      });
  }

  public executeFTSearchDirect(query: any, page = 1, size = environment.itemsOnPage, sortOptions?: SortOptions): Observable<{docs: PagedList<Doc>, aggregations: any[]}> {

    return this.httpClient.request('post', `${this.IAEndpoint}/doccloud/_search`, { body: query})
      .map((r: any) => {
        let docs = [];
        let total = 0;
        if (r && r.hits && r.hits.total > 0) {
          docs = r.hits.hits.map( (hit: any) => new Doc(hit._source));
          total = r.hits.total;
        }
        return {docs: new PagedList(docs, total), aggregations: r.aggregations};
      });
  }

  public getResultMaster(uuid: string): Observable<any> {
      return this.httpClient.get(`${this.IAEndpoint}/restapi/systemdata/result-masters/${uuid}`)
      .map((r: any) => new ResultMaster(r));
  }

  public getApplicationSearches(applicationUuid: string, fromPage = 0, size = 10): Observable<Search> {

    const url = `${this.IAEndpoint}/restapi/systemdata/applications/${applicationUuid}/searches`;
    const headers = new HttpHeaders().set('Content-Type', 'application/xml');

    return this.accessPaginatedResource<Search>(
      'get',
      url,
      headers,
      (embedded) => embedded.searches.map((v, z, zz) => new Search(v)),
      null,
      fromPage,
      size
    );
  }

  public getXform(xformUuid: string): Observable<XForm> {
    return this.httpClient.get(`${this.IAEndpoint}/restapi/systemdata/xforms/${xformUuid}`)
      .map((r: any) => new XForm(r));
  }

  public getSearchCompositions(searchUuid: string) {

    const url = `${this.IAEndpoint}/restapi/systemdata/searches/${searchUuid}/search-compositions`;

    return this.accessPaginatedResource<SearchComposition>(
      'get',
      url,
      null,
      (embedded) => embedded.searchCompositions.map((v, z, zz) => new SearchComposition(v)),
      null
    );
  }

  private accessPaginatedResource<T>(method: string,
                                     resourceUrl: string,
                                     requestHeaders: HttpHeaders,
                                     transform: (embeddedArg: any) => [T],
                                     requestBody?: string,
                                     fromPage = 0,
                                     pageSize = 10): Observable<T> {
    const fetch = (startPageIdx) => {
      const fetchPage = (nextPageIdx) => {
        const url = `${resourceUrl}?page=${nextPageIdx}&size=${pageSize}`;

        return this.httpClient.request(method, url, {
          body: requestBody,
          headers: requestHeaders
        }).map((response: any) => {
            return {
              items: !!response._embedded ? transform(response._embedded) : [],
              nextPageIdx: (response.page.number + 1 < response.page.totalPages) ? response.page.number + 1 : null
            };
          });
      };

      return Observable.defer(
        () => fetchPage(startPageIdx)
          .flatMap(({items, nextPageIdx}) => {
            const itemsObservable = Observable.from(items);
            return itemsObservable;
            /*const nextLazyObservable = !!nextPageIdx ?
              fetch(nextPageIdx) :
              Observable.empty();

            return Observable.concat(
              itemsObservable,
              nextLazyObservable
            );*/
          })
      );
    };

    return fetch(fromPage);
  }

  public ingest(applicationUuid: string, zip: any): Observable<IngestionResponse> {
    const url = `${this.IAEndpoint}/restapi/systemdata/applications/${applicationUuid}/aips?ingestDirect=true`;

    const formData = new FormData();
    formData.append('format', 'sip_zip');
    formData.append('sip', zip);

    return this.httpClient.post(url, formData)
      .map((res: any) => new IngestionResponse(res));
  }

  public addAttachment(documentId: string, file: any, type?: string): Observable<Doc> {

    // const url = `${this.IAEndpoint}/jooq/browser/test/root?objectId=${documentId}`;

    const url = `${this.IAEndpoint}/boot/api/docs/updatecontent/${documentId}` + (type ? '?type=' + type : '');

    const formData = new FormData();
   /* formData.append('cmisaction', 'createDocument');
    formData.append('propertyId[0]', 'cmis:name');
    formData.append('propertyValue[0]', 'attachment');
    formData.append('propertyId[1]', 'cmis:objectTypeId');
    formData.append('propertyValue[1]', 'cmis:document');
    formData.append('versioningState', 'major');
    formData.append('succinct', 'true');*/

    formData.append('content', file);

    return this.httpClient.post(url, formData).map((result: any) => new Doc(result));

  }

  public moveDocumentToFolder(documentId: string, folderId: string): Observable<Doc> {
    return this.executeCmisAction(documentId, 'move', {targetFolderId: folderId})
      .map((obj: CmisObject) => new Doc(obj));
  }

  private executeCmisAction(objectId: string, action: string, data?: any, multipart = true): Observable<CmisObject> {

    const cmisHeaders: HttpHeaders = new HttpHeaders();
    const url = `${this.IAEndpoint}/boot/browser/test/root?objectId=${objectId}`;

    let formData;
    if (multipart) {
      formData = new FormData();
      formData.append('_charset_', 'UTF-8');
      formData.append('cmisaction', action);
      formData.append('succinct', 'true');
      if (data) {
        for (const key in data) {
          formData.append(key, data[key]);
        }
      }
    } else {
      cmisHeaders.set('Content-Type', 'application/x-www-form-urlencoded');
      formData = new HttpParams()
        .set('cmisaction', action)
        .set('succinct', 'true');
      if (data) {
        for (const key in data) {
          formData = formData.set(key, data[key]);
        }
      }
    }

    return this.httpClient.post(url, formData, {headers: cmisHeaders})
      .first()
      .map((res: any) => new CmisObject(res));
  }

  public saveDocument(doc: Doc, folderId?: string, file?: any): Observable<Doc> {
    const data: any = {};
    const action = doc.id ? 'update' : 'createDocument';
    const objId = doc.id || folderId || environment.rootId;

    let i = 0;
    if (doc.data) {
      for (const key in doc.data) {
        data[`propertyId[${i}]`] = key;
        data[`propertyValue[${i}]`] = doc.data[key];
        i++;
      }
    }
    data[`propertyId[${i}]`] = CmisConstants.CMIS_PROP_NAME;
    data[`propertyValue[${i}]`] = doc.title;
    i ++ ;
    data[`propertyId[${i}]`] = CmisConstants.CMIS_PROP_DESCR;
    data[`propertyValue[${i}]`] = doc.description;
    i ++ ;

    if (!doc.id) {
      data['versioningState'] = 'none';
      data[`propertyId[${i}]`] = CmisConstants.CMIS_PROP_TYPE;
      data[`propertyValue[${i}]`] = doc.type;
    }
    if (file) {
      data.content = file;
    }

    return this.executeCmisAction(objId, action, data)
      .map((obj: CmisObject) => new Doc(obj));
  }

  public saveDocumentData(doc: Doc, parentFolderId?: string): Observable<Doc> {
    if (doc instanceof SystemDoc) {
      return this.saveSystemDoc(doc).map((r: any) => new SystemDoc(r));
    }

    delete doc.creationTime;
    delete doc.lastModified;
    delete doc.versionSeries;
    delete doc.acl;

    if (parentFolderId && parentFolderId !== '') {
      doc['parent'] = parentFolderId;
    }

    let url = `${this.IAEndpoint}/boot/api/docs`;
    let method = 'post';
    if (doc.id) {
      url += '/' + doc.id;
      method = 'put';
    }
    return this.httpClient.request(method, url, {body: doc})
        .map((r: any) => new Doc(r));
  }

  public saveFolder(folder: CmisObject, parent?: string): Observable<CmisObject> {
    const action = folder.id ? 'update' : 'createFolder';
    const objId = folder.id || parent || environment.rootId;

    const data: any = {};
    let i = 0;
    data[`propertyId[${i}]`] = CmisConstants.CMIS_PROP_NAME;
    data[`propertyValue[${i}]`] = folder.name;
    i ++ ;

    if (!folder.id) {
      data[`propertyId[${i}]`] = CmisConstants.CMIS_PROP_TYPE;
      data[`propertyValue[${i}]`] = folder.type || 'folder';
    }

    return this.executeCmisAction(objId, action, data, false)
      .map((obj: CmisObject) => obj);
  }

  public getDocument(id: string, type?: string): Observable<Doc> {
    return this.httpClient.get(`${this.IAEndpoint}/boot/api/docs/${id}` + (type ? '?type=' + type : '') )
      .map((r: any) => new Doc(r));
  }

  public removeDocument(id: string, type?: string): Observable<any> {
    return this.httpClient.delete(`${this.IAEndpoint}/boot/api/docs/${id}` + (type ? '?type=' + type : '') );
  }

  public getApplicationPdiSchemaContent(applicationUuid) {
    const regexp = new RegExp(/\Wrestapi.+/);
    return this.httpClient.get(`${this.IAEndpoint}/restapi/systemdata/applications/${applicationUuid}/pdi-schemas`)
        .flatMap((res: any) => {
          const pdiUrlIA = res._embedded.pdiSchemas[0]._links['http://identifiers.emc.com/contents'].href;
          const pdiUrlRusIa = this.IAEndpoint + pdiUrlIA.match(regexp)[0];
          return this.httpClient.get(pdiUrlRusIa);
        })
        .flatMap((response: any) => {
          const downloadPdiUrlIA = response._embedded.contents[0]._links['http://identifiers.emc.com/content-download'].href;
          const downloadPdiUrlRusIa = this.IAEndpoint + downloadPdiUrlIA.match(regexp)[0];
          return this.httpClient.get(downloadPdiUrlRusIa);
        })
        .map((xsdRes: any) => xsdRes._body);
  }

  public getApplicationPdiSchemaName(applicationUuid) {
    const url = `${this.IAEndpoint}/restapi/systemdata/applications/${applicationUuid}/pdi-schemas`;

    return this.httpClient.get(url)
      .flatMap((res: any) => Observable.of(res._embedded.pdiSchemas[0].name));
  }

  public getApplicationHoldingName(applicationUuid) {
    const url = `${this.IAEndpoint}/restapi/systemdata/applications/${applicationUuid}/holdings`;

    return this.httpClient.get(url)
      .flatMap((res: any) => Observable.of(res._embedded.holdings[0].name));
  }

  public getApplicationTreeRoot(applicationUuid): Observable<string> {
    const url = `${this.IAEndpoint}/restapi/systemdata/applications/${applicationUuid}/treeroot`;

    return this.httpClient.get(url)
      .flatMap((res: any) => {
        const link = res._embedded.treeroots[0]._links.self.href;
        const id: string = link.split('/treeroots/')[1];
        return Observable.of(id);
    });
  }

  public downloadContent(applicationUuid: string, contentUuid: string): void {
    const url = `${this.IAEndpoint}/restapi/systemdata/applications/${applicationUuid}/ci?cid=${contentUuid}`;

    this.httpClient.request('get', url,
      {responseType: 'blob', observe: 'response' }).first()
      .subscribe((value: HttpResponse<Blob>) => {
        const contentType = value.headers.get('Content-Type') || 'application/octet-stream';

        const contentDisposition = value.headers.get('Content-Disposition');

        let fileName = contentDisposition
          .substr(contentDisposition.indexOf('filename') + 'filename='.length)
          .replace(/"/g, '') || 'attachment';

        fileName = decodeURIComponent(fileName);

        const blob = new Blob([value.body], {type: contentType});
        FileSaver.saveAs(blob, fileName);

        // fileName = decodeURIComponent(fileName);
        // blob = new Blob([data], {type: contentType});
        // FileSaver.saveAs(blob, fileName);
      });
  }

  public downloadDocument(docId: string, type?: string): void {
    const url = `${this.IAEndpoint}/boot/api/docs/getcontent/${docId}` + (type ? '?type=' + type : '');
    // const url = `${this.IAEndpoint}/boot/browser/test/root?objectId=${docId}&cmisselector=content`;

    this.httpClient.request('get', url,
      {responseType: 'blob',  observe: 'response' })
      .first()
      .subscribe((value: HttpResponse<Blob>) => {
        const contentType = value.headers.get('Content-Type') || 'application/octet-stream';

        const contentDisposition = value.headers.get('Content-Disposition');

        let fileName = (contentDisposition ? contentDisposition
          .substr(contentDisposition.indexOf('filename') + 'filename='.length)
          .replace(/"/g, '') : 'attachment');

        fileName = decodeURIComponent(fileName);
        if (fileName.startsWith('=UTF-8\'\'')) {
          fileName = fileName.substr(8);
        }

        const blob = new Blob([value.body], {type: contentType});
        FileSaver.saveAs(blob, fileName);

      });
  }

  public getDocumentContent(docId: string, type?: string): Observable<ContentData> {
    const url = `${this.IAEndpoint}/boot/api/docs/getcontent/${docId}` + (type ? '?type=' + type : '');
    // const url = `${this.IAEndpoint}/boot/browser/test/root?objectId=${docId}&cmisselector=content`;

    return this.httpClient.request('get', url,
      {responseType: 'blob',  observe: 'response' })
      .map((value: HttpResponse<Blob>) => {
        const contentType = value.headers.get('Content-Type') || 'application/octet-stream';

        const contentDisposition = value.headers.get('Content-Disposition');

        let fileName = (contentDisposition ? contentDisposition
          .substr(contentDisposition.indexOf('filename') + 'filename='.length)
          .replace(/"/g, '') : 'attachment');

        fileName = decodeURIComponent(fileName);
        if (fileName.startsWith('=UTF-8\'\'')) {
          fileName = fileName.substr(8);
        }

        const blob = new Blob([value.body], {type: contentType});
        const result = new ContentData(fileName);
        result.blob = blob;
        result.mimeType = contentType;
        return result;
      });
  }

  public getCmisData(parentId: string = environment.rootId, filter: string, count?: number, page?: number, sortOptions?: SortOptions): Observable<PagedList<CmisObject>> {

    const maxItems = count ? count : environment.itemsOnPage;
    const skipCount = (page && page > 1) ? (page - 1) * maxItems : 0;
    const _filter = (filter && filter !== '') ? '&filter=' + filter : '';
    const url = `${this.IAEndpoint}/boot/browser/test/root?cmisselector=children&succinct=true${_filter}` +
      `&objectId=${parentId}&skipCount=${skipCount}&maxItems=${maxItems}` +
      `&orderBy=${sortOptions ? (sortOptions.colName + (sortOptions.asc ? '' : ' DESC'))
        : (CmisConstants.CMIS_PROP_BASETYPE + ' DESC,' + CmisConstants.CMIS_PROP_NAME)}`;

    return this.httpClient.get(url)
      .map((res: any) => {
        const data: CmisObject[] = res.objects.map((obj) => new CmisObject(obj));
        const total = res.numItems;
        return new PagedList(data, total);
      });
    // .flatMap((objs: Array<any>) => Observable.from(objs.map((obj) => new CmisObject(obj))));
  }

  public getObjects(url: string): Observable<any[]> {

    return this.httpClient.get(`${this.IAEndpoint}${url}`)
      .map((res: any) => {
        let data: any[] = [];
        if (res.objects && res.objects.length > 0) {
          data = res.objects.map((o) => new CmisObject(o));
        } else if (res.length > 0) {
          data = res.map((o) => new Doc(o));
        }
        return data;
      });
  }

  public getTypes(parentId: string = environment.rootId): Observable<DocType[]> {
    const url = `${this.IAEndpoint}/boot/api/system/types?parent=${parentId}&page=0&size=1000&sort=SYS_TITLE,ASC`;
    return this.httpClient.get(url)
      .map((res: any) => res.content)
      .map((objs: Array<any>) => {
        const out: DocType[] = objs.map((obj) => new DocType(obj));
        return out;
      });
  }

  public getGroups(query?: string): Observable<AccessGroup[]> {

    const url = `${this.IAEndpoint}/boot/api/system/groups`;
    return this.httpClient.get(url, query ? {params: new HttpParams().set('query', query)} : undefined)
      .map((objs: Array<any>) =>  objs.map((obj) => new AccessGroup(obj)));

  }

  public getSystemDocs(typeName: string): Observable<SystemDoc[]> {

    const url = `${this.IAEndpoint}/boot/api/system/type/${typeName}`;
    return this.httpClient.get(url)
      .map((res: any) => res.content)
      .map((objs: Array<any>) =>  objs.map((obj) => new SystemDoc(obj)));

  }

  public getTypeDocs(typeName: string): Observable<Doc[]> {

    const url = `${this.IAEndpoint}/boot/api/docs/type/${typeName}`;
    return this.httpClient.get(url)
      .map((res: any) => res.content)
      .map((objs: Array<any>) =>  objs.map((obj) => new Doc(obj)));

  }

  public getType(type: string, byId?: boolean): Observable<DocType> {

    let url = `${this.IAEndpoint}/boot/api/system/s/${type}`;
    if (byId) {
      url = `${this.IAEndpoint}/boot/api/system/${type}`;
    }
    return this.httpClient.get(url)
      .map((r: any) => new DocType(r));
  }

  public getSystemDoc(id: string, byId?: boolean): Observable<SystemDoc> {

    let url = `${this.IAEndpoint}/boot/api/system/s/${id}`;
    if (byId) {
      url = `${this.IAEndpoint}/boot/api/system/${id}`;
    }
    return this.httpClient.get(url)
      .map((r: any) => new SystemDoc(r));
  }

  public saveType(type: any): Observable<DocType> {
    let url = `${this.IAEndpoint}/boot/api/system`;
    let method = 'post';
    if (type.id) {
      url += '/' + type.id;
      method = 'put';
    }
    return this.httpClient.request(method, url, { body: type})
     .map((r: any) => new DocType(r));
  }

  public saveSystemDoc(doc: any): Observable<SystemDoc> {
    let url = `${this.IAEndpoint}/boot/api/system`;
    let method = 'post';
    if (doc.id) {
      url += '/' + doc.id;
      method = 'put';
    }
    delete doc.baseType;
    delete doc.creationTime;
    delete doc.lastModified;
    delete doc.acl;
    delete doc.versionSeries;

    if (doc.data && doc.data.symbolicName) {
      doc['symbolicName'] = doc.data.symbolicName;
    }

    return this.httpClient.request(method, url, { body: doc})
      .map((r: any) => new SystemDoc(r));
  }

  public removeSystemItem(id: string): Observable<any> {
    return this.httpClient.delete(`${this.IAEndpoint}/boot/api/system/${id}`);
  }

  public getSupportedLangs(): string[] {
    return this.supportedLangs;
  }

  public getUsers(query?: string): Observable<UserInfo[]> {
    return this.httpClient.get(this.IAEndpoint + '/boot/api/system/users', query ? {params: new HttpParams().set('query', query)} : undefined)
      .map((users: Array<any>) => users.map( (user: any) => new UserInfo(user)));

  }

  public getUser(id: string): Observable<UserInfo> {
    return this.httpClient.get(this.IAEndpoint + `/boot/api/system/users/${id}`)
      .map((user: any) => new UserInfo(user));

  }

  public saveUser(user: UserInfo): Observable<UserInfo> {
    let url = `${this.IAEndpoint}/boot/api/system/users/${user.id}`;
    let method = 'put';
    const userData = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      groups: user.groups,
      details: {
        lang: user.lang, tenant: user.tenantId
      }
    }
    return this.httpClient.request(method, url, { body: userData})
      .map((r: any) => new UserInfo(r));
  }

  public getGroup(id: string): Observable<AccessGroup> {
    return this.httpClient.get(this.IAEndpoint + `/boot/api/system/groups/${id}`)
      .map((group: any) => new AccessGroup(group));

  }

  public saveGroup(group: any, isNew: boolean): Observable<AccessGroup> {
    let url = `${this.IAEndpoint}/boot/api/system/groups`;
    let method = 'post';
    if (!isNew) {
      url += '/' + group.id;
      method = 'put';
    }

    return this.httpClient.request(method, url, { body: group})
      .map((r: any) => new AccessGroup(r));
  }

  public processRetention(): Observable<any> {
    return this.httpClient.get(this.IAEndpoint + `/boot/api/docs/processretention`)
  }

  public getVersions(id: string): Observable<Doc[]> {
    const url = `${this.IAEndpoint}/boot/api/docs/versions/${id}`;
    return this.httpClient.get(url)
      .map((objs: Array<any>) =>  objs.map((obj) => new Doc(obj)));
  }


  public getUsedFieldValues(typeName: string, fieldName: string, query?: string): Observable<ListElement[]> {
    let url = `${this.IAEndpoint}/boot/api/docs/distinct?field=${fieldName}&type=${typeName}`;
    if (query) {
      url += `&query=` + query;
    }
    return this.httpClient.get(url)
      .map((response: any) => {

      const arr: any[] = response.result;

      return arr.map((value) => {
        return new ListElement(value, value)
      })
    })
  }

  public exportData(compositionId: string, outPutFormat: string, data: {query?: string, sortOptions?: SortOptions, selectedIds?: string[]}): void {
    let url;
    let headers = new HttpHeaders().set('Content-Type', 'application/xml');
    let request: Observable<object>;

    if (!data.selectedIds) {
      url = `${this.IAEndpoint}/restapi/systemdata/search-compositions/${compositionId}?page=0&size=1&mode=export&exportFormat=${outPutFormat}`;
      if (data.sortOptions && data.sortOptions.colName) {
        url += `&sort=${data.sortOptions.colName},${ (data.sortOptions.asc ? 'asc' : 'desc')}`;
      }

      request = this.httpClient.post(url, data.query, {headers: headers, responseType: 'blob', observe: 'response' })
    } else {
      headers = new HttpHeaders().set('Content-Type', 'application/json');
      url = `${this.IAEndpoint}/boot/api/docs/exportSelected?searchId=${compositionId}&exportFormat=${outPutFormat}`;
      const body = JSON.stringify({selectedIds: data.selectedIds});
      request = this.httpClient.post(url, body, {headers: headers, responseType: 'blob', observe: 'response' })
    }

    request.first().subscribe((value: HttpResponse<Blob>) => {
        const contentType = value.headers.get('Content-Type') || 'application/octet-stream';

        const contentDisposition = value.headers.get('Content-Disposition');

        let fileName = contentDisposition
          .substr(contentDisposition.indexOf('filename') + 'filename='.length)
          .replace(/"/g, '') || 'export';

        fileName = decodeURIComponent(fileName);

        const blob = new Blob([value.body], {type: contentType});
        FileSaver.saveAs(blob, fileName);

        // fileName = decodeURIComponent(fileName);
        // blob = new Blob([data], {type: contentType});
        // FileSaver.saveAs(blob, fileName);

    })
  }

  public getDatasources(): Observable<string[]> {
    const url = `${this.IAEndpoint}/boot/api/system/datasources`;
    return this.httpClient.get(url)
      .map((objs: Array<string>) =>  objs.map((obj) => (obj)));
  }

  public getVersionFront(): Observable<{version: string}> {
    return this.httpClient.get(`${this.IAEndpoint}/pgu/version.json`)
      .map((resp: any) => { return {version: resp['version']}})
  }

  public getVersionBackend(): Observable<{version: string}> {
    return this.httpClient.get(`${this.IAEndpoint}/boot/version.json`)
      .map((resp: any) => { return {version: resp['version']}})
  }

}
