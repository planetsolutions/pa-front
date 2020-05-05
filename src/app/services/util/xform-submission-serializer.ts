export class XFormSubmissionSerializer {
  public serialize(submission: XMLDocument) {
    const data = submission.getElementsByTagName('data').item(0);
    const criteria: SubmissionCriteria[] = [];

    for (let i = 0; i < data.childNodes.length; i++) {
      const criterion = data.childNodes.item(i);

      if (criterion.nodeType === Node.TEXT_NODE) {
        continue;
      }

      criteria.push(this.xformParseCriterion(criterion));
    }

    return this.serializeCriteria(criteria);
  }

  private xformParseCriterion(criterion: Node): SubmissionCriteria {
    const result = new SubmissionCriteria(criterion.nodeName);

    if (!criterion.hasChildNodes || criterion.childNodes.length === 0) {
      result.value.push(criterion.nodeValue || criterion['innerHTML'] || '');
    } else {
      for (let i = 0; i < criterion.childNodes.length; i++) {
        const child = criterion.childNodes.item(i);

        switch (child.nodeName) {
          case 'from':
            result.from = (child.firstChild) ? child.firstChild.nodeValue : child['innerHTML'];
            break;
          case 'to':
            result.to = (child.firstChild) ? child.firstChild.nodeValue : child['innerHTML'];
            break;
          case 'value':
            if (child.firstChild) {
              result.value.push(child.firstChild.nodeValue);
            } else if (child['innerHTML'] !== '') {
              result.value.push(child['innerHTML']);
            }
            break;
          case '#text':
            result.value.push(child.nodeValue);
            break;
          default:
            console.warn(`Unrecognized child node: ${child.nodeName}`);
            break;
        }
      }
    }

    if (result.from !== null || result.to !== null) {
      result.value = null;
    }

    if (result.from !== null && result.to !== null) {
      result.operator = 'BETWEEN';
    } else if (result.from !== null) {
      result.operator = 'GREATER_OR_EQUAL';
    } else if (result.to !== null) {
      result.operator = 'LESS_OR_EQUAL';
    } else {
      result.operator = 'CONTAINS';
      if (criterion.hasAttributes) {
        const attr = criterion.attributes.getNamedItem('operator');
        if (attr !== null && attr.value !== '') {
          result.operator = attr.value;
        }
      }
    }

    return result;
  }

  private serializeCriteria(criteria: SubmissionCriteria[]): string {
    const result: string[] = ['<data>'];

    for (const criterion of criteria) {
      result.push('<criterion>');

      result.push(`<name>${criterion.name}</name>`);
      result.push(`<operator>${criterion.operator}</operator>`);
      if (criterion.from !== null) {
        result.push('<from>');
        if (criterion.from === '') {
          result.push('<value />');
        } else {
          result.push(`<value>${criterion.from}</value>`);
        }
        result.push('</from>');
      }

      if (criterion.to !== null) {
        result.push('<to>');
        if (criterion.to === '') {
          result.push('<value />');
        } else {
          result.push(`<value>${criterion.to}</value>`);
        }
        result.push('</to>');
      }

      if (criterion.value) {
        if (criterion.value.length === 0) {
          result.push('<value />');
        } else {
          for (const value of criterion.value) {
            result.push(`<value>${value}</value>`);
          }
        }
      }

      result.push('</criterion>');
    }

    result.push('</data>');
    return result.join('');
  }
}

class SubmissionCriteria {
  public name: string;
  public from: string = null;
  public to: string = null;
  public value: any[] = [];
  public operator: string = null;

  constructor(name: string) {
    this.name = name;
  }
}
