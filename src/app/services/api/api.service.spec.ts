import {
  BaseRequestOptions, Http, Response, RequestMethod,
  ResponseOptions, ResponseType
} from '@angular/http';
import {HttpClient, HttpHeaders, HttpResponse, HttpParams} from '@angular/common/http';
import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {MockBackend, MockConnection} from '@angular/http/testing';
import {TestBed, inject} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';

import {ApiService} from './api.service';
import {SearchResultRow} from './model/search-result-row';
import {Search} from './model/search';

import 'rxjs/add/operator/count';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';
import {IngestionResponse} from './model/ingestion-response';
import {ContentType} from '@angular/http/src/enums';
import {PagedList} from './model/paged-list';


describe('ApiService', () => {
  let apiService: ApiService;
  let backend: MockBackend;

  const user = 'USER';
  const base_host = '';
  const password = 'PASSWORD';
  const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cC...';
  const refreshToken = 'eyJhbGciOiJIUzI1NiIsInR5...';
  const authResponseBody = {
    'access_token': accessToken,
    'token_type': 'bearer',
    'refresh_token': refreshToken,
    'expires_in': 123456,
    'scope': 'administration compliance search',
    'jti': '82e6a274-d8fd-4067-99f0-dcd8231b35c1'
  };
  const tenantId = '1fb7ed5a-c160-4454-bf4a-123dc61d6acf';
  const applicationUuid = '32c4d223-34cc-4635-a9f9-329a70582327';
  const tenantResponseBody = {
    '_embedded': {
      'tenants': [{
        'createdBy': 'system',
        'createdDate': '2016-12-11T15:50:26.940-08:00',
        'lastModifiedBy': 'system',
        'lastModifiedDate': '2016-12-11T15:50:26.940-08:00',
        'version': 1,
        'name': 'INFOARCHIVE',
        'permission': {
          'groups': []
        },
        '_links': {
          'self': {
            'href': `http://10.8.42.215:8765/systemdata/tenants/${tenantId}`
          }
        }
      }]
    }
  };

  beforeAll(() => {
    window.localStorage.clear();
  });

  beforeEach(() => {
    @Component({template: ''})
    class DummyComponent {
    }

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          {path: 'login', component: DummyComponent}
        ])
      ],
      providers: [
        ApiService,
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (mockBackend, defaultOptions) => {
            return new Http(mockBackend, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions]
        }
      ],
      declarations: [DummyComponent]
    });
  });

  beforeEach(inject([ApiService, MockBackend], (service, mockBackend) => {
    apiService = service;
    backend = mockBackend;
  }));

  it('should login properly', (done) => {
    backend.connections.subscribe((connection: MockConnection) => {
      switch (connection.request.url) {
        case base_host + '/login': {
          expect(connection.request.method).toEqual(RequestMethod.Post);
          expect(connection.request.headers.get('Content-Type'))
            .toEqual('application/x-www-form-urlencoded');
          expect(connection.request.getBody())
            .toEqual(`username=${user}&password=${password}&grant_type=password&scope=search%20compliance%20administration`);

          const options = new ResponseOptions({body: authResponseBody});

          connection.mockRespond(new Response(options));
          break;
        }
        case base_host + '/restapi/systemdata/tenants/': {
          expect(connection.request.method).toEqual(RequestMethod.Get);
          expect(connection.request.headers.get('Authorization'))
            .toEqual(`${authResponseBody.token_type} ${authResponseBody.access_token}`);

          const options = new ResponseOptions({body: tenantResponseBody});

          connection.mockRespond(new Response(options));
          break;
        }
        default:
          fail(`Unexpected connection to ${connection.request.url}`);
      }
    });

    apiService.login(user, password).flatMap((response) => {
      expect(response).toEqual(true);

      return apiService.getUsername();
    }).subscribe((username) => {
      expect(username).toEqual(user);

      done();
    });
  });

  it('should reject wrong login credentials properly', (done) => {
    class ErrorResponse extends Response implements Error {
      name: any;
      message: any;
    }

    const rejectResponse = {'error': 'invalid_grant', 'error_description': 'Bad credentials'};

    backend.connections.subscribe((connection: MockConnection) => {
      switch (connection.request.url) {
        case base_host + '/login': {
          const options = new ResponseOptions({body: rejectResponse, status: 400, type: ResponseType.Error});
          connection.mockError(new ErrorResponse(options));
          break;
        }
        case base_host + '/restapi/systemdata/tenants/': {
          const options = new ResponseOptions({body: tenantResponseBody});
          connection.mockRespond(new Response(options));
          break;
        }
        default:
          fail(`Unexpected connection to ${connection.request.url}`);
      }
    });

    apiService.login(user, password).subscribe((response) => {
      expect(response).toEqual(false);
      done();
    });
  });

  it('should rethrow http errors', (done) => {
    const error = new Error('zzz');
    backend.connections.subscribe((connection: MockConnection) => {
      connection.mockError(error);
    });

    apiService.login(user, password).subscribe(null, (err) => {
      expect(err).toEqual(error);
      done();
    });
  });

  describe('when logged in ...', () => {
    const applicationsResponseBody = {
      '_embedded': {
        'applications': [{
          'createdBy': 'sue@iacustomer.com',
          'createdDate': '2016-12-11T15:51:48.624-08:00',
          'lastModifiedBy': 'sue@iacustomer.com',
          'lastModifiedDate': '2016-12-11T15:56:32.661-08:00',
          'version': 2,
          'name': 'Baseball',
          'structuredDataStorageAllocationStrategy': 'DEFAULT',
          'type': 'APP_DECOMM',
          'archiveType': 'TABLE',
          'searchCreated': true,
          'xdbLibraryAssociated': true,
          'state': 'IN_TEST',
          'viewStatus': true,
          'description': 'The application has records',
          'category': 'Sports',
          'retentionEnabled': false,
          'cryptoIV': 'V8nsFex0D5gFkryD0+S21g==',
          'metadataCacheSize': 0,
          'permission': {
            'groups': []
          },
          'cryptoEncoding': 'base64',
          'cryptoKeyID': 'search_results_f76878a5-37e9-4cae-947b-a824485ec955',
          '_links': {
            'self': {
              'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955'
            }
          }
        },
          {
            'createdBy': 'sue@iacustomer.com',
            'createdDate': '2016-12-11T15:51:48.624-08:00',
            'lastModifiedBy': 'sue@iacustomer.com',
            'lastModifiedDate': '2016-12-11T15:56:32.661-08:00',
            'version': 2,
            'name': 'Baseball',
            'structuredDataStorageAllocationStrategy': 'DEFAULT',
            'type': 'APP_DECOMM',
            'archiveType': 'TABLE',
            'searchCreated': true,
            'xdbLibraryAssociated': true,
            'state': 'IN_TEST',
            'viewStatus': true,
            'description': 'The application has records',
            'category': 'Sports',
            'retentionEnabled': false,
            'cryptoIV': 'V8nsFex0D5gFkryD0+S21g==',
            'metadataCacheSize': 0,
            'permission': {
              'groups': []
            },
            'cryptoEncoding': 'base64',
            'cryptoKeyID': 'search_results_f76878a5-37e9-4cae-947b-a824485ec955',
            '_links': {
              'self': {
                'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955'
              }
            }
          }]
      }
    };

    beforeEach((done) => {
      const loginSubscription = backend.connections.subscribe((connection: MockConnection) => {
        switch (connection.request.url) {
          case base_host + '/login': {
            const options = new ResponseOptions({body: authResponseBody});

            connection.mockRespond(new Response(options));
            break;
          }
          case base_host + '/restapi/systemdata/tenants/': {
            const options = new ResponseOptions({body: tenantResponseBody});

            connection.mockRespond(new Response(options));
            break;
          }
        }
      });
      apiService.login(user, password).subscribe(() => {
        loginSubscription.unsubscribe();
        done();
      });
    });

    it('should not send auth headers on subsequent login call', (done) => {
      backend.connections.subscribe((connection: MockConnection) => {
        switch (connection.request.url) {
          case base_host + '/login': {
            expect(connection.request.headers.has('Authorization')).toEqual(false);
            const options = new ResponseOptions({body: authResponseBody});
            connection.mockRespond(new Response(options));
            break;
          }
          case base_host + '/restapi/systemdata/tenants/': {
            const options = new ResponseOptions({body: tenantResponseBody});
            connection.mockRespond(new Response(options));
            break;
          }
          default: fail(`Unexpected connection to ${connection.request.url}`);
        }
      });

      apiService.login(user, password).subscribe(() => done());
    });

    it('should store token in some external storage', (done) => {
      inject([Http, Router], (http, router) => {
        backend.connections.subscribe((connection: MockConnection) => {
          expect(connection.request.headers.get('Authorization')).toContain(accessToken);

          switch (connection.request.url) {
            case base_host + '/restapi/systemdata/tenants/${tenantId}/applications': {
              const options = new ResponseOptions({body: applicationsResponseBody});

              connection.mockRespond(new Response(options));
              break;
            }
            case base_host + '/restapi/systemdata/tenants/': {
              const options = new ResponseOptions({body: tenantResponseBody});

              connection.mockRespond(new Response(options));
              break;
            }
            default:
              fail('Should not be any other requests');
          }
        });

        // Simulating page refresh
        const anotherServiceInstance = new ApiService(http, router, null, null);

        anotherServiceInstance.throwErrorIfNotLoggedIn()
          .flatMap(() => anotherServiceInstance.getUsername())
          .flatMap((username) => {
            expect(username).toEqual(user);

            return anotherServiceInstance.getApplications();
          })
          .subscribe(() => done(), () => fail());
      })();
    });

    it('should refresh token', (done) => {
      backend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.url).toEqual(base_host + '/login');
        expect(connection.request.method).toEqual(RequestMethod.Post);
        expect(connection.request.headers.get('Authorization')).toContain(accessToken);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/x-www-form-urlencoded');
        expect(connection.request.getBody())
          .toEqual(`grant_type=refresh_token&refresh_token=${refreshToken}`);

        connection.mockRespond(new Response(new ResponseOptions({body: authResponseBody})));
      });

      apiService.refreshToken('x')
        .subscribe(done);
    });

    it('should send empty username when logged out', (done) => {
      apiService.getUsername()
        // .skip(1) // skip current username
        .subscribe((username) => {
          expect(username).toBeNull();
          done();
        });

      apiService.logout();
    });

    it('should get applications', (done) => {
      backend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.url)
          .toEqual(`http://localhost:8090/restapi/systemdata/tenants/${tenantId}/applications`);
        expect(connection.request.method).toEqual(RequestMethod.Get);
        expect(connection.request.headers.get('Authorization'))
          .toEqual(`${authResponseBody.token_type} ${authResponseBody.access_token}`);

        const options = new ResponseOptions({body: applicationsResponseBody});

        connection.mockRespond(new Response(options));
      });

      apiService.getApplications()
        .count(() => true)
        .subscribe((v) => expect(v).toEqual(2),
          () => fail('should not throw error'),
          () => done()
        );
    });

    const pdiSchemaId = 'd906041b-831f-44f2-bbec-84a02c452269';
    const pdiSchemaResponseBody = {
      '_embedded': {
        'pdiSchemas': [
          {
            'createdBy': 'sue@iacustomer.com',
            'createdDate': '2017-06-19T12:49:21.949+03:00',
            'lastModifiedBy': 'sue@iacustomer.com',
            'lastModifiedDate': '2017-06-19T12:49:21.949+03:00',
            'version': 1,
            'name': 'urn:ia-impl:en:xsd:documentholding.1.0',
            'format': 'xsd',
            '_links': {
              'self': {
                'href': 'http://localhost:8080/restapi/systemdata/pdi-schemas/d906041b-831f-44f2-bbec-84a02c452269'
              },
              'http://identifiers.emc.com/update': {
                'href': 'http://localhost:8080/restapi/systemdata/pdi-schemas/d906041b-831f-44f2-bbec-84a02c452269'
              },
              'http://identifiers.emc.com/delete': {
                'href': 'http://localhost:8080/restapi/systemdata/pdi-schemas/d906041b-831f-44f2-bbec-84a02c452269'
              },
              'http://identifiers.emc.com/application': {
                'href': 'http://localhost:8080/restapi/systemdata/applications/32c4d223-34cc-4635-a9f9-329a70582327'
              },
              'http://identifiers.emc.com/contents': {
                'href': `http://localhost:8080/restapi/systemdata/pdi-schemas/${pdiSchemaId}/contents`
              }
            }
          }
        ],
      },
      '_links': {
        'self': {
          'href': 'http://localhost:8080/restapi/systemdata/applications/32c4d223-34cc-4635-a9f9-329a70582327/pdi-schemas'
        },
        'http://identifiers.emc.com/add': {
          'href': 'http://localhost:8080/restapi/systemdata/applications/32c4d223-34cc-4635-a9f9-329a70582327/pdi-schemas'
        }
      },
      'page': {
        'size': 10,
        'totalElements': 1,
        'totalPages': 1,
        'number': 0
      }
    };

    // suppress long lines inspection
    //noinspection TsLint
    const pdiContentId = 'a011d816-cb1b-4541-9acd-58c6bd160848';
    const pdiSchemaContentsResponseBody = {
      '_embedded': {
        'contents': [
          {
            'createdBy': 'sue@iacustomer.com',
            'createdDate': '2017-06-19T12:49:22.074+03:00',
            'lastModifiedBy': 'sue@iacustomer.com',
            'lastModifiedDate': '2017-06-19T12:49:22.074+03:00',
            'version': 2,
            'parentId': 'd906041b-831f-44f2-bbec-84a02c452269',
            'parentType': 'pdi_schemas',
            'format': 'xsd',
            'size': 1766,
            'modifier': '00000000000000000',
            'checksum': '4c91e05e6f85aca52703ca1a3afc51ec0a6d84d4',
            'orphan': false,
            'last': 0,
            '_links': {
              'self': {
                'href': `http://localhost:8080/restapi/systemdata/applications/${applicationUuid}/contents/${pdiContentId}`
              },
              'http://identifiers.emc.com/delete': {
                'href': `http://localhost:8080/restapi/systemdata/applications/${applicationUuid}/contents/${pdiContentId}`
              },
              'http://identifiers.emc.com/content-download': {
                'href': `http://localhost:8080/restapi/systemdata/applications/${applicationUuid}/contents/${pdiContentId}/download`
              }
            }
          }
        ],
      },
      '_links': {
        'self': {
          'href': 'http://localhost:8080/restapi/systemdata/pdi-schemas/d906041b-831f-44f2-bbec-84a02c452269/contents'
        }
      },
      'page': {
        'size': 10,
        'totalElements': 1,
        'totalPages': 1,
        'number': 0
      }
    };

    // suppress long lines inspection
    //noinspection TsLint
    const pdiContentResponseBody = '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\
    <!--\
      ~ Copyright (c) 2015.  EMC Corporation. All Rights Reserved.\
    ~ EMC Confidential: Restricted Internal Distribution\
    -->\
\
    <xs:schema xmlns:xs=\"http://www.w3.org/2001/XMLSchema\" xmlns=\"urn:ia-impl:en:xsd:documentholding.1.0\" targetNamespace=\"urn:ia-impl:en:xsd:documentholding.1.0\" elementFormDefault=\"qualified\"\
    attributeFormDefault=\"unqualified\">\
\
      <xs:complexType name=\"documents\">\
      <xs:sequence>\
    <xs:element name="\document\" type=\"document\" minOccurs=\"1\" maxOccurs=\"500\" />\
      </xs:sequence>\
    </xs:complexType>\
\
    <xs:complexType name=\"document\">\
      <xs:sequence>\
    <xs:element name=\"docId\" type=\"xs:string\" minOccurs=\"1\" maxOccurs=\"1\" />\
      <xs:element name=\"name\" type=\"xs:string\" minOccurs=\"1\" maxOccurs=\"1\" />\
      <xs:element name=\"author\" type=\"xs:string\" minOccurs=\"1\" maxOccurs=\"1\" />\
      <xs:element name=\"creationDate\" type=\"xs:dateTime\" minOccurs=\"1\" maxOccurs=\"1\" />\
      <xs:element name=\"version\" type=\"xs:int\" minOccurs=\"1\" maxOccurs=\"1\" />\
      <xs:element name=\"attachments\">\
      <xs:complexType>\
    <xs:sequence>\
    <xs:element name=\"attachment\" type=\"attachment\" minOccurs=\"0\" maxOccurs=\"5000\" />\
      </xs:sequence>\
    </xs:complexType>\
    </xs:element>\
    </xs:sequence>\
    </xs:complexType>\
    <xs:complexType name=\"attachment\">\
      <xs:sequence>\
    <xs:element name=\"name\" type=\"xs:string\"/>\
      <xs:element name=\"size\" type=\"xs:long\" />\
      <xs:element name=\"mediaType\" type=\"xs:string\" />\
      <xs:element name=\"createdBy\" type=\"xs:string\" />\
      <xs:element name=\"creationDate\" type=\"xs:dateTime\" />\
      </xs:sequence>\
    </xs:complexType>\
\
    <xs:element name=\"documents\" type=\"documents\" />\
\
      </xs:schema>';


    it('should get pdi schema content', (done) => {
      backend.connections.subscribe((connection: MockConnection) => {
        switch (connection.request.url) {
          case `http://localhost:8090/restapi/systemdata/applications/${applicationUuid}/pdi-schemas`: {
            expect(connection.request.method).toEqual(RequestMethod.Get);
            expect(connection.request.headers.get('Authorization'))
              .toEqual(`${authResponseBody.token_type} ${authResponseBody.access_token}`);

            const options = new ResponseOptions({body: pdiSchemaResponseBody});

            connection.mockRespond(new Response(options));
            break;
          }
          case `http://localhost:8090/restapi/systemdata/pdi-schemas/${pdiSchemaId}/contents`: {
            expect(connection.request.method).toEqual(RequestMethod.Get);
            expect(connection.request.headers.get('Authorization'))
              .toEqual(`${authResponseBody.token_type} ${authResponseBody.access_token}`);

            const options = new ResponseOptions({body: pdiSchemaContentsResponseBody});

            connection.mockRespond(new Response(options));
            break;
          }
          case `http://localhost:8090/restapi/systemdata/applications/${applicationUuid}/contents/${pdiContentId}/download`: {
            expect(connection.request.method).toEqual(RequestMethod.Get);
            expect(connection.request.headers.get('Authorization'))
              .toEqual(`${authResponseBody.token_type} ${authResponseBody.access_token}`);

            const options = new ResponseOptions({body: pdiContentResponseBody});

            connection.mockRespond(new Response(options));
          }}
        });
      apiService.getApplicationPdiSchemaContent(applicationUuid)
        .subscribe((res: string) => {
          expect(res).toEqual(pdiContentResponseBody);
        }, (err) => fail(`should not throw error: ${err}`), () => {
          done();
        });
    });

    it('should get pdi schema name', (done) => {
      backend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.url)
          .toEqual(`http://localhost:8090/restapi/systemdata/applications/${applicationUuid}/pdi-schemas`);
        expect(connection.request.method).toEqual(RequestMethod.Get);
        expect(connection.request.headers.get('Authorization'))
          .toEqual(`${authResponseBody.token_type} ${authResponseBody.access_token}`);

        const options = new ResponseOptions({body: pdiSchemaResponseBody});

        connection.mockRespond(new Response(options));
      });

      apiService.getApplicationPdiSchemaName(applicationUuid)
        .subscribe((result: string) => {
          expect(result).toEqual('urn:ia-impl:en:xsd:documentholding.1.0');
        }, (err) => fail(`should not throw error: ${err}`), () => {
          done();
        });
    });

    // suppress long lines inspection
    //noinspection TsLint
    const holdingResponseBody = {
      '_embedded': {
        'holdings': [
          {
            'createdBy': 'sue@iacustomer.com',
            'createdDate': '2017-06-19T12:49:22.836+03:00',
            'lastModifiedBy': 'sue@iacustomer.com',
            'lastModifiedDate': '2017-06-19T12:49:22.976+03:00',
            'version': 2,
            'name': 'DocumentHolding',
            'ingestConfigs': [
              {
                'sipFormat': 'sip_zip',
                'ingestName': 'DocumentHolding-ingest'
              },
              {
                'sipFormat': 'eas_sip_zip',
                'ingestName': 'DocumentHolding-ingest'
              }
            ],
            'pdiConfigs': [
              {
                'schema': 'urn:ia-impl:en:xsd:documentholding.1.0',
                'pdiName': 'DocumentHolding-pdi'
              }
            ],
            'priority': 1,
            'subPriorities': [
              {
                'priority': 0,
                'deadLine': 100
              },
              {
                'priority': 1,
                'deadLine': 200
              }
            ],
            'pdiXmlHashEnforced': false,
            'pdiXmlHashValidationEnabled': false,
            'ciHashValidationEnabled': false,
            'syncCommitEnabled': true,
            'keepSipAfterCommitEnabled': false,
            'keepSipOnRejInvEnabled': false,
            'keepPdiXmlAfterIngestEnabled': false,
            'keepCiOnRejInvEnabled': false,
            'keepXmlOnRejInvEnabled': false,
            'logStoreEnabled': true,
            'retentionClasses': [
              {
                'name': 'default',
                'policies': [
                  'DocumentHolding-policy'
                ],
                'holds': null
              }
            ],
            'pushRetentionOnRejInvEnabled': false,
            'xdbMode': 'AGGREGATE',
            'permissionSet': {
              'reception': {
                'groups': [],
              },
              'ingestion': {
                'groups': [],
              },
              'waitingCommit': {
                'groups': [],
              },
              'completed': {
                'groups': [],
              },
              'purge': {
                'groups': [],
              },
              'reject': {
                'groups': [],
              },
              'invalid': {
                'groups': [],
              }
            },
            'ingestNodeNames': [
              'ingest_node_01'
            ],
            '_links': {
              'self': {
                'href': 'http://localhost:8080/restapi/systemdata/holdings/4af83bce-0d22-438a-aaa1-354f31fb6766'
              },
              'http://identifiers.emc.com/update': {
                'href': 'http://localhost:8080/restapi/systemdata/holdings/4af83bce-0d22-438a-aaa1-354f31fb6766'
              },
              'http://identifiers.emc.com/delete': {
                'href': 'http://localhost:8080/restapi/systemdata/holdings/4af83bce-0d22-438a-aaa1-354f31fb6766'
              },
              'http://identifiers.emc.com/application': {
                'href': 'http://localhost:8080/restapi/systemdata/applications/32c4d223-34cc-4635-a9f9-329a70582327'
              },
              'http://identifiers.emc.com/sip-store': {
                'href': 'http://localhost:8080/restapi/systemdata/stores/cb2705bb-03e3-4e70-993d-73492443b94b'
              },
              'http://identifiers.emc.com/logs-store': {
                'href': 'http://localhost:8080/restapi/systemdata/stores/cb2705bb-03e3-4e70-993d-73492443b94b'
              },
              'http://identifiers.emc.com/xml-store': {
                'href': 'http://localhost:8080/restapi/systemdata/stores/cb2705bb-03e3-4e70-993d-73492443b94b'
              },
              'http://identifiers.emc.com/ci-store': {
                'href': 'http://localhost:8080/restapi/systemdata/stores/cb2705bb-03e3-4e70-993d-73492443b94b'
              },
              'http://identifiers.emc.com/xdb-store': {
                'href': 'http://localhost:8080/restapi/systemdata/stores/cb2705bb-03e3-4e70-993d-73492443b94b'
              },
              'http://identifiers.emc.com/rendition-store': {
                'href': 'http://localhost:8080/restapi/systemdata/stores/cb2705bb-03e3-4e70-993d-73492443b94b'
              },
              'http://identifiers.emc.com/managed-item-store': {
                'href': 'http://localhost:8080/restapi/systemdata/stores/cb2705bb-03e3-4e70-993d-73492443b94b'
              },
              'http://identifiers.emc.com/xdb-library': {
                'href': 'http://localhost:8080/restapi/systemdata/applications/32c4d223-34cc-4635-a9f9-329a70582327/xdb-libraries/f533ef57-7eaf-4dbb-961b-3ea6de6ef181'
              },
              'http://identifiers.emc.com/xdb-library-policy': {
                'href': 'http://localhost:8080/restapi/systemdata/xdb-library-policies/5853d8f6-bc7c-4f66-9715-cb0b123a1c33'
              },
              'ingest-nodes': {
                'href': 'http://localhost:8080/restapi/systemdata/holdings/4af83bce-0d22-438a-aaa1-354f31fb6766/ingest-nodes'
              },
              'http://identifiers.emc.com/backup': {
                'href': 'http://localhost:8080/restapi/systemdata/holdings/4af83bce-0d22-438a-aaa1-354f31fb6766/backup'
              },
              'http://identifiers.emc.com/recovery': {
                'href': 'http://localhost:8080/restapi/systemdata/holdings/4af83bce-0d22-438a-aaa1-354f31fb6766/recovery'
              },
              'http://identifiers.emc.com/restore': {
                'href': 'http://localhost:8080/restapi/systemdata/holdings/4af83bce-0d22-438a-aaa1-354f31fb6766/restore'
              },
              'http://identifiers.emc.com/detach': {
                'href': 'http://localhost:8080/restapi/systemdata/holdings/4af83bce-0d22-438a-aaa1-354f31fb6766/detach'
              }
            }
          }
        ],
      },
      '_links': {
        'self': {
          'href': 'http://localhost:8080/restapi/systemdata/applications/32c4d223-34cc-4635-a9f9-329a70582327/holdings'
        },
        'http://identifiers.emc.com/add': {
          'href': 'http://localhost:8080/restapi/systemdata/applications/32c4d223-34cc-4635-a9f9-329a70582327/holdings'
        }
      },
      'page': {
        'size': 10,
        'totalElements': 1,
        'totalPages': 1,
        'number': 0
      }
    };

    it('should get application holding name', (done) => {
      backend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.url)
          .toEqual(`http://localhost:8090/restapi/systemdata/applications/${applicationUuid}/holdings`);
        expect(connection.request.method).toEqual(RequestMethod.Get);
        expect(connection.request.headers.get('Authorization'))
          .toEqual(`${authResponseBody.token_type} ${authResponseBody.access_token}`);

        const options = new ResponseOptions({body: holdingResponseBody});

        connection.mockRespond(new Response(options));
      });

      apiService.getApplicationHoldingName(applicationUuid)
        .subscribe((result: string) => {
          expect(result).toEqual('DocumentHolding');
        }, (err) => fail(`should not throw error: ${err}`), () => {
          done();
        });
    });


    const executeSearchRowIds = [
      'a0e8c185-ea93-46cc-8367-e5b8d7513ffd:row:75bc204c-53b5-4b6c-b423-0d60eaadb384',
      'a0e8c185-ea93-46cc-8367-e5b8d7513ffd:row:1310b4ba-3736-47a8-81b2-d410a6dda017',
      'row_UUID_3'
    ];

    // suppress long lines inspection
    //noinspection TsLint
    const executeSearchResponseBody = {
      '_embedded': {
        'results': [{
          'rows': [{
            'columns': [{
              'name': 'lastName',
              'value': 'Zimmer'
            }, {
              'name': 'firstName',
              'value': 'qk4E79gUvCT+k25nibaV8g=='
            }, {
              'name': 'birthYear',
              'value': '1860'
            }, {
              'name': 'birthMonth',
              'value': '11'
            }, {
              'name': 'birthDay',
              'value': '23'
            }, {
              'name': 'height',
              'value': '72'
            }, {
              'name': 'weight',
              'value': '190'
            }, {
              'name': 'debut'
            }, {
              'name': 'finalGame',
              'value': '1903-09-27T00:00:00.000'
            }],
            'id': executeSearchRowIds[0]
          }, {
            'columns': [{
              'name': 'lastName',
              'value': 'Zimmer'
            }, {
              'name': 'firstName',
              'value': 'ukDdu+6FS0yq7J2Hx/qkZg=='
            }, {
              'name': 'birthYear',
              'value': '1931'
            }, {
              'name': 'birthMonth',
              'value': '1'
            }, {
              'name': 'birthDay',
              'value': '17'
            }, {
              'name': 'height',
              'value': '69'
            }, {
              'name': 'weight',
              'value': '165'
            }, {
              'name': 'debut',
              'value': '1954-07-02T00:00:00.000'
            }, {
              'name': 'finalGame',
              'value': '1965-10-02T00:00:00.000'
            }],
            'id': executeSearchRowIds[1]
          }],
          'totalElements': 2,
          'executionTime': 297,
          'empty': false
        }]
      },
      '_links': {
        'self': {
          'href': 'http://10.8.42.215:8765/systemdata/search-compositions/e77fa9ef-f281-4ad5-a511-1d15df157065/search-results/d2a1871d-d6a4-482b-81b7-99f0897baa67'
        },
        'http://identifiers.emc.com/export': {
          'href': 'http://10.8.42.215:8765/systemdata/search-compositions/e77fa9ef-f281-4ad5-a511-1d15df157065/search-results/d2a1871d-d6a4-482b-81b7-99f0897baa67/export'
        }
      },
      'page': {
        'size': 10,
        'totalElements': 2,
        'totalPages': 1,
        'number': 0
      }
    };
    const searchCompositionUUID = 'searchCompositionUUID';
    const executeSearchRequestBody = '<data><firstName></firstName><lastName>Zimmer</lastName></data>';

    it('should get search results', (done) => {
      backend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.url)
          .toEqual(`http://localhost:8090/restapi/systemdata/search-compositions/${searchCompositionUUID}?page=0&size=10`);
        expect(connection.request.method).toEqual(RequestMethod.Post);
        expect(connection.request.headers.get('Authorization'))
          .toEqual(`${authResponseBody.token_type} ${authResponseBody.access_token}`);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/xml');

        const options = new ResponseOptions({body: executeSearchResponseBody});

        connection.mockRespond(new Response(options));
      });

      let totalResults = 0;
      apiService.executeSearch(searchCompositionUUID, executeSearchRequestBody)
        .subscribe((result: PagedList<SearchResultRow>) => {
          expect(result.total).toEqual(executeSearchRowIds[totalResults]);

          totalResults++;
        }, (err) => fail(`should not throw error: ${err}`), () => {
          expect(totalResults).toEqual(2);

          done();
        });
    });

    // suppress long lines inspection
    //noinspection TsLint
    const executeSearchResponseBodyPaged = [
      {
        '_embedded': {
          'results': [{
            'rows': [{
              'columns': [],
              'id': executeSearchRowIds[0]
            }],
            'totalElements': 1,
            'executionTime': 297,
            'empty': false
          }]
        },
        '_links': {
          'self': {
            'href': base_host + '/systemdata/search-compositions/e77fa9ef-f281-4ad5-a511-1d15df157065/search-results/d2a1871d-d6a4-482b-81b7-99f0897baa67'
          },
          'next': {
            'href': base_host + '/systemdata/search-compositions/e77fa9ef-f281-4ad5-a511-1d15df157065/search-results/d2a1871d-d6a4-482b-81b7-99f0897baa67?page=1&size=1'
          },
          'http://identifiers.emc.com/export': {
            'href': base_host + '/systemdata/search-compositions/e77fa9ef-f281-4ad5-a511-1d15df157065/search-results/d2a1871d-d6a4-482b-81b7-99f0897baa67/export'
          }
        },
        'page': {
          'size': 1,
          'totalElements': 1,
          'totalPages': 3,
          'number': 0
        }
      },
      {
        '_embedded': {
          'results': [{
            'rows': [{
              'columns': [],
              'id': executeSearchRowIds[1]
            }],
            'totalElements': 1,
            'executionTime': 297,
            'empty': false
          }]
        },
        '_links': {
          'self': {
            'href': 'http://10.8.42.215:8765/systemdata/search-compositions/e77fa9ef-f281-4ad5-a511-1d15df157065/search-results/d2a1871d-d6a4-482b-81b7-99f0897baa67'
          },
          'next': {
            'href': base_host + '/systemdata/search-compositions/e77fa9ef-f281-4ad5-a511-1d15df157065/search-results/d2a1871d-d6a4-482b-81b7-99f0897baa67?page=2&size=1'
          },
          'http://identifiers.emc.com/export': {
            'href': 'http://10.8.42.215:8765/systemdata/search-compositions/e77fa9ef-f281-4ad5-a511-1d15df157065/search-results/d2a1871d-d6a4-482b-81b7-99f0897baa67/export'
          }
        },
        'page': {
          'size': 1,
          'totalElements': 1,
          'totalPages': 3,
          'number': 1
        }
      },
      {
        '_embedded': {
          'results': [{
            'rows': [{
              'columns': [],
              'id': executeSearchRowIds[2]
            }],
            'totalElements': 1,
            'executionTime': 297,
            'empty': false
          }]
        },
        '_links': {
          'self': {
            'href': 'http://10.8.42.215:8765/systemdata/search-compositions/e77fa9ef-f281-4ad5-a511-1d15df157065/search-results/d2a1871d-d6a4-482b-81b7-99f0897baa67'
          },
          'http://identifiers.emc.com/export': {
            'href': 'http://10.8.42.215:8765/systemdata/search-compositions/e77fa9ef-f281-4ad5-a511-1d15df157065/search-results/d2a1871d-d6a4-482b-81b7-99f0897baa67/export'
          }
        },
        'page': {
          'size': 1,
          'totalElements': 1,
          'totalPages': 3,
          'number': 2
        }
      }];

    it('should get search results page by page', (done) => {
      let pageIndex = 0;
      backend.connections.subscribe((connection: MockConnection) => {
        expect(pageIndex).toBeLessThan(3);

        const options = new ResponseOptions({body: executeSearchResponseBodyPaged[pageIndex]});
        connection.mockRespond(new Response(options));
        pageIndex++;
      });

      let totalResults = 0;
      apiService.executeSearch(searchCompositionUUID, executeSearchRequestBody, 0, 1)
        .subscribe((result: PagedList<SearchResultRow>) => {
          expect(result.data[0].id).toEqual(executeSearchRowIds[totalResults]);

          totalResults++;
        }, (err) => fail(`should not throw error: ${err}`), () => {
          expect(totalResults).toEqual(3);

          done();
        });
    });

    xit('should get search results lazy', (done) => {
      let pageIndex = 0;
      backend.connections.subscribe((connection: MockConnection) => {
        console.log(connection.request);
        expect(pageIndex).toBeLessThan(2);

        const options = new ResponseOptions({body: executeSearchResponseBodyPaged[pageIndex]});
        connection.mockRespond(new Response(options));
        pageIndex++;
      });

      let totalResults = 0;
      apiService.executeSearch(searchCompositionUUID, executeSearchRequestBody, 0, 1)
        .take(1)
        .subscribe((result: PagedList<SearchResultRow>) => {
          expect(result.data[0].id).toEqual(executeSearchRowIds[totalResults]);

          totalResults++;
        }, (err) => fail(`should not throw error: ${err}`), () => {
          expect(totalResults).toEqual(1);

          done();
        });
    });

    const applicationSearchesUUIDs = [
      'UUID0', 'UUID1', 'UUID2', 'UUID3'
    ];

    const applicationSearchesResponseBody = {
      '_embedded': {
        'searches': [
          {
            'createdBy': 'connie@iacustomer.com',
            'lastModifiedBy': 'sue@iacustomer.com',
            'lastModifiedDate': '2016-12-11T15:56:34.108-08:00',
            'version': 32,
            'name': 'Debut Date Range Search',
            'description': 'Baseball Search Debut date',
            'nestedSearch': false,
            'state': 'PUBLISHED',
            'inUse': false,
            '_links': {
              'self': {
                'href': `http://10.8.42.215:8765/systemdata/searches/${applicationSearchesUUIDs[0]}`
              },
              'http://identifiers.emc.com/search-compositions': {
                'href': 'http://10.8.42.215:8765/systemdata/searches/8e5f0e30-763a-4a02-bd67-68015ffc570f/search-compositions'
              },
              'http://identifiers.emc.com/all-components': {
                'href': 'http://10.8.42.215:8765/systemdata/searches/8e5f0e30-763a-4a02-bd67-68015ffc570f/all-components'
              },
              'http://identifiers.emc.com/export': {
                'href': 'http://10.8.42.215:8765/systemdata/searches/8e5f0e30-763a-4a02-bd67-68015ffc570f'
              },
              'http://identifiers.emc.com/update': {
                'href': 'http://10.8.42.215:8765/systemdata/searches/8e5f0e30-763a-4a02-bd67-68015ffc570f'
              },
              'http://identifiers.emc.com/copy': {
                'href': 'http://10.8.42.215:8765/systemdata/searches/8e5f0e30-763a-4a02-bd67-68015ffc570f/copy'
              },
              'http://identifiers.emc.com/delete': {
                'href': 'http://10.8.42.215:8765/systemdata/searches/8e5f0e30-763a-4a02-bd67-68015ffc570f'
              },
              'http://identifiers.emc.com/application': {
                'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955'
              },
              'http://identifiers.emc.com/schema': {
                'href': 'http://10.8.42.215:8765/systemdata/schemas/e7066868-6824-405b-aa20-0d55ffe91688'
              },
              'http://identifiers.emc.com/table': {
                'href': 'http://10.8.42.215:8765/systemdata/tables/a0e8c185-ea93-46cc-8367-e5b8d7513ffd'
              }
            }
          },
          {
            'createdBy': 'connie@iacustomer.com',
            'lastModifiedBy': 'sue@iacustomer.com',
            'lastModifiedDate': '2016-12-11T15:56:35.936-08:00',
            'version': 28,
            'name': 'Player Search with Advance Control',
            'description': 'Baseball Search Debut date',
            'nestedSearch': false,
            'state': 'PUBLISHED',
            'inUse': false,
            '_links': {
              'self': {
                'href': `http://10.8.42.215:8765/systemdata/searches/${applicationSearchesUUIDs[1]}`
              },
              'http://identifiers.emc.com/search-compositions': {
                'href': 'http://10.8.42.215:8765/systemdata/searches/65c659a1-a0d1-4583-8a13-9433b5eed313/search-compositions'
              },
              'http://identifiers.emc.com/all-components': {
                'href': 'http://10.8.42.215:8765/systemdata/searches/65c659a1-a0d1-4583-8a13-9433b5eed313/all-components'
              },
              'http://identifiers.emc.com/export': {
                'href': 'http://10.8.42.215:8765/systemdata/searches/65c659a1-a0d1-4583-8a13-9433b5eed313'
              },
              'http://identifiers.emc.com/update': {
                'href': 'http://10.8.42.215:8765/systemdata/searches/65c659a1-a0d1-4583-8a13-9433b5eed313'
              },
              'http://identifiers.emc.com/copy': {
                'href': 'http://10.8.42.215:8765/systemdata/searches/65c659a1-a0d1-4583-8a13-9433b5eed313/copy'
              },
              'http://identifiers.emc.com/delete': {
                'href': 'http://10.8.42.215:8765/systemdata/searches/65c659a1-a0d1-4583-8a13-9433b5eed313'
              },
              'http://identifiers.emc.com/application': {
                'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955'
              },
              'http://identifiers.emc.com/schema': {
                'href': 'http://10.8.42.215:8765/systemdata/schemas/e7066868-6824-405b-aa20-0d55ffe91688'
              },
              'http://identifiers.emc.com/table': {
                'href': 'http://10.8.42.215:8765/systemdata/tables/a0e8c185-ea93-46cc-8367-e5b8d7513ffd'
              }
            }
          }]
      },
      '_links': {
        'self': {
          'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955/searches'
        },
        'http://identifiers.emc.com/add': {
          'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955/searches'
        },
        'http://identifiers.emc.com/import': {
          'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955/import'
        }
      },
      'page': {
        'size': 2,
        'totalElements': 2,
        'totalPages': 1,
        'number': 0
      }
    };

    const applicationSearchesResponseBodyPaged = [
      {
        '_embedded': {
          'searches': [
            {
              'createdBy': 'connie@iacustomer.com',
              'lastModifiedBy': 'sue@iacustomer.com',
              'lastModifiedDate': '2016-12-11T15:56:34.108-08:00',
              'version': 32,
              'name': 'Debut Date Range Search',
              'description': 'Baseball Search Debut date',
              'nestedSearch': false,
              'state': 'PUBLISHED',
              'inUse': false,
              '_links': {
                'self': {
                  'href': `http://10.8.42.215:8765/systemdata/searches/${applicationSearchesUUIDs[0]}`
                },
                'http://identifiers.emc.com/search-compositions': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/8e5f0e30-763a-4a02-bd67-68015ffc570f/search-compositions'
                },
                'http://identifiers.emc.com/all-components': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/8e5f0e30-763a-4a02-bd67-68015ffc570f/all-components'
                },
                'http://identifiers.emc.com/export': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/8e5f0e30-763a-4a02-bd67-68015ffc570f'
                },
                'http://identifiers.emc.com/update': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/8e5f0e30-763a-4a02-bd67-68015ffc570f'
                },
                'http://identifiers.emc.com/copy': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/8e5f0e30-763a-4a02-bd67-68015ffc570f/copy'
                },
                'http://identifiers.emc.com/delete': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/8e5f0e30-763a-4a02-bd67-68015ffc570f'
                },
                'http://identifiers.emc.com/application': {
                  'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955'
                },
                'http://identifiers.emc.com/schema': {
                  'href': 'http://10.8.42.215:8765/systemdata/schemas/e7066868-6824-405b-aa20-0d55ffe91688'
                },
                'http://identifiers.emc.com/table': {
                  'href': 'http://10.8.42.215:8765/systemdata/tables/a0e8c185-ea93-46cc-8367-e5b8d7513ffd'
                }
              }
            },
            {
              'createdBy': 'connie@iacustomer.com',
              'lastModifiedBy': 'sue@iacustomer.com',
              'lastModifiedDate': '2016-12-11T15:56:35.936-08:00',
              'version': 28,
              'name': 'Player Search with Advance Control',
              'description': 'Baseball Search Debut date',
              'nestedSearch': false,
              'state': 'PUBLISHED',
              'inUse': false,
              '_links': {
                'self': {
                  'href': `http://10.8.42.215:8765/systemdata/searches/${applicationSearchesUUIDs[1]}`
                },
                'http://identifiers.emc.com/search-compositions': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/65c659a1-a0d1-4583-8a13-9433b5eed313/search-compositions'
                },
                'http://identifiers.emc.com/all-components': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/65c659a1-a0d1-4583-8a13-9433b5eed313/all-components'
                },
                'http://identifiers.emc.com/export': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/65c659a1-a0d1-4583-8a13-9433b5eed313'
                },
                'http://identifiers.emc.com/update': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/65c659a1-a0d1-4583-8a13-9433b5eed313'
                },
                'http://identifiers.emc.com/copy': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/65c659a1-a0d1-4583-8a13-9433b5eed313/copy'
                },
                'http://identifiers.emc.com/delete': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/65c659a1-a0d1-4583-8a13-9433b5eed313'
                },
                'http://identifiers.emc.com/application': {
                  'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955'
                },
                'http://identifiers.emc.com/schema': {
                  'href': 'http://10.8.42.215:8765/systemdata/schemas/e7066868-6824-405b-aa20-0d55ffe91688'
                },
                'http://identifiers.emc.com/table': {
                  'href': 'http://10.8.42.215:8765/systemdata/tables/a0e8c185-ea93-46cc-8367-e5b8d7513ffd'
                }
              }
            }]
        },
        '_links': {
          'self': {
            'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955/searches'
          },
          'http://identifiers.emc.com/add': {
            'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955/searches'
          },
          'http://identifiers.emc.com/import': {
            'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955/import'
          }
        },
        'page': {
          'size': 2,
          'totalElements': 4,
          'totalPages': 2,
          'number': 0
        }
      },
      {
        '_embedded': {
          'searches': [
            {
              'createdBy': 'connie@iacustomer.com',
              'lastModifiedBy': 'sue@iacustomer.com',
              'lastModifiedDate': '2016-12-11T15:56:37.992-08:00',
              'version': 22,
              'name': 'Search By Player Name - Encryption',
              'description': 'Baseball Search Debut date',
              'nestedSearch': false,
              'state': 'PUBLISHED',
              'inUse': false,
              '_links': {
                'self': {
                  'href': `http://10.8.42.215:8765/systemdata/searches/${applicationSearchesUUIDs[2]}`
                },
                'http://identifiers.emc.com/search-compositions': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/da56d3ce-4ca5-4e37-b494-4dad7197b444/search-compositions'
                },
                'http://identifiers.emc.com/all-components': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/da56d3ce-4ca5-4e37-b494-4dad7197b444/all-components'
                },
                'http://identifiers.emc.com/export': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/da56d3ce-4ca5-4e37-b494-4dad7197b444'
                },
                'http://identifiers.emc.com/update': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/da56d3ce-4ca5-4e37-b494-4dad7197b444'
                },
                'http://identifiers.emc.com/copy': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/da56d3ce-4ca5-4e37-b494-4dad7197b444/copy'
                },
                'http://identifiers.emc.com/delete': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/da56d3ce-4ca5-4e37-b494-4dad7197b444'
                },
                'http://identifiers.emc.com/application': {
                  'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955'
                },
                'http://identifiers.emc.com/schema': {
                  'href': 'http://10.8.42.215:8765/systemdata/schemas/e7066868-6824-405b-aa20-0d55ffe91688'
                },
                'http://identifiers.emc.com/table': {
                  'href': 'http://10.8.42.215:8765/systemdata/tables/a0e8c185-ea93-46cc-8367-e5b8d7513ffd'
                }
              }
            },
            {
              'createdBy': 'sue@iacustomer.com',
              'lastModifiedBy': 'sue@iacustomer.com',
              'lastModifiedDate': '2016-12-11T15:56:39.921-08:00',
              'version': 13,
              'name': 'Search By Player Name',
              'description': 'Baseball Search Debut date',
              'nestedSearch': false,
              'state': 'PUBLISHED',
              'inUse': true,
              '_links': {
                'self': {
                  'href': `http://10.8.42.215:8765/systemdata/searches/${applicationSearchesUUIDs[3]}`
                },
                'http://identifiers.emc.com/search-compositions': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/e44eb2f5-6445-4b43-86b4-f3239f4db697/search-compositions'
                },
                'http://identifiers.emc.com/all-components': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/e44eb2f5-6445-4b43-86b4-f3239f4db697/all-components'
                },
                'http://identifiers.emc.com/export': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/e44eb2f5-6445-4b43-86b4-f3239f4db697'
                },
                'http://identifiers.emc.com/update': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/e44eb2f5-6445-4b43-86b4-f3239f4db697'
                },
                'http://identifiers.emc.com/copy': {
                  'href': 'http://10.8.42.215:8765/systemdata/searches/e44eb2f5-6445-4b43-86b4-f3239f4db697/copy'
                },
                'http://identifiers.emc.com/application': {
                  'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955'
                },
                'http://identifiers.emc.com/schema': {
                  'href': 'http://10.8.42.215:8765/systemdata/schemas/e7066868-6824-405b-aa20-0d55ffe91688'
                },
                'http://identifiers.emc.com/table': {
                  'href': 'http://10.8.42.215:8765/systemdata/tables/a0e8c185-ea93-46cc-8367-e5b8d7513ffd'
                }
              }
            }]
        },
        '_links': {
          'self': {
            'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955/searches'
          },
          'http://identifiers.emc.com/add': {
            'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955/searches'
          },
          'http://identifiers.emc.com/import': {
            'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955/import'
          }
        },
        'page': {
          'size': 2,
          'totalElements': 4,
          'totalPages': 2,
          'number': 1
        }
      }];

    const applicationUUID = 'APP_UUID';

    it('should get application searches', (done) => {
      backend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.url)
          .toEqual(`http://localhost:8090/restapi/systemdata/applications/${applicationUUID}/searches?page=0&size=2`);
        expect(connection.request.method).toEqual(RequestMethod.Get);
        expect(connection.request.headers.get('Authorization'))
          .toEqual(`${authResponseBody.token_type} ${authResponseBody.access_token}`);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/xml');

        const options = new ResponseOptions({body: applicationSearchesResponseBody});

        connection.mockRespond(new Response(options));
      });

      let totalResults = 0;
      apiService.getApplicationSearches(applicationUUID, 0, 2)
        .subscribe((result: Search) => {
          expect(result.uuid).toEqual(applicationSearchesUUIDs[totalResults]);

          totalResults++;
        }, (err) => fail(`should not throw error: ${err}`), () => {
          expect(totalResults).toEqual(2);

          done();
        });
    });

    it('should get application searches page by page', (done) => {
      let totalConnections = 0;
      backend.connections.subscribe((connection: MockConnection) => {
        const options = new ResponseOptions({body: applicationSearchesResponseBodyPaged[totalConnections++]});

        connection.mockRespond(new Response(options));
      });

      let totalResults = 0;
      apiService.getApplicationSearches(applicationUUID, 0, 2)
        .subscribe((result: Search) => {
          expect(result.uuid).toEqual(applicationSearchesUUIDs[totalResults]);

          totalResults++;
        }, (err) => fail(`should not throw error: ${err}`), () => {
          expect(totalConnections).toEqual(2);
          expect(totalResults).toEqual(4);

          done();
        });
    });

    const emptyApplicationSearchesResponseBody = {
      '_links': {
        'self': {
          'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955/searches'
        },
        'http://identifiers.emc.com/add': {
          'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955/searches'
        },
        'http://identifiers.emc.com/import': {
          'href': 'http://10.8.42.215:8765/systemdata/applications/f76878a5-37e9-4cae-947b-a824485ec955/import'
        }
      },
      'page': {
        'size': 10,
        'totalElements': 0,
        'totalPages': 1,
        'number': 0
      }
    };

    it('should handle empty application searches list', (done) => {

      backend.connections.subscribe((connection: MockConnection) => {
        const options = new ResponseOptions({body: emptyApplicationSearchesResponseBody});

        connection.mockRespond(new Response(options));
      });

      let totalResults = 0;
      apiService.getApplicationSearches(applicationUUID, 0, 2)
        .subscribe(() => {
          totalResults++;
        }, (err) => fail(`should not throw error: ${err}`), () => {
          expect(totalResults).toEqual(0);

          done();
        });
    });

    //noinspection TsLint
    const ingestionResponseBody = {
      'createdBy' : 'sue@iacustomer.com',
      'createdDate' : '2017-06-20T14:00:32.383+02:00',
      'lastModifiedBy' : 'sue@iacustomer.com',
      'lastModifiedDate' : '2017-06-20T14:00:33.024+02:00',
      'version' : 15,
      'name' : 'DocumentHolding-DocumentHolding-2daf3523-6510-4881-ac05-0a277334fe13-1',
      'aipId' : 'dcdd0e4e-5fc6-4871-a527-9bf515bbd951',
      'dss' : {
        'id' : '2daf3523-6510-4881-ac05-0a277334fe13',
        'holdingName' : 'DocumentHolding',
        'pdiSchema' : 'urn:ia-impl:en:xsd:documentholding.1.0',
        'productionDate' : '2016-08-09T16:57:35.873+05:30',
        'baseRetentionDate' : '2016-08-09T16:57:34.469+05:30',
        'producer' : 'DocumentHolding',
        'entity' : 'DocumentHolding',
        'priority' : 0,
        'application' : 'DocumentHolding'
      },
      'sipProductionDate' : '2016-08-09T16:57:35.873+05:30',
      'sipSeqno' : 1,
      'sipIsLast' : true,
      'sipAiuCount' : 1,
      'sipPageCount' : 0,
      'dirty' : false,
      'pkeys' : {
        'dateTime01' : '2016-08-09T16:57:23.329+05:30',
        'dateTime02' : '2016-08-09T16:57:23.329+05:30',
        'values01' : [ 'testdoc2' ],
        'values02' : [ 'testdoc2' ],
        'values03' : [ 'andrey' ]
      },
      'ingestDeadlineDate' : '2017-06-20T15:40:32.321+02:00',
      'pdiFileSize' : 283,
      'pdiValuesCharCount' : 52,
      'stateCode' : 'COM',
      'phaseCode' : 'COM',
      'xdbMode' : 'AGGREGATE',
      'xdbPdiSchema' : 'urn:ia-impl:en:xsd:documentholding.1.0',
      'partOfAggregate' : true,
      'aggregateCiSeqno' : 3,
      'aggregateAiuSeqno' : 4,
      'pdiConfigName' : 'DocumentHolding-pdi',
      'priority' : 1,
      'receiveStartDate' : '2017-06-20T14:00:32.321+02:00',
      'receiverNodeName' : 'receiver_node_01',
      'sipFileFormat' : 'sip_zip',
      'sipFileSize' : 702,
      'sipFileHash' : 'ac3447a1431cc6917d5e7486c3687c99fd3fd469',
      'ingestWaitStartDate' : '2017-06-20T14:00:32.383+02:00',
      'ingestStartDate' : '2017-06-20T14:00:32.477+02:00',
      'ingestNodeName' : 'ingest_node_01',
      'ingestConfigName' : 'DocumentHolding-ingest',
      'commitWaitStartDate' : '2017-06-20T14:00:32.899+02:00',
      'commitSync' : true,
      'commitDate' : '2017-06-20T14:00:32.962+02:00',
      'returnCode' : 'OK',
      'underHold' : false,
      'underRetention' : false,
      'permission' : {
        'groups' : [ ]
      },
      'state' : 'Completed',
      'xdbLibraryIndexSize' : 0,
      'xdbLibrarySize' : 0,
      'xdbLibraryName' : 'f458da44-3803-4a50-9168-1304d44e7ee1',
      'xdbLibraryDetached' : false,
      'validAggregate' : false,
      'openAggregate' : false,
      'aggregate' : false,
      'phase' : 'Completed',
      '_links' : {
        'self' : {
          'href' : 'http://localhost:8080/restapi/systemdata/applications/673072a4-e634-4d2d-b02c-e58cdfd39ea8/aips/dcdd0e4e-5fc6-4871-a527-9bf515bbd951'
        },
        'http://identifiers.emc.com/delete' : {
          'href' : 'http://localhost:8080/restapi/systemdata/applications/673072a4-e634-4d2d-b02c-e58cdfd39ea8/aips/dcdd0e4e-5fc6-4871-a527-9bf515bbd951'
        },
        'http://identifiers.emc.com/application' : {
          'href' : 'http://localhost:8080/restapi/systemdata/applications/673072a4-e634-4d2d-b02c-e58cdfd39ea8'
        },
        'http://identifiers.emc.com/contents' : {
          'href' : 'http://localhost:8080/restapi/systemdata/applications/673072a4-e634-4d2d-b02c-e58cdfd39ea8/aips/dcdd0e4e-5fc6-4871-a527-9bf515bbd951/contents'
        },
        'http://identifiers.emc.com/invalid' : {
          'href' : 'http://localhost:8080/restapi/systemdata/applications/673072a4-e634-4d2d-b02c-e58cdfd39ea8/aips/dcdd0e4e-5fc6-4871-a527-9bf515bbd951/invalid'
        },
        'http://identifiers.emc.com/transform' : {
          'href' : 'http://localhost:8080/restapi/systemdata/applications/673072a4-e634-4d2d-b02c-e58cdfd39ea8/aips/dcdd0e4e-5fc6-4871-a527-9bf515bbd951/transform'
        },
        'http://identifiers.emc.com/xdb-library' : {
          'href' : 'http://localhost:8080/restapi/systemdata/applications/673072a4-e634-4d2d-b02c-e58cdfd39ea8/xdb-libraries/f458da44-3803-4a50-9168-1304d44e7ee1'
        },
        'http://identifiers.emc.com/aips-per-aggregate' : {
          'href' : 'http://localhost:8080/restapi/systemdata/applications/673072a4-e634-4d2d-b02c-e58cdfd39ea8/aips/dcdd0e4e-5fc6-4871-a527-9bf515bbd951/aips'
        },
        'http://identifiers.emc.com/request-close' : {
          'href' : 'http://localhost:8080/restapi/systemdata/applications/673072a4-e634-4d2d-b02c-e58cdfd39ea8/aips/dcdd0e4e-5fc6-4871-a527-9bf515bbd951/request-close'
        },
        'http://identifiers.emc.com/groups' : {
          'href' : 'http://localhost:8080/restapi/systemdata/applications/673072a4-e634-4d2d-b02c-e58cdfd39ea8/aips/dcdd0e4e-5fc6-4871-a527-9bf515bbd951/groups'
        }
      }
    };

    it('should ingest data', (done) => {
      const zip = 'ZIP_BLOB';

      backend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.method).toEqual(RequestMethod.Post);

        const options = new ResponseOptions({body: ingestionResponseBody});

        connection.mockRespond(new Response(options));
      });

      apiService.ingest(applicationUuid, zip)
        .subscribe((result: IngestionResponse) => {
          expect(result).toBeDefined();
          done();
        });
    });

    it('should logout', (done) => {
      apiService.logout();

      apiService.throwErrorIfNotLoggedIn().subscribe(
        () => fail(),
        () => done()
      );
    });
  });
});
