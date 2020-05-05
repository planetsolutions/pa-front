/**
 * Created by kokora on 5/12/17.
 */

export interface EmbeddedPage {
  _embedded: any;
  _links: any;
  page: EmbeddedPageDetails;
}

interface EmbeddedPageDetails {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}
