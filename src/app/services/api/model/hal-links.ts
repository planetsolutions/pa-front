import { IAHal } from './ia-hal';
import IAHalName = IAHal.IAHalName;

export class HalLinkedObject {
  public uuid: string;
  public links: Map<IAHalName, string> = new Map();

  constructor({_links}: {_links: [any]}) {
    //noinspection TsLint
    for (const link in _links) {
      this.links.set(link as IAHalName, _links[link].href);
    }

    this.uuid = this.extractLinkElement(IAHal.SELF, -1);
  }

  protected extractLinkElement(name: IAHalName, index: number): string {
    const link = this.links.get(name);
    if (!link) {
      return null;
    }

    const parts = link.split('/');
    return parts[(parts.length + index) % parts.length];
  }
}
