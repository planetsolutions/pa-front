import {TestBed, inject} from '@angular/core/testing';
import {XsdParserService} from './xsd.parser.service';
import {Element} from '../../index';
import 'rxjs/add/operator/count';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';


describe('XsdParserService', () => {
  let xsdParserService: XsdParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [XsdParserService]
    });
  });

  beforeEach(inject([XsdParserService], (service) => {
    xsdParserService = service;
  }));


  // suppress long lines inspection
  //noinspection TsLint
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

  const russianIAStringResult = ' Name = Schema; Type = xs:schema; Elements:  Name = documents; Type = xs:complexType; Elements:  Name = document; Type = xs:complexType; Elements:  Name = docId; Type = xs:string; Elements: , Name = name; Type = xs:string; Elements: , Name = author; Type = xs:string; Elements: , Name = creationDate; Type = xs:dateTime; Elements: , Name = version; Type = xs:int; Elements: , Name = attachments; Type = xs:complexType; Elements:  Name = attachment; Type = xs:complexType; Elements:  Name = name; Type = xs:string; Elements: , Name = size; Type = xs:long; Elements: , Name = mediaType; Type = xs:string; Elements: , Name = createdBy; Type = xs:string; Elements: , Name = creationDate; Type = xs:dateTime; Elements: ';
  const phoneCallsStringResult = ' Name = Schema; Type = xs:schema; Elements:  Name = Calls; Type = xs:complexType; Elements:  Name = Call; Type = xs:complexType; Elements:  Name = SentToArchiveDate; Type = xs:date; Elements: , Name = Year; Type = xs:positiveInteger; Elements: , Name = CallStartDate; Type = xs:dateTime; Elements: , Name = CallEndDate; Type = xs:dateTime; Elements: , Name = CallFromPhoneNumber; Type = xs:positiveInteger; Elements: , Name = CallToPhoneNumber; Type = xs:positiveInteger; Elements: , Name = CustomerID; Type = xs:positiveInteger; Elements: , Name = CustomerLastName; Type = xs:normalizedString; Elements: , Name = CustomerFirstName; Type = xs:normalizedString; Elements: , Name = RepresentativeID; Type = xs:positiveInteger; Elements: , Name = Attachments; Type = xs:complexType; Elements:  Name = Attachment; Type = xs:complexType; Elements:  Name = name; Type = xs:normalizedString; Elements: , Name = size; Type = xs:positiveInteger; Elements: , Name = mediaType; Type = xs:normalizedString; Elements: , Name = createdBy; Type = xs:normalizedString; Elements: , Name = creationDate; Type = xs:dateTime; Elements: ';

  it('should parse RussianIA xsd', () => {
      expect(xsdParserService.parse(russianIAXsdSchema).toString()).toEqual(russianIAStringResult);
    });

  it('should parse PhoneCalls xsd', () => {
    expect(xsdParserService.parse(phoneCallsXsdSchema).toString()).toEqual(phoneCallsStringResult);
  });
});
