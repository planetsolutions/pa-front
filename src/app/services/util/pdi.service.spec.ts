import {TestBed, inject} from '@angular/core/testing';
import {PdiService} from './pdi.service';
import {XsdParserService} from './xsd.parser.service';
import {Element} from '../../index';
import 'rxjs/add/operator/count';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';


describe('PdiService', () => {
  let pdiService: PdiService;
  let xsdParserService: XsdParserService;
  let structure: Element;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PdiService, XsdParserService]
    });
  });

  beforeEach(inject([PdiService, XsdParserService], (service, xsdService) => {
    pdiService = service;
    xsdParserService = xsdService;
  }));


  // suppress long lines inspection
  //noinspection TsLint
  const russianIAFormValue = {docId: "DocId", name: "DocName", author: "KarmaTest", creationDate: "2016-08-09T16:57:23.329+05:30", version: "1"};
  const russianIAxmlns = 'urn:ia:en:xsd:documentholding.1.0';
  const russianIAHoldingName = 'DocumentHolding';
  const russianIAXsdSchema = '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\
    <!--\
      ~ Copyright (c) 2015.  EMC Corporation. All Rights Reserved.\
    ~ EMC Confidential: Restricted Internal Distribution\
    -->\
\
    <xs:schema xmlns:xs=\"http://www.w3.org/2001/XMLSchema\" xmlns=\"urn:ia:en:xsd:documentholding.1.0\" targetNamespace=\"urn:ia:en:xsd:documentholding.1.0\" elementFormDefault=\"qualified\"\
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

  const russianIaPdi = '<?xml version=\"1.0\" encoding=\"utf-8\"?><documents xmlns=\"urn:ia:en:xsd:documentholding.1.0\"><document><docId>DocId</docId><name>DocName</name><author>KarmaTest</author><creationDate>2016-08-09T16:57:23.329+05:30</creationDate><version>1</version><attachments/></document></documents>';
  const russianIaSip = '<?xml version="1.0" encoding="utf-8"?><sip xmlns="urn:x-emc:ia:schema:sip:1.0"><dss><holding>DocumentHolding</holding><id>2daf3523-6510-4881-ac05-0a277334fe13</id><pdi_schema>urn:ia:en:xsd:documentholding.1.0</pdi_schema><production_date>2016-08-09T16:57:35.873+05:30</production_date><base_retention_date>2016-08-09T16:57:34.469+05:30</base_retention_date><producer>DocumentHolding</producer><entity>DocumentHolding</entity><priority>0</priority><application>DocumentHolding</application></dss><production_date>2016-08-09T16:57:35.873+05:30</production_date><seqno>1</seqno><is_last>true</is_last><aiu_count>1</aiu_count><page_count>0</page_count></sip>';

  it('should build pdi.xml without attachments for RussianIA', () => {
    pdiService.buildPdi(xsdParserService.parse(russianIAXsdSchema).elements[0], russianIAxmlns, russianIAFormValue, [])
      .subscribe(res => expect(res).toEqual(russianIaPdi));
  });

  it('should build sip.xml for RussianIA', () => {
    pdiService.buildSip(russianIAHoldingName, russianIAxmlns)
      .subscribe(res => expect(res).toEqual(russianIaSip));
  });

  const phoneCallsFormValue = {
    CallEndDate: "2016-08-09T16:57:23.329+05:30",
    CallFromPhoneNumber: "23456342123",
    CallStartDate: "2016-08-09T16:57:23.329+05:30",
    CallToPhoneNumber: "43958302948",
    CustomerFirstName: "FirstName",
    CustomerID: "431",
    CustomerLastName: "LastName",
    RepresentativeID: "58",
    SentToArchiveDate: "2017-06-19",
    Year: "2017"};

  const phoneCallsXmlns = 'urn:eas-samples:en:xsd:phonecalls.1.0';
  const phoneCallsHoldingName = 'PhoneCalls';
  const phoneCallsXsdSchema = '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\
    <!--\
      ~ Copyright (c) 2015.  EMC Corporation. All Rights Reserved.\
  ~ EMC Confidential: Restricted Internal Distribution\
  -->\
\
  <xs:schema xmlns:xs=\"http://www.w3.org/2001/XMLSchema\" targetNamespace=\"urn:eas-samples:en:xsd:phonecalls.1.0\"\
  version=\"1.0\" elementFormDefault=\"qualified\">\
    <xs:element name=\"Calls\">\
    <xs:complexType>\
  <xs:sequence maxOccurs=\"unbounded\">\
    <xs:element name=\"Call\">\
    <xs:complexType>\
  <xs:sequence>\
  <xs:element name=\"SentToArchiveDate\" type=\"xs:date\" nillable=\"false\"/>\
    <xs:element name=\"Year\">\
    <xs:simpleType>\
  <xs:restriction base=\"xs:positiveInteger\">\
    <xs:minInclusive value=\"1\"/>\
    <xs:totalDigits value=\"4\"/>\
    </xs:restriction>\
  </xs:simpleType>\
  </xs:element>\
  <xs:element name=\"CallStartDate\" type=\"xs:dateTime\" nillable=\"false\"/>\
  <xs:element name=\"CallEndDate\" type=\"xs:dateTime\"/>\
  <xs:element name=\"CallFromPhoneNumber\">\
  <xs:simpleType>\
  <xs:restriction base=\"xs:positiveInteger\">\
  <xs:minInclusive value=\"1\"/>\
  <xs:totalDigits value=\"11\"/>\
  </xs:restriction>\
  </xs:simpleType>\
  </xs:element>\
  <xs:element name=\"CallToPhoneNumber\" nillable=\"false\">\
  <xs:simpleType>\
  <xs:restriction base=\"xs:positiveInteger\">\
  <xs:minInclusive value=\"1\"/>\
  <xs:totalDigits value=\"11\"/>\
  </xs:restriction>\
  </xs:simpleType>\
  </xs:element>\
  <xs:element name=\"CustomerID\" nillable=\"false\">\
  <xs:simpleType>\
  <xs:restriction base=\"xs:positiveInteger\">\
  <xs:totalDigits value=\"11\"/>\
  <xs:minInclusive value=\"1\"/>\
  </xs:restriction>\
  </xs:simpleType>\
  </xs:element>\
  <xs:element name=\"CustomerLastName\" nillable=\"false\">\
  <xs:simpleType>\
  <xs:restriction base=\"xs:normalizedString\">\
  <xs:minLength value=\"1\"/>\
  <xs:maxLength value=\"32\"/>\
  </xs:restriction>\
  </xs:simpleType>\
  </xs:element>\
  <xs:element name=\"CustomerFirstName\" nillable=\"false\">\
  <xs:simpleType>\
  <xs:restriction base=\"xs:normalizedString\">\
  <xs:minLength value=\"1\"/>\
  <xs:maxLength value=\"32\"/>\
  </xs:restriction>\
  </xs:simpleType>\
  </xs:element>\
  <xs:element name=\"RepresentativeID\" nillable=\"false\">\
  <xs:simpleType>\
  <xs:restriction base=\"xs:positiveInteger\">\
  <xs:minInclusive value=\"1\"/>\
  <xs:totalDigits value=\"7\"/>\
  </xs:restriction>\
  </xs:simpleType>\
  </xs:element>\
  <xs:element name=\"Attachments\" nillable=\"false\" minOccurs=\"1\">\
  <xs:complexType>\
  <xs:sequence maxOccurs=\"unbounded\" minOccurs=\"0\">\
  <xs:element name=\"Attachment\">\
  <xs:complexType>\
  <xs:sequence>\
  <xs:element name=\"name\" nillable=\"false\" maxOccurs=\"1\">\
  <xs:simpleType>\
  <xs:restriction base=\"xs:normalizedString\">\
  <xs:minLength value=\"1\"/>\
  <xs:maxLength value=\"32\"/>\
  </xs:restriction>\
  </xs:simpleType>\
  </xs:element>\
  <xs:element name=\"size\" nillable=\"false\" minOccurs=\"1\"\
  maxOccurs=\"1\">\
  <xs:simpleType>\
  <xs:restriction base=\"xs:positiveInteger\">\
  <xs:minInclusive value=\"1\"/>\
  </xs:restriction>\
  </xs:simpleType>\
  </xs:element>\
  <xs:element name=\"mediaType\" nillable=\"false\" minOccurs=\"1\"\
  maxOccurs=\"1\">\
  <xs:simpleType>\
  <xs:restriction base=\"xs:normalizedString\">\
  <xs:minLength value=\"1\"/>\
  <xs:maxLength value=\"32\"/>\
  </xs:restriction>\
  </xs:simpleType>\
  </xs:element>\
  <xs:element name=\"createdBy\" nillable=\"false\" maxOccurs=\"1\">\
  <xs:simpleType>\
  <xs:restriction base=\"xs:normalizedString\">\
  <xs:minLength value=\"1\"/>\
  <xs:maxLength value=\"32\"/>\
  </xs:restriction>\
  </xs:simpleType>\
  </xs:element>\
  <xs:element name=\"creationDate\" type=\"xs:dateTime\"\
  nillable=\"false\"/>\
  </xs:sequence>\
  </xs:complexType>\
  </xs:element>\
  </xs:sequence>\
  </xs:complexType>\
  </xs:element>\
  </xs:sequence>\
  </xs:complexType>\
  </xs:element>\
  </xs:sequence>\
  </xs:complexType>\
  </xs:element>\
\
  </xs:schema>';

  const phoneCallsPdi = '<?xml version=\"1.0\" encoding=\"utf-8\"?><Calls xmlns=\"urn:eas-samples:en:xsd:phonecalls.1.0\"><Call><SentToArchiveDate>2017-06-19</SentToArchiveDate><Year>2017</Year><CallStartDate>2016-08-09T16:57:23.329+05:30</CallStartDate><CallEndDate>2016-08-09T16:57:23.329+05:30</CallEndDate><CallFromPhoneNumber>23456342123</CallFromPhoneNumber><CallToPhoneNumber>43958302948</CallToPhoneNumber><CustomerID>431</CustomerID><CustomerLastName>LastName</CustomerLastName><CustomerFirstName>FirstName</CustomerFirstName><RepresentativeID>58</RepresentativeID><Attachments/></Call></Calls>';
  const phoneCallsSip = '<?xml version="1.0" encoding="utf-8"?><sip xmlns="urn:x-emc:ia:schema:sip:1.0"><dss><holding>PhoneCalls</holding><id>2daf3523-6510-4881-ac05-0a277334fe13</id><pdi_schema>urn:eas-samples:en:xsd:phonecalls.1.0</pdi_schema><production_date>2016-08-09T16:57:35.873+05:30</production_date><base_retention_date>2016-08-09T16:57:34.469+05:30</base_retention_date><producer>PhoneCalls</producer><entity>PhoneCalls</entity><priority>0</priority><application>PhoneCalls</application></dss><production_date>2016-08-09T16:57:35.873+05:30</production_date><seqno>1</seqno><is_last>true</is_last><aiu_count>1</aiu_count><page_count>0</page_count></sip>';

  it('should build pdi.xml without attachments for PhoneCalls', () => {
    pdiService.buildPdi(xsdParserService.parse(phoneCallsXsdSchema).elements[0], phoneCallsXmlns, phoneCallsFormValue, [])
      .subscribe(res => expect(res).toEqual(phoneCallsPdi));
  });

  it('should build sip.xml for PhoneCalls', () => {
    pdiService.buildSip(phoneCallsHoldingName, phoneCallsXmlns)
      .subscribe(res => expect(res).toEqual(phoneCallsSip));
  });

});


