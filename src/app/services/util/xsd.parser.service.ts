import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Element } from '../../index';

/*
 * xsd - string from xsd
 * xsdSchema - DOM object with xsd
 * tree - object containing structure of elements in xsd
 * complexTypes - types, which are described separately from structure description
 */

@Injectable()
export class XsdParserService {
  private xsd: any;
  private xsSchema: any;
  private tree: Element;
  private complexTypes = [];

  public parse(xsdString: string): any {
    this.complexTypes = [];
    const parser = new DOMParser();
    const parsedXsd = parser.parseFromString(xsdString, 'application/xml');
    const childNodes = parsedXsd.childNodes;
    const numberOfChildNodes = childNodes.length;
    /*
     * Receive xsd schema
     */
    for (let i = 0; i < numberOfChildNodes; i++) {
      if (childNodes[i].nodeType === 1) {
        this.xsSchema = childNodes[i];
      }
    }
    this.tree = new Element('Schema', 'xs:schema');
    this.recursiveParse(this.xsSchema, this.tree);
    return this.tree;
  }

  private recursiveParse(xsdNode: any, element: Element) {
    const childNodes = xsdNode.childNodes;
    const numberOfElements = childNodes.length;
    if (numberOfElements === 0) {
      return;
    }
    const elements = [];
    /*
     * Receive elements of xsd schema (only xs:element)
     */
    for (let i = 0; i < numberOfElements; i++) {
      if (childNodes[i].nodeName === 'xs:element') {
        elements.push(childNodes[i]);
        element.elements.push(new Element());
      }
    }
    /*
     * Receive complexTypes of xsd schema (only xs:complexType)
     */
    for (let i = 0; i < numberOfElements; i++) {
      if (childNodes[i].nodeName === 'xs:complexType') {
        this.complexTypes.push(childNodes[i]);
      }
    }
    /*
     * Parse xs:elements
     */
    for (let i = 0; i < elements.length; i++) {
      this.parseElement(elements[i], element.elements[i]);
    }
  }

  /*
   * Element can have 3 types:
   *      - noType (i.e. PhoneCalls, description of type is inside element)
   *      - nativeType (i.e. xs:string, xs:number, etc.)
   *      - complexType (it's a link to one of complex types that we have parsed earlier)
   */

  private parseElement(xsdNode: any, element: Element) {
    let type = 'noType';
    const regexpNativeType = /^xs:/;
    const attributeType = xsdNode.attributes['type'];
    if (attributeType !== undefined) {
      type = attributeType.nodeValue;
    }

    // If element has a description of type inside
    if (type === 'noType') {
      const childNodes = xsdNode.childNodes;
      const numberOfElements = childNodes.length;
      for (let i = 0; i < numberOfElements; i++) {
        if (childNodes[i].nodeName === 'xs:complexType') {
          element.type = 'xs:complexType';
          element.name = xsdNode.attributes['name'].nodeValue;
          this.parseComplexType(childNodes[i], element);
        }
        if (childNodes[i].nodeName === 'xs:simpleType') {
          element.type = 'xs:complexType';
          element.name = xsdNode.attributes['name'].nodeValue;
          this.parseSimpleType(xsdNode, childNodes[i], element);
        }
      }
      // If element has nativeType (i.e. xs:number, xs:string etc.)
    } else if (regexpNativeType.test(type)) {
      element.type = 'xs:complexType';
      element.name = xsdNode.attributes['name'].nodeValue;
      this.parseNativeType(xsdNode, element);
      // If element has complexType, we have description of all complexTypes in complexTypes[]
    } else {
      for (let i = 0; i < this.complexTypes.length; i++) {
        if (this.complexTypes[i].attributes['name'].nodeValue === type) {
          element.type = 'xs:complexType';
          element.name = xsdNode.attributes['name'].nodeValue;
          this.parseComplexType(this.complexTypes[i], element);
        }
      }
    }
  }

  private parseComplexType(xsdNode: any, element: Element) {
    const childNodes = xsdNode.childNodes;
    const numberOfElements = childNodes.length;
    for (let i = 0; i < numberOfElements; i++) {
      if (childNodes[i].nodeName === 'xs:sequence') {
        this.parseSequence(childNodes[i], element);
      }
      if (childNodes[i].nodeName === 'xs:complexContent') {
        this.parseComplexContent(xsdNode, childNodes[i], element);
      }
    }
  }

  private parseSequence(xsdNode: any, element: Element) {
    const childNodes = xsdNode.childNodes;
    const numberOfElements = childNodes.length;
    const elements = [];
    for (let i = 0; i < numberOfElements; i++) {
      if (childNodes[i].nodeName === 'xs:element') {
        elements.push(childNodes[i]);
        element.elements.push(new Element());
      }
    }
    for (let i = 0; i < elements.length; i++) {
      this.parseElement(elements[i], element.elements[i]);
    }
  }

  private parseNativeType(xsdNode: any, element: Element) {
    const name = xsdNode.attributes['name'].nodeValue;
    const type = xsdNode.attributes['type'].nodeValue;
    element.name = name;
    element.type = type;
  }

  private parseSimpleType(parentNode: any, xsdNode: any, element: Element) {
    const name = parentNode.attributes['name'].nodeValue;
    let type = '';
    let restrictions;
    const childNodes = xsdNode.childNodes;
    const numberOfElements = childNodes.length;
    for (let i = 0; i < numberOfElements; i++) {
      if (childNodes[i].nodeName === 'xs:restriction') {
        type = childNodes[i].attributes['base'].nodeValue;
        restrictions = childNodes[i].childNodes;
      }
    }
    element.name = name;
    element.type = type;
    if (restrictions.length !== 0) {
      this.parseRestrictions(restrictions, element);
    }
  }

  // TODO: Parse 'xs:ComplexContent'
  private parseComplexContent(parentNode: any, xsdNode: any, element: Element) {
    console.log('ComplexContent is not parsed! Go to xsd.parser.service.ts and code this method');
  }

  private parseRestrictions(restrictions: any, element: Element) {
    const numberOfRestrictions = restrictions.length;
    for (let i = 0; i < numberOfRestrictions; i++) {
      if (restrictions[i].nodeName !== '#text') {
        this.applyRestrictionToElement(restrictions[i], element);
      }
    }
  }

  private applyRestrictionToElement(restriction: any, element: Element) {
    switch (restriction.nodeName) {
      case 'xs:minInclusive':
        element.min = restriction.attributes['value'].nodeValue;
        break;
      case 'xs:minLength':
        element.minLength = restriction.attributes['value'].nodeValue;
        break;
      case 'xs:totalDigits':
        element.maxLength = restriction.attributes['value'].nodeValue;
        break;
      case 'xs:maxLength':
        element.maxLength = restriction.attributes['value'].nodeValue;
        break;
    }
  }
}
